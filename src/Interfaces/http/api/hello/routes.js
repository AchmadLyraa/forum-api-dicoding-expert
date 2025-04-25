const routes = (handler) => [
  {
    method: 'GET',
    path: '/',
    handler: handler.getHelloHandler,
  },
];

module.exports = routes;