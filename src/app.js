// require('dotenv').config();
// const createServer = require('./Infrastructures/http/createServer');
// const container = require('./Infrastructures/container');

// (async () => {
//   const server = await createServer(container);
//   await server.start();
//   console.log(`server start at ${server.info.uri}`);
// })();

require('dotenv').config();
const createServer = require('./Infrastructures/http/createServer');
const container = require('./Infrastructures/container');

// Fungsi untuk inisialisasi server lokal (development)
const init = async () => {
  const server = await createServer(container);
  await server.start();
  console.log(`Server berjalan di ${server.info.uri}`);
  return server;
};

// Fungsi serverless untuk Vercel
const serverless = async (req, res) => {
  try {
    // Log request untuk debugging
    console.log(`Request: ${req.method} ${req.url}`);

    const server = await createServer(container);

    // Konversi request Vercel ke format Hapi
    const options = {
      method: req.method,
      url: req.url,
      payload: req.body || null, // Pastikan payload nggak undefined
      headers: req.headers,
    };

    // Injeksi request ke server Hapi
    const response = await server.inject(options);

    // Set status code dan header untuk response Vercel
    res.statusCode = response.statusCode;
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Pastikan payload adalah string
    const payload = typeof response.payload === 'string' 
      ? response.payload 
      : JSON.stringify(response.payload);

    // Kirim response
    res.end(payload);
  } catch (error) {
    console.error('Error di serverless function:', {
      message: error.message,
      stack: error.stack,
    });
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      status: 'error',
      message: 'Internal Server Error',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message,
    }));
  }
};

// Jalankan init hanya di lingkungan lokal (bukan Vercel)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  init();
}

// Ekspor fungsi serverless untuk Vercel
module.exports = serverless;