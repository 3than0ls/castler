export const resourceEmit = (socket, data) => {
    socket.emit('resourceState', {
        globalX: data.globalX,
        globalY: data.globalY,
        resourceID: data.resourceID,
        amount: data.amount
    });
}

/* 
    data supplied should include these variables: 
    data.globalX,
    data.globalY,
    data.resourceID,
*/