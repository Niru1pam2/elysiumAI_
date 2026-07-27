// backend/gateway/utils/proxyWithHeader.js
import proxy from "express-http-proxy";

const proxyWithHeader = (serviceUrl) => {
  return proxy(serviceUrl, {
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // 1. Pass down authentication headers
      if (srcReq.headers.cookie) {
        proxyReqOpts.headers["cookie"] = srcReq.headers.cookie;
      }
      if (srcReq.headers.authorization) {
        proxyReqOpts.headers["authorization"] = srcReq.headers.authorization;
      }

      // 2. Pass parsed user ID from gateway middleware
      proxyReqOpts.headers["x-user-id"] = srcReq.user ? srcReq.user.userId : "";

      return proxyReqOpts;
    },
  });
};

export default proxyWithHeader;
