const sharp = require('sharp');
const path = require('path');
const inPath = path.join(__dirname, '..', 'public', 'logo-1024.png');
const outs = [
  { s: 512, f: 'logo-512.png' },
  { s: 192, f: 'logo-192.png' },
  { s: 180, f: 'apple-touch-icon.png' },
  { s: 32, f: 'favicon-32.png' },
  { s: 16, f: 'favicon-16.png' }
];

(async () => {
  try {
    for (const o of outs) {
      await sharp(inPath)
        .resize(o.s, o.s, { fit: 'contain', background: { r:0,g:0,b:0,alpha:0 } })
        .toFile(path.join(__dirname, '..', 'public', o.f));
      console.log('wrote', o.f);
    }
    console.log('done');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();