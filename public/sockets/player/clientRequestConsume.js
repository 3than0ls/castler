export const clientRequestConsume = (socket, item) => {
    socket.emit('clientRequestConsume', {
        item: item,
    });
}