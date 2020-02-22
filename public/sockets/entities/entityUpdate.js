import { Entity } from "../../gameClasses/entity";

export const entityUpdate = (socket, clientState) => {
    socket.on('attacked', data => {
        if (clientState.entities[data.entityID]) {
            clientState.entities[data.entityID].hit(data.collisionX, data.collisionY);
        }
    });
    socket.on('killed', data => {
        clientState.entities[data.entityID].die(data.collisionX, data.collisionY);
        delete clientState.entities[data.entityID];
    })
    socket.on('entityStates', serverStateEntities => {
        for (let [entityID, entity] of Object.entries(serverStateEntities)) {
            // if new entity found, add it
            if (!clientState.entities[entityID]) {
                // if new id and info found, create new entity and add it to client state
                const newEntity = new Entity(entity.entityID, entity.type, entity.globalX, entity.globalY);
                newEntity.render(); // render entity
                clientState.entities[entityID] = newEntity;
            }
            clientState.entities[entityID].animate(entity.globalX, entity.globalY, entity.angle);
        }
        // delete dead entities
        const entityIDs = Object.keys(clientState.entities);
        // filters client enemies using server sent data
        let entityDifference = entityIDs.filter(function(entityID) {
            return !serverStateEntities[entityID]; // check if client has any entities that the server doesn't, and if so, filter it to a waste difference array
        }); 
        // delete entities in waste difference array
        for (let i = 0; i < entityDifference.length; i++) {
            clientState.entities[entityDifference[i]].delete();
            delete clientState.entities[entityDifference[i]];
        }
    });
};
