import { Structure } from "../../gameClasses/structure";

export const structureUpdate = (socket, clientState) => {
    socket.on('hit', data => {
        if (!data.harvestSpeed) data.harvestSpeed = 4;
        clientState.structures[data.structureID].hit(data.vx, data.vy, data.collisionX, data.collisionY, data.harvestSpeed);
    });
    socket.on('structureStates', serverStateStructures => {
        for (let [structureID, structure] of Object.entries(serverStateStructures)) {
            if (!clientState.structures[structureID]) {
                const newStructure = new Structure(structureID, structure.globalX, structure.globalY, structure.type);
                newStructure.render();
                clientState.structures[structureID] = newStructure;
            }
            clientState.structures[structureID].animate(structure.globalX, structure.globalY);
        }
        // delete missing structures
        const structureIDs = Object.keys(clientState.structures);
        let structureDifference = structureIDs.filter(function(structureID) {
            return !serverStateStructures[structureID];
        }); 
        for (let i = 0; i < structureDifference.length; i++) {
            clientState.structures[structureDifference[i]].delete();
            delete clientState.structures[structureDifference[i]];
        }
    });
};