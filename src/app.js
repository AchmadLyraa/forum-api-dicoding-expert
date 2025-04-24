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
    const server = await createServer(container);

    // Konversi request Vercel ke format Hapi
    const options = {
      method: req.method,
      url: req.url,
      payload: req.body,
      headers: req.headers,
    };

    // Injeksi request ke server Hapi
    const response = await server.inject(options);

    // Set status code dan header untuk response Vercel
    res.statusCode = response.statusCode;
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Kirim payload sebagai response
    res.end(response.payload);
  } catch (error) {
    console.error('Error di serverless function:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: 'Internal Server Error' }));
  }
};

// Jalankan init hanya di lingkungan lokal (bukan Vercel)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  init();
}

// Ekspor fungsi serverless untuk Vercel
module.exports = serverless;