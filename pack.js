"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const fs = require("fs");
const path = require("path");
const ChildProcess = require("child_process");

const currentDir = path.dirname(process.argv[1]);
const oldPath = currentDir + path.sep + 'out';

console.log(ChildProcess.execSync('powershell Remove-Item \'' + oldPath + '\' -Recurse -Force -ErrorAction:Continue', { encoding: 'utf8' }));
fs.renameSync(currentDir + path.sep + 'out.min', oldPath);

console.log('----------------pack done !-----------------\n');