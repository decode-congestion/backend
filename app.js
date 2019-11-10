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

const defaultNS = io.of('/'); // on initial opening, clients get dropped in the central pool
defaultNS.on('connection', socket => {
    console.log('Someone has joined the default pool');

    switch (_locateUserInitially(socket.request)) { // determine where they are
    case 'on bus':
        socket.emit('shunt', 'riding');
        break;
    case 'waiting':
        socket.emit('shunt', 'idling');
        break;
    case 'not close':
        socket.emit('fuck off');
        break;
    default:
        // TODO: throw an error
        break;
    }

    socket.on('update', location => {
        const stop = _nearestStopOrNull(location);
        if (!!stop) socket.emit('shunt', 'idling', stop);
    });
    socket.on('disconnect', () => { // person has left, either because they moved or because they turned off their app
        // TODO
    })
});

const idling = io.of('/idling');
idling.on('connection', socket => {
    console.log('Someone started idling');

    socket.on('disconnect', () => { // person has disconnected, either because they moved to `/riding` or because they turned off their app
    })
});

const riding = io.of('/riding');
riding.on('connection', socket => {
    console.log('Someone started riding');

    socket.on('disconnect', () => { // person has disconnected, because they've left the bus or because they've turned off their app
    })
});

/**
 * Decide on the initial location of a user once they open the app.
 *
 * Users could potentially open the app anywhere, even if they are already on public transport.
 * Figuring out where they are in important to providing the correct UX.
 * @param req the original socket request, with data stored
 * @returns {'on bus'|'waiting'|'not close'} where the user is
 * @private
 */
function _locateUserInitially(req) {
    return undefined; // TODO
}
/**
 * Returns the stop number of the nearest bus stop if within a certain radius, or else `null`.
 * @param loc coordinates of the user
 * @returns {null} Stop Number or null if outside range of any stop.
 * @private
 */
function _nearestStopOrNull(loc) {
    return undefined; // TODO
}