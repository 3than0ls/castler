const imageSize = require('image-size');

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = class StructureState {
    constructor(config, parentID) {
        this.globalX = config.globalX;
        this.globalY = config.globalY;

        this.type = config.type;
        this.size = [imageSize(`./public/assets/structures/${config.type}.png`).width, imageSize(`./public/assets/structures/${config.type}.png`).height];
        this.config = config;
        this.parentID = parentID || null;

        this.structureID = 's' + Math.random().toString(36).substr(2, 9);
    }

    objectWithinRange(object) {
        if (object.globalX >= -this.size[0] + this.globalX && object.globalX <= this.size[0] + this.globalX &&
            object.globalY >= -this.size[1] + this.globalY && object.globalY <= this.size[1] + this.globalY) {
            return true;
        }
    }

    clear(serverState) {
        // clear area of previous resources and entities that exist inside structure
        for (let [resourceID, resource] of Object.entries(serverState.resources)) {
            if (this.objectWithinRange(resource)) {
                delete serverState.resources[resourceID];
            }
        }
        for (let [entityID, entity] of Object.entries(serverState.entities.entityState)) {
            if (this.objectWithinRange(entity)) {
                delete serverState.entities.entityState[entityID];
                delete serverState.entities.entityAI[entityID];
            }
        }
    }
}
