const fs = require("fs");
const path = require("path");

async function saveBinaryFile(buffer, filename) {
  const tempDir = path.join(process.cwd(), "downloads");

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const filePath = path.join(tempDir, filename);
  return new Promise((resolve, reject) => {
    const pureBuffer = Buffer.isBuffer(buffer)
      ? buffer
      : Buffer.from(buffer, "binary");
    fs.writeFile(filePath, pureBuffer, (err) => {
      if (err) return reject(err);
      resolve(filePath);
    });
  });
}

module.exports = saveBinaryFile;
