import { Area } from "../../gameClasses/area";

export const areaUpdate = (socket, clientState) => {
    socket.on('areaStates', serverStateAreas => {
        for (let [areaID, area] of Object.entries(serverStateAreas)) {
            // if new area found, add it
            if (!clientState.areas[areaID]) {
                // if new id and info found, create new area and add it to client state
                const newArea = new Area(areaID, area.config);
                newArea.render(); // render area
                clientState.areas[areaID] = newArea;
            } else {
                //clientState.areas[areaID].animate();
            }
        }
    });
};

// perhaps not needed, areas only require a create
// also, reformat other game object socket updates to this format