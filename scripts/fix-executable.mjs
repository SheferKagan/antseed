import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const target = process.argv[2];

if (!target) {
  process.exit(0);
}

const resolved = path.resolve(process.cwd(), target);
const source = readFileSync(resolved, 'utf8');

if (source.startsWith('#!/usr/bin/env node')) {
  process.exit(0);
}

writeFileSync(resolved, `#!/usr/bin/env node\n${source}`);
console.log(`[fix-executable] updated ${resolved}`);
