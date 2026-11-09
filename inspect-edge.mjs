import fs from 'fs';
import path from 'path';

const dir = 'C:/Users/Hussein/AppData/Local/Microsoft/Edge/User Data/Default/Local Storage/leveldb';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ldb') || f.endsWith('.log'));

for (const file of files) {
  try {
    const buf = fs.readFileSync(path.join(dir, file));
    const str = buf.toString('latin1');
    const matches = str.match(/https?:\/\/[a-zA-Z0-9.-]+vercel\.app[^\x00-\x1f]+/g);
    if (matches) {
      console.log(`Vercel URLs in ${file}:`, Array.from(new Set(matches)).slice(0, 10));
    }
  } catch(e){}
}
