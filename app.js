const app = require("express")();
const http = require("http").createServer(app);
const port = 3000;
const db = require("./data/db.js");
const io = require("socket.io")(http);
const { listenToSockets } = require("./main/listener.js");
const { knex, st } = require("./data/knexSetup");

app.get("/pins/:lat/:lon", (req, res) => {
    const lat = req.params.lat;
    const lon = req.params.lon;
    return res.send("Lat: " + lat + " Lon: " + lon);
});
app.get('/api/users/:userId/collected', async (req, res) => {
    const userId = req.params['userId'];
    res.json(await knex.raw(
    `select cv.vehicle_id, l.*
           from collected_vehicles as cv join loots as l on cv.user_id = l.user_id
           where user_id = ${userId} and l.vehicle_id is null`
    ));
});
app.get("/api/routes", async (req, res) => {
    const routes = await db("routes");
    res.json({routes});
});
app.get("/", (req, res) => res.send("Hello World!"));

http.listen(port, () => console.log(`Example app listening on port ${port}!`));

listenToSockets(io);
