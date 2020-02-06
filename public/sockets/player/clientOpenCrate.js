export function clientOpenCrate(socket, target) {
    socket.emit('clientOpenCrate', {
        target: target,
    });
}