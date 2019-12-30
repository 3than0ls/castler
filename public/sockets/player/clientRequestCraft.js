export const clientRequestCraft = (socket, item) => {
    socket.emit('clientRequestCraft', {
        item: item,
    });
}