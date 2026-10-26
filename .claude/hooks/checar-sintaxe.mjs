#!/usr/bin/env node
// PostToolUse: node --check no JS/MJS editado; exit 2 devolve o erro ao Claude.
import {execFileSync} from 'node:child_process';
let input='';
for await(const chunk of process.stdin)input+=chunk;
const file=JSON.parse(input||'{}').tool_input?.file_path||'';
if(!/\.(?:m?js)$/.test(file)||file.includes('/node_modules/')||file.includes('/badge-build/'))process.exit(0);
try{execFileSync(process.execPath,['--check',file],{stdio:['ignore','ignore','pipe']});}
catch(error){process.stderr.write(`node --check falhou em ${file}:\n${error.stderr}`);process.exit(2);}
