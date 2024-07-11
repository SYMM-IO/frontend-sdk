// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

const appsDir = "./apps"; // Replace with the actual path to your 'apps' directory
const packageName = "@symmio/frontend-sdk";
// Function to update tsconfig.json
function updateTsConfig(folderPath) {
  const tsconfigPath = path.join(folderPath, "tsconfig.json");

  fs.readFile(tsconfigPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    const tsconfig = JSON.parse(data);

    if (!tsconfig.compilerOptions) {
      tsconfig.compilerOptions = {};
    }

    if (!tsconfig.compilerOptions.paths) {
      tsconfig.compilerOptions.paths = {};
    }

    tsconfig.compilerOptions.paths["@symmio/frontend-sdk/*"] = [
      "../../packages/core/src/*",
    ];

    fs.writeFile(
      tsconfigPath,
      JSON.stringify(tsconfig, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.error("Error writing file:", err);
        } else {
          console.log(`Path added successfully in ${tsconfigPath}.`);
        }
      }
    );
  });
}

// Function to update package.json
function updatePackageJson(folderPath) {
  const packageJsonPath = path.join(folderPath, "package.json");

  fs.readFile(packageJsonPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    const packageJson = JSON.parse(data);

    // Remove the package from dependencies and devDependencies
    if (packageJson.dependencies && packageJson.dependencies[packageName]) {
      delete packageJson.dependencies[packageName];
    }
    if (
      packageJson.devDependencies &&
      packageJson.devDependencies[packageName]
    ) {
      delete packageJson.devDependencies[packageName];
    }

    // Write the updated package.json back to the file
    fs.writeFile(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.error("Error writing file:", err);
        } else {
          console.log(
            `Package '${packageName}' removed successfully from ${packageJsonPath}.`
          );
        }
      }
    );
  });
}

// Read all folders in 'apps' directory
fs.readdir(appsDir, { withFileTypes: true }, (err, files) => {
  if (err) {
    console.error("Error reading apps directory:", err);
    return;
  }

  files.forEach((dirent) => {
    if (dirent.isDirectory()) {
      const folderPath = path.join(appsDir, dirent.name);
      updateTsConfig(folderPath);
      updatePackageJson(folderPath);
    }
  });
});
