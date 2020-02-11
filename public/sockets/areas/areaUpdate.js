import { Area } from "../../gameClasses/area";

export const areaUpdate = (socket, clientState) => {
    socket.on('areaStates', serverStateAreas => {
        for (let area of Object.values(serverStateAreas).sort((a,b) => (a.zIndex > b.zIndex) ? 1 : ((b.zIndex > a.zIndex) ? -1 : 0))) { // render areas based on area z index
            // if new area found, add it
            if (!clientState.areas[area.areaID]) {
                // if new id and info found, create new area and add it to client state
                const newArea = new Area(area.areaID, area.config);
                newArea.render(); // render area
                clientState.areas[area.areaID] = newArea;
            } else {
                //clientState.areas[areaID].animate();
            }
        }
    });
};

// perhaps not needed, areas only require a create
// also, reformat other game object socket updates to this format