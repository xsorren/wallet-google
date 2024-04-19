require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.post('/create-pass', async (req, res) => {
  const { classId, objectId } = req.body;

  try {
    const response = await axios.post('https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject', {
      // Datos para crear el pass
      id: objectId,
      classId: classId,
      state: "active",
      // Añade más campos según la API de Google Wallet
    }, {
      headers: { 'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}` }
    });

    res.json({ success: true, passUrl: `https://pay.google.com/gp/v/save/${response.data.id}` });
  } catch (error) {
    console.error('Error creating Google Wallet pass:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
