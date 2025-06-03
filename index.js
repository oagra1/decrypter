const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '100mb' }));

/**
 * POST /decrypt/n8n
 * Recebe JSON:
 * {
 *   "fileUrl": "https://...",           // opcional, URL para baixar arquivo criptografado
 *   "encryptedData": "<base64>",        // opcional, arquivo já enviado em base64
 *   "algorithm": "aes-256-cbc",         // obrigatório, algoritmo de criptografia
 *   "key": "<hex>",                     // obrigatório, chave em hexadecimal
 *   "iv": "<hex>"                       // opcional, vetor de inicialização em hexadecimal (para CBC e similares)
 * }
 * Retorna:
 * {
 *   "decryptedData": "<base64>"         // arquivo descriptografado em base64
 * }
 */
app.post('/decrypt/n8n', async (req, res) => {
  try {
    const { fileUrl, encryptedData, algorithm, key, iv } = req.body;

    if (!algorithm || !key) {
      return res.status(400).json({ error: 'algorithm e key são obrigatórios' });
    }

    let encryptedBuffer;

    if (fileUrl) {
      // Baixar arquivo da URL
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      encryptedBuffer = Buffer.from(response.data);
    } else if (encryptedData) {
      // Usar arquivo enviado em base64
      encryptedBuffer = Buffer.from(encryptedData, 'base64');
    } else {
      return res.status(400).json({ error: 'fileUrl ou encryptedData devem ser fornecidos' });
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

    return res.json({ decryptedData: decrypted.toString('base64') });
  } catch (error) {
    console.error('Erro na descriptografia:', error);
    return res.status(500).json({ error: 'Falha na descriptografia', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`API extraordinária de descriptografia rodando na porta ${port}`);
});
