const express = require('express');
const router = express.Router();
const { decryptFile } = require('./decrypt');

router.post('/decrypt/n8n', async (req, res) => {
  try {
    const { fileUrl, encryptedData, algorithm, key, iv } = req.body;

    if (!algorithm || !key) {
      return res.status(400).json({ error: 'algorithm e key são obrigatórios' });
    }

    const decryptedData = await decryptFile({ fileUrl, encryptedData, algorithm, key, iv });
    res.json({ decryptedData });
  } catch (error) {
    console.error('Erro na descriptografia:', error);
    res.status(500).json({ error: 'Falha na descriptografia', details: error.message });
  }
});

module.exports = router;
