const { execSync } = require("node:child_process");
const { writeFileSync } = require("node:fs");
const { join } = require("node:path");

const cutoff = new Date("2025-12-31T23:59:59Z");
const raw = execSync('git log --pretty=format:"%h|%s|%cI"', { encoding: "utf8" });
const entries = raw
  .split("\n")
  .map((line) => {
    const [hash, subject, date] = line.split("|");
    if (!hash || !subject || !date) return null;
    return { hash, subject, date };
  })
  .filter(Boolean)
  .filter((entry) => {
    const commitDate = new Date(entry.date);
    return Number.isFinite(commitDate.getTime()) && commitDate <= cutoff;
  });

const outputPath = join(process.cwd(), "app", "lib", "changelog-data.json");
writeFileSync(outputPath, JSON.stringify(entries, null, 2) + "\n");
console.log(`Wrote ${entries.length} changelog entries to ${outputPath}`);
