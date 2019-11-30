export const harvest = (socket, data) => {
    socket.emit('harvest', {
        resourceID: data.resourceID,
        amount: data.amount,
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
    data.amount
    data.vx
    data.vy
    data.collisionX
    data.collisionY
*/