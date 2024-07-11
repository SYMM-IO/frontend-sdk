// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");

// Recursively get all .ts files
function getTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const fileStat = fs.lstatSync(filePath);

    if (fileStat.isDirectory()) {
      getTsFiles(filePath, fileList);
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Calculate relative path
function calculateRelativePath(from, to) {
  const relativePath = path.relative(path.dirname(from), to);
  return relativePath.replace(/\\/g, "/"); // Ensure forward slashes
}

const files = getTsFiles("./"); // Adjust the path accordingly

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf-8");

  // Replace imports
  content = content.replace(
    /from ['"]@symmio-client\/core\/(.*?)['"]/g,
    (match, p1) => {
      const targetPath = path.resolve("./", `./${p1}`);
      const relativePath = calculateRelativePath(file, targetPath);
      return `from "${relativePath}"`;
    }
  );

  fs.writeFileSync(file, content, "utf-8");
});

console.log("Refactoring complete.");
