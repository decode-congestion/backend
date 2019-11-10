const app = require("express")();
const http = require("http").createServer(app);
const port = 3000;
const db = require("./data/db.js");
const io = require("socket.io")(http);

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

http.listen(port, () => console.log(`Example app listening on port ${port}!`));

listenToSockets(io);