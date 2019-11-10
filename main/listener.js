const {knex, st} = require("../data/knexSetup");
const {BusStop, Coordinates, Bus } = require("./location_models.js");
const SRID = 4326; // standard SR id format for North America
const DISTANCE_THRESHOLD = 15; // distance in m
const moment = require('moment')

module.exports = {listenToSockets, _nearestStopOrNull};

function listenToSockets(io) {
    const defaultNS = io.of("/"); // on initial opening, clients get dropped in the central pool
    defaultNS.on("connection", socket => {
        console.log("Someone has joined the default pool");

        // Set user to the user they say the are

        const userLocationTuple = _locateUserInitially(
            new Coordinates(null)
        );
        switch (
            userLocationTuple[0] // determine where they are
            ) {
            case "on bus":
                socket.emit("shunt", "riding", userLocationTuple[1]);
                // const busId = 19005 // vehicle no?
                // socket.emit("shunt", "riding", busId);
                break;
            case "waiting":
                socket.emit("shunt", "idling", userLocationTuple[1]);
                break;
            case "not close":
                socket.emit("shunt", "fuck off");
                break;
            default:
                // TODO: throw an error
                // socket.emit("shunt", "idling");
                break;
        }

        socket.on("accept_game", async payload => {
            const userId = payload.id
            // const busId = location.busId
            const userTaskId = 1
            
            console.log(userId, 'accepted the game!')
            // addGameInvite(userId, 'people')
            setGameStatusTo('ACCEPTED', userTaskId)

        })

        socket.on("complete_game", async payload => {
            const userId = payload.id
            const userTaskId = 1
            const result = payload.count
            
            console.log(userId, 'completed the game!')
            // addGameInvite(userId, 'people')
            setGameStatusTo('COMPLETED', userTaskId, result, moment().format())
        })

        socket.on("update", async location => {
            // const stop = _nearestStopOrNull(location);
            
            // check to see if user is on Bus
            // receive user ID
            // payload.id
            const userId = location.id
            const busId = location.busId

            // see if user is rider
            const amIOnBus = await _amIOnBus(userId)
            console.log(amIOnBus)
            if (amIOnBus && !busId) {
                socket.emit("shunt", { namespace: "riding", busId: amIOnBus.vehicle_id})
            }


            if (busId) {
                // may send you a task...
                // CHECK BUS POSITION, IF WITHIN RANGE OF A STOP WITH A TASK, SEND TASK INVITE.
                // i.e. DB change, and socket invite
                // only send if not yet pending

                const userTaskId = 1
                const taskDoesExist = await taskExists(userTaskId)

                if (!taskDoesExist) {
                    console.log('sending a task')
                    // socket[userTaskId] = true;
                    socket.emit('game', { type: 'people' })
                    addGameInvite(userId, 'people')
                } else {
                    console.log('no task to send')
                }
                // UPDATE DB to "pending"
                // setGameStatusTo('pending', userTaskId)
            }
            // if (!!stop) socket.emit("shunt", "idling", stop);
        });
        socket.on("disconnect", () => {
            // person has left, either because they moved or because they turned off their app
            // TODO
        });
    });

    const idling = io.of("/idling");
    idling.on("connection", socket => {
        console.log("Someone started idling");
        socket.client.busStop = socket.handshake.query["stop_num"];
        socket.join(socket.client.busStop);

        socket.on("update", location => {
            if (_nearestStopOrNull(location) !== socket.client.busStop) {
                socket.leave(socket.client.busStop);
                socket.emit("shunt", "fuck off");
            }
        });
        socket.on("disconnect", () => {
            // person has disconnected, either because they moved to `/riding` or because they turned off their app
        });
    });

    const riding = io.of("/riding");
    riding.on("connection", socket => {
        console.log("Someone started riding");

        socket.on("join", ({  busId }) => {
            socket.join(busId);
        })
        socket.on("update", data => {
            // if (_nearestStopOrNull(location) !== socket.client.busStop) {
            //     socket.leave(socket.client.busStop);
            //     socket.emit("shunt", "fuck off");
            // }
        });
        socket.on("disconnect", () => {
            // person has disconnected, because they've left the bus or because they've turned off their app
        });
    });
}

/**
 * Determine the current locative mode of a user given their coordinates.
 * @param coords
 * @returns {Bus|BusStop|Coordinates} either the bus that they're on, the bus stop that they're at, or just the same coordinates if they are outside the range of any thing.
 * @private
 */
function _determineLocation(coords) {
    return undefined; // TODO
}

/**
 * Decide on the initial location of a user once they open the app.
 *
 * Users could potentially open the app anywhere, even if they are already on public transport.
 * Figuring out where they are in important to providing the correct UX.
 * @param coords the original socket request, with data stored
 * @returns {['on bus'|'waiting'|'not close', *]} where the user is
 * @private
 */
function _locateUserInitially(coords) {
    const obj = _determineLocation(coords);
    if (obj instanceof BusStop) return ["waiting", obj];
    else if (obj instanceof Bus) return ["on bus", obj];
    else return ["not close", obj];
}

/**
 * Returns the stop number of the nearest bus stop if within a certain radius, or else `null`.
 * @param loc coordinates of the user
 * @returns {BusStop|null} Stop Number or null if outside range of any stop.
 * @private
 */
async function _nearestStopOrNull(loc) {
    // queries PostGIS for all stops where radial distance < 15m
    const origin = st.setSRID(st.makePoint(loc.long, loc.lat), SRID);
    const nearestStop = await knex
        .select("stop_no", st.y("point").as("latitude"), st.x("point").as("longitude"))
        .from("stops")
        .where(st.dwithin("point", origin, DISTANCE_THRESHOLD, true))
        .orderBy(st.distance("point", origin), "asc")
        .limit(1);

    if (nearestStop.length === 0) return null;

    return new BusStop(
        nearestStop[0]["stop_no"],
        new Coordinates(nearestStop[0]["latitude"], nearestStop[0]["longitude"])
    );
}


async function _amIOnBus(userId) {
    console.log('USER ID', userId)
    // // queries PostGIS for all stops where radial distance < 15m
    // const origin = st.setSRID(st.makePoint(loc.long, loc.lat), SRID);
    const riders = await knex
        .select().from("riders").where('user_id', '=', 1)
        .limit(1);

    if (riders.length === 0) return null;

    return riders[0]
}

async function taskExists(taskId) {
    // // queries PostGIS for all stops where radial distance < 15m
    // const origin = st.setSRID(st.makePoint(loc.long, loc.lat), SRID);
    const tasks = await knex
        .select().from("user_tasks").where('task_id', '=', taskId)
        .limit(1);

    return tasks[0]
}

async function addGameInvite(userId, gameType) {
    return knex('user_tasks').insert([
        {id: 1, task_id: 1, user_id: userId, status: 'PENDING', type: gameType, result: null, completed_at: null},
    ]);
}

async function setGameStatusTo(newTaskStatus, userTaskId, result, completed_at) {
    const rows = await knex('user_tasks')
        .where('id', '=', userTaskId)
        .update({
            status: newTaskStatus,
            result,
            completed_at
        })

    if (rows.length === 0) return null;

    return rows[0]
}
