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

// For local development
const init = async () => {
  const server = await createServer(container);
  await server.start();
  console.log(`server start at ${server.info.uri}`);
  return server;
};

// For Vercel deployment - serverless function
const serverless = async (req, res) => {
  const server = await createServer(container);
  
  // Convert request from Vercel to hapi
  const options = {
    method: req.method,
    url: req.url,
    payload: req.body,
    headers: req.headers,
  };

  const response = await server.inject(options);
  
  // Return hapi response to Vercel
  res.statusCode = response.statusCode;
  
  // Set response headers
  Object.entries(response.headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  res.end(response.payload);
};

// Run init for local, export serverless for Vercel
if (process.env.NODE_ENV !== 'production') {
  init();
}

module.exports = serverless;