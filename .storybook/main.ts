import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-vitest"],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  viteFinal: async (baseConfig) =>
    mergeConfig(baseConfig, {
      resolve: {
        dedupe: ["three"]
      }
    })
};

export default config;
