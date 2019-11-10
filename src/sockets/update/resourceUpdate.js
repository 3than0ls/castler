import { Resource } from "../../gameClasses/resource";

export const resourceUpdate = (socket, clientState) => {
    socket.on('resourceStates', serverStateResources => {
        const resourceIDs = Object.keys(serverStateResources);
        for(let i = 0; i < resourceIDs.length; i++) {
            // if new player found, add it
            if (!clientState.resources[resourceIDs[i]]) {
                // if new id and info found, create new resource and add it to client state
                let data = serverStateResources[resourceIDs[i]];
                const newResource = new Resource(data.resourceID, data.type, data.amount, data.globalX, data.globalY);
                newResource.render(); // render resource
                clientState.resources[resourceIDs[i]] = newResource;
            }
            
            let data = serverStateResources[resourceIDs[i]];
            clientState.resources[resourceIDs[i]].animate(
                data.globalX, data.globalY, data.amount
            );
        }
        /*
        // delete disconnected players
        const enemyIDs = Object.keys(clientState.enemies);
        // filters server ids from client ids, and if theres a difference remove it
        let userDifference = enemyIDs.filter(function(i) {return userIDs.indexOf(i) < 0; }); 
        for(let i = 0; i < userDifference.length; i++) {
            clientState.enemies[userDifference[i]].delete();
            delete clientState.enemies[userDifference[i]];
        }*/
    });
};
