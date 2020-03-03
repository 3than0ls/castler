export function timeTick(socket, clientState) {
    socket.on('timeTick', timeTick => {
        clientState.timeTick = timeTick;
    });
}
