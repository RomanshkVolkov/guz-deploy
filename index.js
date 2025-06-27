#!/usr/bin/env node

const { copyFileSync, mkdirSync, readdirSync, statSync } = require("node:fs");
const path = require("node:path");
const url = require("node:url");
const fs = require("node:fs");
const { exec } = require("node:child_process");

const folders = [".deploy", ".github"];

// get the current directory of the script

const currentDirectory = process.cwd(); // user current directory

function analizePackageJSON(pk) {
  try {
    const pkgPath = path.join(currentDirectory, "package.json");
    if (!fs.existsSync(pkgPath)) return false;

    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    console.debug(pkg);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const depsArray = Object.keys(deps);
    const hasPackage = depsArray.some((dep) => dep.startsWith(pk));

    return hasPackage;
  } catch {
    return false;
  }
}

function existFile(file) {
  try {
    const filePath = path.join(currentDirectory, file);
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function copyFileToRootPath(file, renamed = undefined) {
  try {
    const source = path.join(__dirname, file);
    const destination = path.join(currentDirectory, renamed ?? file);

    copyFileSync(source, destination);
    console.log(`Copied ${file} to ${destination}`);
  } catch (error) {
    console.error(`Error copying file ${file}:`, error.message);
  }
}

// function to copy a folder recursively
function copyFolderRecursive(source, destination) {
  mkdirSync(destination, { recursive: true }); // create destination folder if not exists

  // read all files/folders in the directory
  const items = readdirSync(source);
  for (const item of items) {
    const sourcePath = path.join(source, item);
    const destinationPath = path.join(destination, item);

    if (statSync(sourcePath).isDirectory()) {
      copyFolderRecursive(sourcePath, destinationPath);
    } else {
      copyFileSync(sourcePath, destinationPath);
    }
  }
}

for (const folder of folders) {
  try {
    const source = path.join(__dirname, folder); // ruta absoluta
    const destination = path.join(currentDirectory, folder); // ruta dentro del proyecto

    if (!statSync(source).isDirectory()) {
      console.error(`Source is not a directory: ${source}`);
      continue;
    }

    copyFolderRecursive(source, destination);
    console.log(`Copied ${folder} to ${destination}`);
  } catch (error) {
    console.error(`Error copying folder ${folder}:`, error.message);
  }
}

const rootFiles = [".dockerignore"];

for (const file of rootFiles) {
  copyFileToRootPath(file);
}

const dockerImages = {
  go: "Dockerfile.golang",
  deno: "Dockerfile.deno",
  next: "Dockerfile.nextjs",
  api: "Dockerfile.api",
  koa: "Dockerfile.api.only-js",
  NET: "Dockerfile.NET.sdk-7",
  angular: "Dockerfile.angular",
};

const isNextjs = analizePackageJSON("next");
if (isNextjs) {
  copyFileToRootPath(dockerImages.next, "Dockerfile");
}

const isAngular = analizePackageJSON("@angular");
const isReact = analizePackageJSON("react");
if (isAngular || isReact) {
  copyFileToRootPath(dockerImages.angular, "Dockerfile");
  copyFileToRootPath("nginx.conf");
}

const isKoa = analizePackageJSON("koa");
if (isKoa) {
  copyFileToRootPath(dockerImages.koa, "Dockerfile");
}

const isExpress = analizePackageJSON("express");
if (isExpress) {
  copyFileToRootPath(dockerImages.api, "Dockerfile");
}

const isNestjs = analizePackageJSON("@nestjs");
if (isNestjs) {
  copyFileToRootPath(dockerImages.api, "Dockerfile");
}

const isGolang = existFile("go.mod");
if (isGolang) {
  copyFileToRootPath(dockerImages.go, "Dockerfile");
}

const isNetCore = existFile(".csproj");
if (isNetCore) {
  copyFileToRootPath(dockerImages.NET, "Dockerfile");
}

const isDenoProject = existFile("deno.json") || existFile("deno.*")
if (isDenoProject) {
  copyFileToRootPath(dockerImages.deno, "Dockerfile")
}

exec('chmod +x .deploy/*.sh')

console.info("Done!");
console.info("Remember validate exec permissions on .deploy/*.sh files")
