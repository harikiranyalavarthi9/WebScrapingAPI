const proxy = require('http-proxy-middleware');
module.exports = function (app) {
    app.use(
        '/api',
        proxy({
            target: 'https://5041b1f1.ngrok.io',
            changeOrigin: true,
        })
    );
};