import { Crate } from "../../../gameClasses/crate";

export const crateUpdate = (socket, clientState) => {
    socket.on('crateStates', serverStateCrates => {
        for (let [crateID, crate] of Object.entries(serverStateCrates)) {
            if (!clientState.crates[crateID]) {
                const newCrate = new Crate(crate.crateID, crate.contents, crate.globalX, crate.globalY);
                newCrate.render();
                clientState.crates[crate.crateID] = newCrate;
            }
            clientState.crates[crateID].update(crate.contents, crate.globalX, crate.globalY);
        }
        
        const crateIDs = Object.keys(clientState.crates);
        let crateDifference = crateIDs.filter(function(crateID) {
            return !serverStateCrates[crateID];
        }); 
        for (let i = 0; i < crateDifference.length; i++) {
            clientState.crates[crateDifference[i]].delete();
            delete clientState.crates[crateDifference[i]];
        }
    });
};
