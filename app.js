const express = require("express");
const app = express();
const port = 3000;
const db = require("./data/db.js");

app.get("/pins/:lat/:lon", (req, res) => {
  const lat = req.params.lat;
  const lon = req.params.lon;
  return res.send("Lat: " + lat + " Lon: " + lon);
});

app.get("/api/routes", async (req, res) => {
  const routes = await db("routes");
  res.json({ routes });
});

app.get("/", (req, res) => res.send("Hello World!"));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
