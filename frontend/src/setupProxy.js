const proxy = require('http-proxy-middleware');
module.exports = function (app) {
    app.use(
        '/api',
        proxy({
            target: 'https://10e029a7.ngrok.io',
            changeOrigin: true,
        })
    );
};