import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Replace 'currentPath' with your current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const currentPath = __dirname; // Example: '/path/to/your/project'

const srcPath = path.join(currentPath, "../src");

function listFiles(dirPath, depth = 0) {
  let arrayOfFiles = [];
  let subDirFiles = [];

  fs.readdirSync(dirPath).forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      subDirFiles = subDirFiles.concat(listFiles(filePath, depth + 1));
    } else {
      const tempAddress = "src/" + filePath.split("src/")[1];
      arrayOfFiles.push({ path: tempAddress, depth });
    }
  });

  return depth === 0
    ? arrayOfFiles.concat(subDirFiles).map((file) => file.path)
    : arrayOfFiles.concat(subDirFiles);
}

async function generateExports(entry, noExport) {
  const exports = {};
  for (const file of entry) {
    if (noExport?.includes(file)) continue;
    const extension = path.extname(file);
    const fileWithoutExtension = file.replace(extension, "");
    const name = fileWithoutExtension
      .replace(/^src\//g, "./")
      .replace(/\/index$/, "");
    const distSourceFile = `${fileWithoutExtension.replace(
      /^src\//g,
      "./dist/"
    )}.js`;
    const distTypesFile = `${fileWithoutExtension.replace(
      /^src\//g,
      "./dist/"
    )}.d.ts`;
    exports[name] = {
      types: distTypesFile,
      default: distSourceFile,
    };
  }

  exports["./package.json"] = "./package.json";

  const packageJson = await fs.readJSON("package.json");
  packageJson.exports = exports;
  await fs.writeFile(
    "package.json",
    JSON.stringify(packageJson, null, 2) + "\n"
  );
  return exports;
}
const files = listFiles(srcPath);
generateExports(files, []);
