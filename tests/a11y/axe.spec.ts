import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { test, type Page } from "@playwright/test";

import { AUDIT_ROUTES, AUDIT_THEMES, type AuditTheme } from "./routes";

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] as const;

function applyTheme(page: Page, theme: AuditTheme) {
  return page.evaluate((requestedTheme) => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(requestedTheme);
    root.style.colorScheme = requestedTheme;
    try {
      window.localStorage.setItem("theme", requestedTheme);
    } catch {
      // Ignore storage access issues in strict browser contexts.
    }
  }, theme);
}

test.describe.configure({ mode: "parallel" });

for (const route of AUDIT_ROUTES) {
  for (const theme of AUDIT_THEMES) {
    test(`${route.id} [${theme}]`, async ({ page }, testInfo) => {
      await page.addInitScript((requestedTheme) => {
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(requestedTheme);
        document.documentElement.style.colorScheme = requestedTheme;
        try {
          window.localStorage.setItem("theme", requestedTheme);
        } catch {
          // Ignore storage access issues in strict browser contexts.
        }
      }, theme);

      await page.goto(route.path, { waitUntil: "load" });
      await applyTheme(page, theme);
      await page.waitForTimeout(150);

      const results = await new AxeBuilder({ page }).withTags([...AXE_TAGS]).analyze();

      const artifactDir = path.join(process.cwd(), "artifacts", "a11y", "raw", "axe");
      await mkdir(artifactDir, { recursive: true });

      const safeProject = testInfo.project.name.replace(/[^a-z0-9_-]/gi, "_");
      const outputPath = path.join(
        artifactDir,
        `${route.id}__${theme}__${safeProject}.json`
      );

      const payload = {
        routeId: route.id,
        routePath: route.path,
        theme,
        project: testInfo.project.name,
        url: page.url(),
        timestamp: new Date().toISOString(),
        summary: {
          violations: results.violations.length,
          passes: results.passes.length,
          incomplete: results.incomplete.length,
          inapplicable: results.inapplicable.length,
        },
        violations: results.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact ?? "unknown",
          description: violation.description,
          help: violation.help,
          helpUrl: violation.helpUrl,
          tags: violation.tags,
          nodes: violation.nodes.map((node) => ({
            target: node.target,
            html: node.html,
            failureSummary: node.failureSummary,
          })),
        })),
      };

      await writeFile(outputPath, JSON.stringify(payload, null, 2), "utf8");
    });
  }
}
