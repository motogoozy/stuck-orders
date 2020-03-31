const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {
  app.use(
    '/api/stuck_orders',
    createProxyMiddleware({
      target: 'https://stuckorders.mobilsense.com/',
      changeOrigin: true,
    })
  );
};