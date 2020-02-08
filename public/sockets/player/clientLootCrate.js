export function clientLootCrate(socket, crateID) {
    socket.emit('clientLootCrate', {
        crateID: crateID,
    });
}