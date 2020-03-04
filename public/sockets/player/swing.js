export function swing(socket, data) {
    socket.emit('swing', data);
}