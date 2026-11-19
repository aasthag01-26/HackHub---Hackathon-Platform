const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

test("Responsive Layout: Layout.tsx contains responsive mobile breakpoints", () => {
  const layoutPath = path.join(__dirname, "..", "components", "Layout.tsx");
  assert.ok(fs.existsSync(layoutPath), "Layout.tsx must exist");
  const content = fs.readFileSync(layoutPath, "utf8");

  // Verify mobile header toggle
  assert.ok(content.includes("md:hidden"), "Layout must include mobile-specific classes (md:hidden)");
  assert.ok(content.includes("mobileMenuOpen"), "Layout must manage mobileMenuOpen toggle state");

  // Verify desktop sidebar is hidden on small screens
  assert.ok(content.includes("hidden md:flex"), "Desktop sidebar must be hidden on mobile (hidden md:flex)");

  // Verify mobile bottom navigation bar exists
  assert.ok(
    content.includes("fixed bottom-0 left-0 right-0"),
    "Layout must provide mobile bottom navigation bar"
  );
  assert.ok(
    content.includes("aria-label=\"Mobile Navigation\""),
    "Mobile nav must include accessible aria-label"
  );

  // Verify main content has bottom padding on mobile to prevent content occlusion
  assert.ok(
    content.includes("pb-20 md:pb-8"),
    "Main content must have bottom padding on mobile (pb-20 md:pb-8)"
  );
});

test("Responsive Layout: navigation links cover core platform workflows", () => {
  const layoutPath = path.join(__dirname, "..", "components", "Layout.tsx");
  const content = fs.readFileSync(layoutPath, "utf8");

  const requiredRoutes = ["/dashboard", "/tasks", "/chat", "/files", "/pitch", "/team"];
  requiredRoutes.forEach((route) => {
    assert.ok(content.includes(route), `Layout must include route ${route}`);
  });
});
