export const craftableItemsUpdate = (socket, craftableItems) => {
    socket.on('craftableItemsUpdate', craftableItemsState => {
        craftableItems.length = 0; // clear the craftable items
        for (let i = 0; i < craftableItemsState.length; i++) {
            craftableItems.push(craftableItemsState[i]); // repopulate the craftable items array with server sent values
        }
    });
};
