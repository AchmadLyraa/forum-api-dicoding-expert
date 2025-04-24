// const routes = (handler) => [
// 	{
// 		method: "POST",
// 		path: "/threads",
// 		handler: handler.postThreadHandler,
// 		options: {
// 			auth: "forumapi_jwt",
// 		},
// 	},
// 	{
// 		method: "GET",
// 		path: "/threads/{threadId}",
// 		handler: handler.getThreadsHandler,
// 	},
// ];

// module.exports = routes;

const { RateLimiterMemory } = require('rate-limiter-flexible');

// Konfigurasi rate limiter: 90 request per menit
const rateLimiter = new RateLimiterMemory({
  points: 90, // 90 request
  duration: 60, // per 60 detik (1 menit)
});

// Middleware untuk rate limiting
const rateLimitMiddleware = async (request, h) => {
  try {
    // Gunakan IP client untuk batasi request
    await rateLimiter.consume(request.info.remoteAddress);
    return h.continue;
  } catch (error) {
    return h.response({
      status: 'fail',
      message: 'Too many requests, please try again later',
    }).code(429).takeover();
  }
};

const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadHandler,
    options: {
      auth: 'forumapi_jwt',
      pre: [rateLimitMiddleware], // Tambahkan rate limiting
    },
  },
  {
    method: 'GET',
    path: '/threads/{threadId}',
    handler: handler.getThreadsHandler,
    options: {
      pre: [rateLimitMiddleware], // Tambahkan rate limiting
    },
  },
];

module.exports = routes;