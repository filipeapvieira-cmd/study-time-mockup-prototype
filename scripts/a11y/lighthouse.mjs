import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const ROUTES = [
  { id: "marketing-home", path: "/" },
  { id: "dashboard", path: "/dashboard" },
  { id: "analytics", path: "/analytics" },
  { id: "log-session", path: "/log-session" },
  { id: "session-history", path: "/session-history" },
  { id: "editor", path: "/editor" },
];

const OUTPUT_DIR = path.join(process.cwd(), "artifacts", "a11y", "raw", "lighthouse");
const DEFAULT_PORT = process.env.A11Y_PORT ?? "3210";
const EXPLICIT_BASE_URL = process.env.A11Y_BASE_URL ?? null;
const DEFAULT_BASE_URL = `http://127.0.0.1:${DEFAULT_PORT}`;
const PnpmBin = "pnpm";
const SPAWN_OPTIONS = {
  stdio: "inherit",
  shell: process.platform === "win32",
};

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, SPAWN_OPTIONS);
    child.on("close", (code) => resolve(code ?? 1));
  });
}

async function waitForServer(url, timeoutMs = 180_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Keep waiting.
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error(`Timed out waiting for server at ${url}`);
}

async function isReachable(url) {
  try {
    const response = await fetch(url, { redirect: "manual" });
    return response.status >= 200 && response.status < 500;
  } catch {
    return false;
  }
}

async function readAccessibilityScore(filePath) {
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  const score = parsed?.categories?.accessibility?.score;
  return typeof score === "number" ? Math.round(score * 100) : null;
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  let baseUrl = EXPLICIT_BASE_URL;
  if (!baseUrl) {
    for (const candidate of ["http://127.0.0.1:3000", DEFAULT_BASE_URL]) {
      if (await isReachable(candidate)) {
        baseUrl = candidate;
        break;
      }
    }
  }

  const manageServer = !baseUrl;
  baseUrl = baseUrl ?? DEFAULT_BASE_URL;

  let serverProcess = null;
  if (manageServer) {
    serverProcess = spawn(PnpmBin, ["dev", "--port", DEFAULT_PORT], SPAWN_OPTIONS);
    await waitForServer(baseUrl);
  }

  const results = [];

  try {
    for (const route of ROUTES) {
      const targetUrl = new URL(route.path, baseUrl).toString();
      const outputPath = path.join(OUTPUT_DIR, `${route.id}.json`);

      const code = await run(PnpmBin, [
        "exec",
        "lighthouse",
        targetUrl,
        "--only-categories=accessibility",
        "--preset=desktop",
        "--output=json",
        "--output-path",
        outputPath,
        "--chrome-flags=--headless=new",
        "--quiet",
      ]);

      if (code === 0) {
        const score = await readAccessibilityScore(outputPath);
        results.push({
          routeId: route.id,
          routePath: route.path,
          url: targetUrl,
          success: true,
          accessibilityScore: score,
        });
      } else {
        results.push({
          routeId: route.id,
          routePath: route.path,
          url: targetUrl,
          success: false,
          accessibilityScore: null,
        });
      }
    }
  } finally {
    if (serverProcess) {
      serverProcess.kill();
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    successCount: results.filter((item) => item.success).length,
    totalCount: results.length,
    failureCount: results.filter((item) => !item.success).length,
    results,
  };

  await writeFile(
    path.join(OUTPUT_DIR, "index.json"),
    JSON.stringify(summary, null, 2),
    "utf8"
  );

  if (summary.failureCount > 0) {
    console.error(
      `[a11y:lighthouse] ${summary.failureCount} of ${summary.totalCount} Lighthouse route audit(s) failed.`
    );
    process.exitCode = 1;
  }
}

main().catch(async (error) => {
  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(
    path.join(OUTPUT_DIR, "index.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        baseUrl: EXPLICIT_BASE_URL ?? DEFAULT_BASE_URL,
        successCount: 0,
        totalCount: 0,
        results: [],
        error: String(error),
      },
      null,
      2
    ),
    "utf8"
  );
});
