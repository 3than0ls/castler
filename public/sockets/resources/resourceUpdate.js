import { Resource } from "../../gameClasses/resource";

export const resourceUpdate = (socket, clientState) => {
    socket.on('harvested', data => {
        clientState.resources[data.resourceID].hit(data.vx, data.vy, data.collisionX, data.collisionY, data.harvestSpeed);
    });
    socket.on('resourceStates', serverStateResources => {
        for (let [resourceID, resource] of Object.entries(serverStateResources)) {
            // if new resource found, add it
            if (!clientState.resources[resourceID]) {
                // if new id and info found, create new resource and add it to client state
                const newResource = new Resource(resource.resourceID, resource.type, resource.globalX, resource.globalY);
                newResource.render(); // render resource
                clientState.resources[resourceID] = newResource;
            }
            // update resources
            clientState.resources[resourceID].animate(resource.globalX, resource.globalY);
        }
        // delete un needed resources
        const entityIDs = Object.keys(clientState.resources);
        // filters client enemies using server sent data
        let resourceDifference = entityIDs.filter(function(entityID) {
            return !serverStateResources[entityID]; // check if client has any entities that the server doesn't, and if so, filter it to a waste difference array
        }); 
        // delete entities in waste difference array
        for (let i = 0; i < resourceDifference.length; i++) {
            clientState.resources[resourceDifference[i]].delete();
            delete clientState.resources[resourceDifference[i]];
        }
    });
};
