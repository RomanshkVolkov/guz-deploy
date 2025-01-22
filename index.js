#!/usr/bin/env node

const { copyFileSync, mkdirSync, readdirSync, statSync } = require('node:fs');
const path = require('node:path');
const url = require('node:url');

const folders = ['.deploy', '.github'];

// get the current directory of the script

const currentDirectory = process.cwd(); // user current directory

// function to copy a folder recursively
function copyFolderRecursive(source, destination) {
   mkdirSync(destination, { recursive: true }); // create destination folder if not exists

   // read all files/folders in the directory
   const items = readdirSync(source);
   items.forEach((item) => {
      const sourcePath = path.join(source, item);
      const destinationPath = path.join(destination, item);

      if (statSync(sourcePath).isDirectory()) {
         copyFolderRecursive(sourcePath, destinationPath);
      } else {
         copyFileSync(sourcePath, destinationPath);
      }
   });
}

folders.forEach((folder) => {
   try {
      const source = path.join(__dirname, folder); // ruta absoluta
      const destination = path.join(currentDirectory, folder); // ruta dentro del proyecto

      if (!statSync(source).isDirectory()) {
         console.error(`Source is not a directory: ${source}`);
         return;
      }

      copyFolderRecursive(source, destination);
      console.log(`Copied ${folder} to ${destination}`);
   } catch (error) {
      console.error(`Error copying folder ${folder}:`, error.message);
   }
});

const rootFiles = [
   '.dockerignore',
   'Dockerfile.nextjs',
   'Dockerfile.api',
   'Dockerfile.api.only-js',
   'Dockerfile.NET.sdk-7',
];

rootFiles.forEach((file) => {
   try {
      const source = path.join(__dirname, file);
      const destination = path.join(currentDirectory, file);

      copyFileSync(source, destination);
      console.log(`Copied ${file} to ${destination}`);
   } catch (error) {
      console.error(`Error copying file ${file}:`, error.message);
   }
});

console.log('Done!');
