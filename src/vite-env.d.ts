/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** GA4 Measurement ID, e.g. G-XXXXXXXXXX. Unset disables analytics. */
  readonly VITE_GA_MEASUREMENT_ID?: string;
  /** "1" lets localhost report, tagged debug_mode so it lands in DebugView. */
  readonly VITE_GA_DEBUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
