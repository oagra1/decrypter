const crypto = require('crypto');
const axios = require('axios');

async function decryptFile({ fileUrl, encryptedData, algorithm, key, iv }) {
  let encryptedBuffer;

  if (fileUrl) {
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    encryptedBuffer = Buffer.from(response.data);
  } else if (encryptedData) {
    encryptedBuffer = Buffer.from(encryptedData, 'base64');
  } else {
    throw new Error('fileUrl ou encryptedData devem ser fornecidos');
  }

  const keyBuffer = Buffer.from(key, 'hex');
  const ivBuffer = iv ? Buffer.from(iv, 'hex') : null;

  let decipher;
  if (ivBuffer) {
    decipher = crypto.createDecipheriv(algorithm, keyBuffer, ivBuffer);
  } else {
    decipher = crypto.createDecipheriv(algorithm, keyBuffer, Buffer.alloc(0));
  }

  let decrypted = decipher.update(encryptedBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('base64');
}

module.exports = { decryptFile };
