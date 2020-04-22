const proxy = require('http-proxy-middleware');
module.exports = function (app) {
    app.use(
        '/api',
        proxy({
            target: 'http://808bcc8d.ngrok.io',
            changeOrigin: true,
        })
    );
};