import { Entity } from "../../gameClasses/entity";

export const entityUpdate = (socket, clientState) => {
    socket.on('attacked', data => {
        clientState.entities[data.entityID].hit(data.vx, data.vy, data.collisionX, data.collisionY, data.attackSpeed);
    });
    socket.on('killed', data => {
        clientState.entities[data.entityID].die(data.collisionX, data.collisionY);
        delete clientState.entities[data.entityID];
    })
    socket.on('entityStates', serverStateEntities => {
        const entityIDs = Object.keys(serverStateEntities);
        for(let i = 0; i < entityIDs.length; i++) {
            // if new entity found, add it
            if (!clientState.entities[entityIDs[i]]) {
                // if new id and info found, create new entity and add it to client state
                let data = serverStateEntities[entityIDs[i]];
                const newEntity = new Entity(data.entityID, data.type, data.nuetrality, data.amount, data.globalX, data.globalY);
                newEntity.render(); // render entity
                clientState.entities[entityIDs[i]] = newEntity;
            }
            
            let data = serverStateEntities[entityIDs[i]];
            clientState.entities[entityIDs[i]].animate(
                data.globalX, data.globalY, data.angle, data.nuetrality
            );
        }
        // delete dead entities
        const clientEntityIDs = Object.keys(clientState.entities);
        // filters server ids from client ids, and if theres a difference remove it
        let entityDifference = entityIDs.filter(function(i) {return clientEntityIDs.indexOf(i) < 0; }); 
        for(let i = 0; i < entityDifference.length; i++) {
            clientState.entities[entityDifference[i]].delete();
            delete clientState.entities[entityDifference[i]];
        }
    });
};
