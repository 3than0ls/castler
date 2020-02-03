export const dropItem = (socket, type, amount) => {
    socket.emit('dropItem', {
        type: type,
        amount: amount,
    });
};
