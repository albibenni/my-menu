import { execFileSync } from "node:child_process";

const allowed = new Set(["major", "minor", "patch"]);
const releaseType = process.argv[2] ?? "patch";
if (!allowed.has(releaseType)) {
  throw new Error(`Invalid release type: ${releaseType}`);
}
for (const [command, args] of [
  ["pnpm", ["run", "check"]],
  ["pnpm", ["version", releaseType, "--tag-version-prefix="]],
  ["git", ["push", "--follow-tags"]],
]) {
  execFileSync(command, args, { stdio: "inherit" });
}
