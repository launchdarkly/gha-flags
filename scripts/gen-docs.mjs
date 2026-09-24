#!/usr/bin/env node
// Regenerate the README inputs table from action.yml.
//
// Replaces everything between the two `<!-- action-docs-inputs -->` sentinels.
// Run via `npm run docs`, which pipes the result through oxfmt for alignment.
import { readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';

const MARKER = '<!-- action-docs-inputs -->';
const [actionPath = 'action.yml', readmePath = 'README.md'] = process.argv.slice(2);

// Escape pipes so a description containing one cannot split the row into
// extra cells, and collapse newlines so block scalars stay on one line.
const cell = (value) =>
  String(value ?? '')
    .replace(/\r?\n/g, ' ')
    .replace(/\|/g, '\\|')
    .trim();

const { inputs } = parse(readFileSync(actionPath, 'utf8')) ?? {};
if (!inputs) throw new Error(`No 'inputs:' block found in ${actionPath}`);

const table = [
  '| parameter | description | required | default |',
  '| --------- | ----------- | -------- | ------- |',
  ...Object.entries(inputs).map(([name, spec]) => {
    const { description = '', required = false, default: defaultValue = '' } = spec ?? {};
    return `| ${cell(name)} | ${cell(description)} | \`${required}\` | ${cell(defaultValue)} |`;
  }),
].join('\n');

const readme = readFileSync(readmePath, 'utf8');
const open = readme.indexOf(MARKER);
const close = readme.indexOf(MARKER, open + MARKER.length);
if (open === -1 || close === -1) {
  throw new Error(`Expected two '${MARKER}' sentinels in ${readmePath}`);
}

const before = readme.slice(0, open + MARKER.length);
const after = readme.slice(close);
writeFileSync(readmePath, `${before}\n\n## Inputs\n\n${table}\n\n${after}`);
