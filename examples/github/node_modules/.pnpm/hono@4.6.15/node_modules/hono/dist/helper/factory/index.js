// src/helper/factory/index.ts
import { Hono } from "../../hono.js";
var Factory = class {
  initApp;
  constructor(init) {
    this.initApp = init?.initApp;
  }
  createApp = () => {
    const app = new Hono();
    if (this.initApp) {
      this.initApp(app);
    }
    return app;
  };
  createMiddleware = (middleware) => middleware;
  createHandlers = (...handlers) => {
    return handlers.filter((handler) => handler !== void 0);
  };
};
var createFactory = (init) => new Factory(init);
var createMiddleware = (middleware) => createFactory().createMiddleware(middleware);
export {
  Factory,
  createFactory,
  createMiddleware
};
