import { Structure } from "../../gameClasses/structure";

export const structureUpdate = (socket, clientState) => {
    socket.on('structureStates', serverStateStructures => {
        for (let [structureID, structure] of Object.entries(serverStateStructures)) {
            if (!clientState.structures[structureID]) {
                const newStructure = new Structure(structureID, structure.globalX, structure.globalY, structure.type);
                newStructure.render();
                clientState.structures[structureID] = newStructure;
            } else {
                clientState.structures[structureID].animate();
            }
        }
    });
};