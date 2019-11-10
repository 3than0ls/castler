export const clientEmit = (socket, data) => {
    socket.emit('clientState', {
        globalX: data.globalX,
        globalY: data.globalY,
        angle: data.angle,
        displayHand: data.displayHand,
        id: socket.id,
    });
}

/* 
    data supplied should include these variables: 
    data.globalX,
    data.globalY,
    data.angle,
    data.displayHand
*/