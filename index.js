const express = require('express');
const axios = require('axios');
const https = require('https');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/main/britam-nonmotor', async (req, res) => {
  console.log('Incoming request: /proxy/britam-nonmotor');

  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({
        error: 'Authorization header missing',
      });
    }

    const response = await axios.post(
      process.env.BRITAM_UAT_URL,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          'Ocp-Apim-Subscription-Key': process.env.BRITAM_SUBSCRIPTION_KEY,
        },
        timeout: 100000,
        httpsAgent:
          process.env.NODE_ENV === 'development'
            ? new https.Agent({ rejectUnauthorized: false })
            : undefined,
      }
    );

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    return res.status(error.response?.status || 500).json({
      error: 'Britam proxy failed',
      details: error.response?.data || error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
