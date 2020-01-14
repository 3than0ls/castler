export const attack = (socket, data) => {
    socket.emit('attack', {
        entityID: data.entityID,
        vx: data.vx,
        vy: data.vy,
        collisionX: data.collisionX,
        collisionY: data.collisionY,
        harvestSpeed: data.harvestSpeed,
        id: socket.id,
    })
}

/* 
    data supplied should include these variables: 
    data.resourceID
    data.vx
    data.vy
    data.collisionX
    data.collisionY
*/