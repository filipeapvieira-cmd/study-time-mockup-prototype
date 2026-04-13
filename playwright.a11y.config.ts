import { defineConfig, devices } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const defaultPort = process.env.A11Y_PORT ?? "3210";
const baseURL = process.env.A11Y_BASE_URL ?? `http://127.0.0.1:${defaultPort}`;
const useManagedWebServer = !process.env.A11Y_BASE_URL;

export default defineConfig({
  testDir: "./tests/a11y",
  fullyParallel: true,
  timeout: 120_000,
  reporter: [
    ["list"],
    ["json", { outputFile: "artifacts/a11y/raw/playwright-results.json" }],
  ],
  use: {
    baseURL,
    trace: "off",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 7"],
      },
    },
  ],
  ...(useManagedWebServer
    ? {
        webServer: {
          command: `pnpm dev --port ${defaultPort}`,
          url: baseURL,
          reuseExistingServer: true,
          timeout: 180_000,
        },
      }
    : {}),
});
