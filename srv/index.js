"use strict";

const express = require("express");
const cds = require("@sap/cds");
const proxy = require("@sap/cds-odata-v2-adapter-proxy");
const csn = 'gen/csn.json'

const host = "0.0.0.0";
const port = process.env.PORT || 4004;

(async () => {
  const app = express();

  // serve odata v4
    await cds
    .connect("db") // ensure database is connected!
 
 //Using csn instead of 'db' : At runtime in CF cds doesn't have access to the db folder that
 //contains the DB schema. 
 //So you have to point the proxy to a static resource
 //that is available in srv.
 //Reference app: https://github.com/gregorwolf/bookshop-demo/blob/master/srv/v2server.js#L9
  await cds
    .serve('all')
    .from(csn)
    .in(app)

  // serve odata v2
  // process.env.XS_APP_LOG_LEVEL = 'error'; // suppress debug logs
  app.use(
    proxy({
      // app
      path: 'v2',
      model: csn,
      // target
      port: port
    })
  )

  // start server
  const server = app.listen(port, host, () => console.info(`app is listing at ${host}:${port}`));
  server.on("error", error => console.error(error.stack));
})();