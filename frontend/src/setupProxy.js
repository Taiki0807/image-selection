const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(
        createProxyMiddleware("/fastapi", {
            target: "http://127.0.0.1:6060",
            changeOrigin: true,
        })
    );
    app.use(
        createProxyMiddleware("/api", {
            target: "https://my-go-api-tccvhcsvvq-an.a.run.app",
            changeOrigin: true,
        })
    );
};
