import { Structure } from "../../gameClasses/structure";

export const structureUpdate = (socket, clientState) => {
    socket.on('structureStates', serverStateStructures => {
        for(let [structureID, structure] of Object.entries(serverStateStructures)) {
            // if new structure found, add it
            if (!clientState.structures[structureID]) {
                // if new id and info found, create new structure and add it to client state
                const newStructure = new Structure(structureID, structure.config);
                newStructure.render(); // render structure
                clientState.structures[structureID] = newStructure;
            } else {
                clientState.structures[structureID].animate();
            }
        }
    });
};

// perhaps not needed, structures only require a create
// also, reformat other game object socket updates to this format