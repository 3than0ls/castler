export const clientCreateStructure = (socket, data) => {
    socket.emit('clientCreateStructure', {
        type: data.type,
        globalX: data.globalX,
        globalY: data.globalY,
    });
}