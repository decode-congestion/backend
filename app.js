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
    res.json({
        cv: await knex.select('vehicle_id').from('collected_vehicles').where(`user_id = ${userId}`).rows,
        loots: await knex.select('*').from('loots').where(`user_id = ${user_id} and vehicle_id is null`).rows
    });
});
app.get("/api/routes", async (req, res) => {
    const routes = await db("routes");
    res.json({routes});
});
app.get("/", (req, res) => res.send("Hello World!"));

http.listen(port, () => console.log(`Example app listening on port ${port}!`));

listenToSockets(io);
