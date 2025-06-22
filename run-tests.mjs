import { readdir } from 'fs/promises';

const files = (await readdir('./tests'))
    .filter(f => f.endsWith('.test.js') || f === 'test.js')
    .sort();
for (const file of files) {
    console.log(`--- Running ${file} ---`);
    await import(`./tests/${file}`);
}
