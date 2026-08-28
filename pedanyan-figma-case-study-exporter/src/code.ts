type ExportOptions = {
  includeHidden: boolean;
  includeConfiguredExports: boolean;
  includeVectors: boolean;
  includePreview: boolean;
  includeVariables: boolean;
  includeCss: boolean;
};

type ExportContext = {
  options: ExportOptions;
  imageHashes: Set<string>;
  styleIds: Set<string>;
  configuredExportNodes: SceneNode[];
  vectorNodes: SceneNode[];
  nodeCount: number;
};

type ExportedFile = {
  path: string;
  bytes: Uint8Array;
  source: string;
};

const ROOT_TYPES = new Set<SceneNode["type"]>(["FRAME", "SECTION", "COMPONENT", "INSTANCE", "GROUP"]);
const VECTOR_TYPES = new Set<SceneNode["type"]>(["VECTOR", "BOOLEAN_OPERATION", "STAR", "POLYGON", "ELLIPSE", "LINE"]);

figma.showUI(__html__, { width: 390, height: 620, themeColors: true });

function slug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "untitled";
}

function nodeToken(node: BaseNode) {
  return node.id.replace(/:/g, "-");
}

function cloneValue(value: unknown, depth = 0): unknown {
  if (value === figma.mixed) return "__MIXED__";
  if (value === null || value === undefined) return value ?? null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "symbol" || typeof value === "function") return undefined;
  if (depth > 12) return "__MAX_DEPTH__";
  if (Array.isArray(value)) return value.map((item) => cloneValue(item, depth + 1));
  if (value instanceof Uint8Array) return Array.from(value);
  if (typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      const cloned = cloneValue(item, depth + 1);
      if (cloned !== undefined) output[key] = cloned;
    }
    return output;
  }
  return String(value);
}

function readProperty(node: SceneNode, property: string) {
  try {
    return cloneValue((node as unknown as Record<string, unknown>)[property]);
  } catch {
    return undefined;
  }
}

function collectPaintReferences(value: unknown, context: ExportContext) {
  if (!Array.isArray(value)) return;
  for (const paint of value as ReadonlyArray<Paint>) {
    if (paint?.type === "IMAGE" && paint.imageHash) context.imageHashes.add(paint.imageHash);
  }
}

function collectStyleReference(value: unknown, context: ExportContext) {
  if (typeof value === "string" && value) context.styleIds.add(value);
}

const COMMON_PROPERTIES = [
  "visible",
  "locked",
  "opacity",
  "blendMode",
  "isMask",
  "maskType",
  "rotation",
  "x",
  "y",
  "width",
  "height",
  "minWidth",
  "maxWidth",
  "minHeight",
  "maxHeight",
  "relativeTransform",
  "absoluteTransform",
  "absoluteBoundingBox",
  "absoluteRenderBounds",
  "constraints",
  "layoutAlign",
  "layoutGrow",
  "layoutPositioning",
  "layoutSizingHorizontal",
  "layoutSizingVertical",
  "layoutMode",
  "layoutWrap",
  "primaryAxisSizingMode",
  "counterAxisSizingMode",
  "primaryAxisAlignItems",
  "counterAxisAlignItems",
  "counterAxisAlignContent",
  "itemSpacing",
  "counterAxisSpacing",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "clipsContent",
  "overflowDirection",
  "numberOfFixedChildren",
  "strokesIncludedInLayout",
  "itemReverseZIndex",
  "fills",
  "strokes",
  "strokeWeight",
  "strokeAlign",
  "strokeTopWeight",
  "strokeRightWeight",
  "strokeBottomWeight",
  "strokeLeftWeight",
  "strokeCap",
  "strokeJoin",
  "dashPattern",
  "effects",
  "cornerRadius",
  "topLeftRadius",
  "topRightRadius",
  "bottomLeftRadius",
  "bottomRightRadius",
  "cornerSmoothing",
  "exportSettings",
  "reactions",
  "componentProperties",
  "variantProperties",
  "description",
  "hyperlink",
  "boundVariables",
  "resolvedVariableModes",
  "inferredAutoLayout"
];

const STYLE_PROPERTIES = ["fillStyleId", "strokeStyleId", "effectStyleId", "gridStyleId", "textStyleId"];

const TEXT_PROPERTIES = [
  "characters",
  "fontName",
  "fontSize",
  "fontWeight",
  "textCase",
  "textDecoration",
  "letterSpacing",
  "lineHeight",
  "paragraphIndent",
  "paragraphSpacing",
  "listSpacing",
  "textAlignHorizontal",
  "textAlignVertical",
  "textAutoResize",
  "textTruncation",
  "maxLines",
  "autoRename",
  "hasMissingFont"
];

async function serializeNode(node: SceneNode, context: ExportContext, parentIsVector = false): Promise<Record<string, unknown> | null> {
  if (!context.options.includeHidden && node.visible === false) return null;

  context.nodeCount += 1;
  if (context.nodeCount % 40 === 0) {
    figma.ui.postMessage({ type: "progress", message: `Reading ${context.nodeCount} layers…` });
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  const output: Record<string, unknown> = {
    id: node.id,
    name: node.name,
    type: node.type
  };

  for (const property of COMMON_PROPERTIES) {
    const value = readProperty(node, property);
    if (value !== undefined) output[property] = value;
  }

  for (const property of STYLE_PROPERTIES) {
    const raw = (node as unknown as Record<string, unknown>)[property];
    collectStyleReference(raw, context);
    const value = cloneValue(raw);
    if (value !== undefined) output[property] = value;
  }

  collectPaintReferences((node as unknown as { fills?: unknown }).fills, context);
  collectPaintReferences((node as unknown as { strokes?: unknown }).strokes, context);

  if (node.type === "TEXT") {
    for (const property of TEXT_PROPERTIES) {
      const value = readProperty(node, property);
      if (value !== undefined) output[property] = value;
    }
    try {
      output.styledTextSegments = cloneValue(
        node.getStyledTextSegments([
          "fontName",
          "fontSize",
          "fontWeight",
          "textCase",
          "textDecoration",
          "letterSpacing",
          "lineHeight",
          "fills",
          "textStyleId",
          "fillStyleId",
          "hyperlink"
        ])
      );
    } catch {
      output.styledTextSegments = [];
    }
  }

  if (node.type === "INSTANCE") {
    try {
      const mainComponent = await node.getMainComponentAsync();
      output.mainComponent = mainComponent
        ? { id: mainComponent.id, key: mainComponent.key, name: mainComponent.name }
        : null;
    } catch {
      output.mainComponent = null;
    }
  }

  if (context.options.includeCss && "getCSSAsync" in node) {
    try {
      output.css = cloneValue(await (node as SceneNode & { getCSSAsync(): Promise<Record<string, string>> }).getCSSAsync());
    } catch {
      output.css = null;
    }
  }

  const exportSettings = (node as unknown as { exportSettings?: readonly ExportSettings[] }).exportSettings;
  if (context.options.includeConfiguredExports && exportSettings?.length) context.configuredExportNodes.push(node);

  const isVector = VECTOR_TYPES.has(node.type);
  if (context.options.includeVectors && isVector && !parentIsVector) context.vectorNodes.push(node);

  if ("children" in node) {
    const children: Record<string, unknown>[] = [];
    for (const child of node.children) {
      const serialized = await serializeNode(child, context, parentIsVector || isVector);
      if (serialized) children.push(serialized);
    }
    output.children = children;
  }

  return output;
}

function detectImageExtension(bytes: Uint8Array) {
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (String.fromCharCode(...bytes.slice(0, 3)) === "GIF") return "gif";
  if (String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "webp";
  return "bin";
}

function exportExtension(format: ExportSettings["format"]) {
  return format.toLowerCase();
}

function sendFile(file: ExportedFile) {
  figma.ui.postMessage({ type: "file", path: file.path, bytes: file.bytes, source: file.source });
}

async function exportImageFills(context: ExportContext) {
  const manifest: Record<string, string> = {};
  let index = 0;
  for (const hash of context.imageHashes) {
    index += 1;
    figma.ui.postMessage({ type: "progress", message: `Exporting image ${index} of ${context.imageHashes.size}…` });
    const image = figma.getImageByHash(hash);
    if (!image) continue;
    const bytes = await image.getBytesAsync();
    const extension = detectImageExtension(bytes);
    const path = `assets/images/${hash}.${extension}`;
    manifest[hash] = path;
    sendFile({ path, bytes, source: `image-fill:${hash}` });
  }
  return manifest;
}

async function exportConfiguredNodes(nodes: SceneNode[]) {
  const exported: Array<Record<string, unknown>> = [];
  let count = 0;
  for (const node of nodes) {
    const settings = (node as unknown as { exportSettings?: readonly ExportSettings[] }).exportSettings || [];
    for (const setting of settings) {
      count += 1;
      figma.ui.postMessage({ type: "progress", message: `Exporting configured asset ${count}…` });
      try {
        const bytes = await node.exportAsync(setting);
        const suffix = setting.suffix ? `-${slug(setting.suffix)}` : "";
        const path = `assets/exports/${slug(node.name)}-${nodeToken(node)}${suffix}.${exportExtension(setting.format)}`;
        sendFile({ path, bytes, source: node.id });
        exported.push({ nodeId: node.id, nodeName: node.name, path, setting: cloneValue(setting) });
      } catch (error) {
        exported.push({ nodeId: node.id, nodeName: node.name, error: String(error), setting: cloneValue(setting) });
      }
    }
  }
  return exported;
}

async function exportVectorNodes(nodes: SceneNode[]) {
  const exported: Array<Record<string, unknown>> = [];
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    figma.ui.postMessage({ type: "progress", message: `Exporting vector ${index + 1} of ${nodes.length}…` });
    try {
      const bytes = await node.exportAsync({ format: "SVG", svgOutlineText: false, svgIdAttribute: true });
      const path = `assets/vectors/${slug(node.name)}-${nodeToken(node)}.svg`;
      sendFile({ path, bytes, source: node.id });
      exported.push({ nodeId: node.id, nodeName: node.name, path });
    } catch (error) {
      exported.push({ nodeId: node.id, nodeName: node.name, error: String(error) });
    }
  }
  return exported;
}

async function serializeStyles(styleIds: Set<string>) {
  const styles: Record<string, unknown>[] = [];
  for (const id of styleIds) {
    try {
      const style = await figma.getStyleByIdAsync(id);
      if (!style) continue;
      styles.push({
        id: style.id,
        key: style.key,
        name: style.name,
        type: style.type,
        description: style.description,
        remote: style.remote
      });
    } catch {
      styles.push({ id, unavailable: true });
    }
  }
  return styles;
}

async function serializeVariables() {
  try {
    const [collections, variables] = await Promise.all([
      figma.variables.getLocalVariableCollectionsAsync(),
      figma.variables.getLocalVariablesAsync()
    ]);
    return {
      collections: collections.map((collection) => ({
        id: collection.id,
        key: collection.key,
        name: collection.name,
        modes: cloneValue(collection.modes),
        defaultModeId: collection.defaultModeId,
        variableIds: cloneValue(collection.variableIds),
        remote: collection.remote,
        hiddenFromPublishing: collection.hiddenFromPublishing
      })),
      variables: variables.map((variable) => ({
        id: variable.id,
        key: variable.key,
        name: variable.name,
        description: variable.description,
        variableCollectionId: variable.variableCollectionId,
        resolvedType: variable.resolvedType,
        valuesByMode: cloneValue(variable.valuesByMode),
        scopes: cloneValue(variable.scopes),
        codeSyntax: cloneValue(variable.codeSyntax),
        remote: variable.remote,
        hiddenFromPublishing: variable.hiddenFromPublishing
      }))
    };
  } catch (error) {
    return { error: String(error), collections: [], variables: [] };
  }
}

async function exportSelection(options: ExportOptions) {
  const selection = figma.currentPage.selection;
  if (selection.length !== 1 || !ROOT_TYPES.has(selection[0].type)) {
    throw new Error("Select exactly one frame, section, component, instance, or group.");
  }

  const root = selection[0];
  const context: ExportContext = {
    options,
    imageHashes: new Set(),
    styleIds: new Set(),
    configuredExportNodes: [],
    vectorNodes: [],
    nodeCount: 0
  };

  figma.ui.postMessage({ type: "start", name: root.name });
  const document = await serializeNode(root, context);
  if (!document) throw new Error("The selected frame is hidden and hidden layers are excluded.");

  const imageManifest = await exportImageFills(context);
  const configuredExports = options.includeConfiguredExports
    ? await exportConfiguredNodes(context.configuredExportNodes)
    : [];
  const vectorExports = options.includeVectors ? await exportVectorNodes(context.vectorNodes) : [];

  let previewPath: string | null = null;
  if (options.includePreview) {
    figma.ui.postMessage({ type: "progress", message: "Rendering reference preview…" });
    const previewWidth = Math.max(1, Math.min(1440, Math.round(root.width)));
    const bytes = await root.exportAsync({ format: "PNG", constraint: { type: "WIDTH", value: previewWidth } });
    previewPath = `screenshots/${slug(root.name)}-${nodeToken(root)}.png`;
    sendFile({ path: previewPath, bytes, source: root.id });
  }

  const payload = {
    schemaVersion: "1.0.0",
    exportedAt: new Date().toISOString(),
    source: {
      fileName: figma.root.name,
      pageId: figma.currentPage.id,
      pageName: figma.currentPage.name,
      rootNodeId: root.id,
      rootNodeName: root.name,
      editorType: figma.editorType
    },
    options,
    stats: {
      nodeCount: context.nodeCount,
      imageFillCount: context.imageHashes.size,
      configuredExportCount: configuredExports.length,
      vectorExportCount: vectorExports.length
    },
    assets: {
      images: imageManifest,
      configuredExports,
      vectorExports,
      preview: previewPath
    },
    styles: await serializeStyles(context.styleIds),
    variables: options.includeVariables ? await serializeVariables() : null,
    document
  };

  figma.ui.postMessage({
    type: "done",
    name: `${slug(root.name)}-${nodeToken(root)}`,
    json: JSON.stringify(payload, null, 2),
    stats: payload.stats
  });
}

function sendSelection() {
  const selection = figma.currentPage.selection;
  const node = selection.length === 1 ? selection[0] : null;
  figma.ui.postMessage({
    type: "selection",
    valid: Boolean(node && ROOT_TYPES.has(node.type)),
    count: selection.length,
    node: node
      ? { id: node.id, name: node.name, type: node.type, width: Math.round(node.width), height: Math.round(node.height) }
      : null
  });
}

figma.ui.onmessage = async (message: { type: string; options?: ExportOptions }) => {
  if (message.type === "export" && message.options) {
    try {
      await exportSelection(message.options);
    } catch (error) {
      figma.ui.postMessage({ type: "error", message: error instanceof Error ? error.message : String(error) });
    }
  }
  if (message.type === "resize") figma.ui.resize(390, 620);
};

figma.on("selectionchange", sendSelection);
sendSelection();
