const imageSize = require('image-size');
const items = require('./../gameConfigs/items.js');

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

        this.health;
        switch (this.type) {
            case 'furnace': 
                this.health = 150;
                break;
            case 'workbench':
                this.health = 150;
                break;
            default: 
                this.health = 100;
        }

        this.structureID = 's' + Math.random().toString(36).substr(2, 9);
    }

    objectWithinRange(object) {
        if (object.globalX >= -this.size[0] + this.globalX && object.globalX <= this.size[0] + this.globalX &&
            object.globalY >= -this.size[1] + this.globalY && object.globalY <= this.size[1] + this.globalY) {
            return true;
        }
    }

    destroyed(createMap, serverState) {
        /* individual bags
        for (let [itemName, itemAmount] of Object.entries(items[this.type].recipes[0])) {
            createMap.createCrate(serverState, {
                [itemName]: {
                    amount: itemAmount,
                    consumable: items[itemName].consumable
                }
            }, 1, this.globalX - this.size[0]/3, this.globalY - this.size[1]/3, this.globalX + this.size[0]/3, this.globalY + this.size[1]/3)
        }*/
        let inventory = {};
        for (let [itemName, itemAmount] of Object.entries(items[this.type].recipes[0])) {
            inventory[itemName] = {
                amount: itemAmount,
                consumable: items[itemName].consumable
            }
        }
        createMap.createCrate(serverState, inventory, 1, this.globalX - this.size[0]/3, this.globalY - this.size[1]/3, this.globalX + this.size[0]/3, this.globalY + this.size[1]/3)
    }

    clear(serverState) {
        // clear area of previous resources and entities that exist inside structure
        for (let [resourceID, resource] of Object.entries(serverState.resources.resource)) {
            if (this.objectWithinRange(resource)) {
                delete serverState.resources.resource[resourceID];
            }
        }
        for (let [entityID, entity] of Object.entries(serverState.entities.entity)) {
            if (this.objectWithinRange(entity)) {
                delete serverState.entities.entity[entityID];
                delete serverState.entities.entityData[entityID];
            }
        }
    }

    update(serverState) {
        serverState.structures.structureData[this.structureID] = this.structureDataPackage();
    }

    structureDataPackage() {
        return {
            structureID: this.structureID,
            type: this.type,
            globalX: this.globalX,
            globalY: this.globalY,
        }
    }
}
