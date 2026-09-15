import { readFileSync } from "node:fs";

const packageJson = readObject("package.json");
const manifest = readObject("manifest.json");
const versions = readObject("versions.json");
const version = requiredString(packageJson, "version", "package.json");
const manifestVersion = requiredString(manifest, "version", "manifest.json");
const minimum = requiredString(manifest, "minAppVersion", "manifest.json");

if (version !== manifestVersion) {
  throw new Error(
    `Version mismatch: package=${version}, manifest=${manifestVersion}`,
  );
}
if (versions[version] !== minimum) {
  throw new Error(`versions.json must map ${version} to ${minimum}`);
}
if (process.argv[2] !== undefined && process.argv[2] !== version) {
  throw new Error(`Release tag ${process.argv[2]} does not match ${version}`);
}
for (const asset of ["manifest.json", "styles.css"]) {
  if (readFileSync(asset, "utf8").length === 0)
    throw new Error(`${asset} is empty`);
}
console.log(`Release metadata is consistent for ${version}.`);

function readObject(path) {
  const value = JSON.parse(readFileSync(path, "utf8"));
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${path} must contain an object`);
  }
  return value;
}

function requiredString(object, key, path) {
  const value = object[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${path}.${key} must be a non-empty string`);
  }
  return value;
}
