export const clientEmit = (socket, data) => function() {
    socket.emit('clientState', {
        x: data.globalX,
        y: data.globalY,
        angle: data.angle,
        id: socket.id,
    });
}

/* 
    data supplied should include these variables: 
    data.globalX,
    data.globalY,
    data.angle,
*/