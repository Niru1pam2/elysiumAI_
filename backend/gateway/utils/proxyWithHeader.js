// backend/gateway/utils/proxyWithHeader.js
import proxy from "express-http-proxy";

const proxyWithHeader = (serviceUrl) => {
  return proxy(serviceUrl, {
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // Set x-user-id if user exists, otherwise explicitly wipe any incoming x-user-id header
      proxyReqOpts.headers["x-user-id"] = srcReq.user ? srcReq.user.userId : "";
      return proxyReqOpts;
    },
  });
};

export default proxyWithHeader;
