const PROXY_CONFIG = {
  "/api/auth/**": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug",
    "pathRewrite": {
      "^/api": ""
    },
    "bypass": function(req, res, proxyOptions) {
      console.log(`� Proxying AUTH request: ${req.method} ${req.url} → http://localhost:3000${req.url.replace('/api', '')}`);
    }
  },
  "/api/users/**": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug",
    "bypass": function(req, res, proxyOptions) {
      console.log(`👥 Proxying USERS request: ${req.method} ${req.url} → http://localhost:3000${req.url}`);
    }
  },
  "/api/**": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug",
    "bypass": function(req, res, proxyOptions) {
      console.log(`� Proxying API request: ${req.method} ${req.url} → http://localhost:3000${req.url}`);
    }
  }
};

module.exports = PROXY_CONFIG;