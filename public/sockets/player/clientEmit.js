export const clientEmit = (socket, data) => {
    socket.emit('clientState', {
        vx: data.vx,
        vy: data.vy,
        collisionvx: data.collisionvx,
        collisionvy: data.collisionvy,
        angle: data.angle,
        swingAngle: data.swingAngle,
        displayHand: data.displayHand,
        structureHand: data.structureHand,
        focused: data.focused,
        id: socket.id,
    });
}

/* 
    data supplied should include these variables: 
    data.vx,
    data.vy,
    data.collisionvx,
    data.collisionvy,
    data.angle,
    data.swingAngle,
    data.displayHand,
    data.structureHand
*/