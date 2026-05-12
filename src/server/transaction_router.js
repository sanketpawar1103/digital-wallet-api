import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { logger } from "hono/logger";

export const createApp = () => {
  const app = new Hono();
  app.use(logger());

  app.post("/signin", functionCallback);
  app.post("/signup", functionCallback);
  app.get("/", );
  app.get("/index", );
  app.get("*", serveStatic({ root: "./public" }));

  return app;
};
