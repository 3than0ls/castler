export const clientEmit = (socket, data) => {
    console.log('client')
    socket.emit('clientState', {
        globalX: data.globalX,
        globalY: data.globalY,
        angle: data.angle,
        swingAngle: data.swingAngle,
        displayHand: data.displayHand,
        id: socket.id,
    });
}

/* 
    data supplied should include these variables: 
    data.globalX,
    data.globalY,
    data.angle,
    data.swingAngle
    data.displayHand
*/