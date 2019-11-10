function listenToSockets(io) {
    const defaultNS = io.of('/'); // on initial opening, clients get dropped in the central pool
    defaultNS.on('connection', socket => {
        console.log('Someone has joined the default pool');

        const userLocationTuple = _locateUserInitially(new Coordinates(...socket.handshake.query));
        switch (userLocationTuple[0]) { // determine where they are
            case 'on bus':
                socket.emit('shunt', 'riding', userLocationTuple[1]);
                break;
            case 'waiting':
                socket.emit('shunt', 'idling', userLocationTuple[1]);
                break;
            case 'not close':
                socket.emit('shunt', 'fuck off');
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
        socket.client.busStop = socket.handshake.query['stop_num'];
        socket.join(socket.client.busStop);

        socket.on('update', location => {
            if (_nearestStopOrNull(location) !== socket.client.busStop) {
                socket.leave(socket.client.busStop);
                socket.emit('shunt', 'fuck off');
            }
        });
        socket.on('disconnect', () => { // person has disconnected, either because they moved to `/riding` or because they turned off their app
        });
    });

    const riding = io.of('/riding');
    riding.on('connection', socket => {
        console.log('Someone started riding');

        socket.on('disconnect', () => { // person has disconnected, because they've left the bus or because they've turned off their app
        })
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
    if (obj instanceof BusStop) return ['waiting', obj];
    else if (obj instanceof Bus) return ['on bus', obj];
    else return ['not close', obj];
}
/**
 * Returns the stop number of the nearest bus stop if within a certain radius, or else `null`.
 * @param loc coordinates of the user
 * @returns {string|null} Stop Number or null if outside range of any stop.
 * @private
 */
function _nearestStopOrNull(loc) { // queries PostGIS for all stops where radial distance < threshold
    return undefined; // TODO
}