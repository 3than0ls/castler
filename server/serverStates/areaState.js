const imageSize = require('image-size');
const entityConfigs = require('./../gameConfigs/entityConfigs.js')
const areaConfigs = require('./../gameConfigs/areaConfigs.js')

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = class AreaState {
    constructor(config) {
        this.globalX = config.globalX;
        this.globalY = config.globalY;

        this.type = config.type;
        let baseType;
        switch (config.type) {
            case 'lake':
                baseType = 'lake';
                break;
            case 'mine':
            case 'rubyMine':
                baseType = 'mine';
                break;
        }
        this.size = [imageSize(`./public/assets/areas/${baseType}.png`).width, imageSize(`./public/assets/areas/${baseType}.png`).height];
        this.config = config;

        this.spawnPadding = Math.round(((this.size[0] + this.size[1])/2)/15);

        // entity respawning in an area
        this.entityCount = 0;
        config.entities.forEach(entityData => { this.entityCount += entityData.amount }); // count entity amount
        this.entityLimit = config.entityLimit || this.entityCount;
        this.entityRespawnTime = config.entityRespawnTime || 1000;
        this.entityRespawnTick = 0;

        this.zIndex = config.zIndex || 0;

        this.areaID = 'a' + Math.random().toString(36).substr(2, 9);
    }

    objectInsideArea(object, size=1) {
        if (object.globalX >= (-this.size[0]/2)*size + this.globalX && object.globalX <= (this.size[0]/2)*size + this.globalX &&
            object.globalY >= (-this.size[1]/2)*size + this.globalY && object.globalY <= (this.size[1]/2)*size + this.globalY) {
                return true;
        }
    }

    respawnTick(serverState) {
        // entity count will be decreased when an entity dies
        if (this.entityCount < this.entityLimit) {
            this.entityRespawnTick++;
            if (this.entityRespawnTick >= this.entityRespawnTime) {
                this.entityRespawnTick = 0;

                let config;
                if (this.config.entities.length === 1) {
                    config = areaConfigs[this.type].entities[0].config;
                } else if (areaConfigs[this.type].entities.length > 1) {
                    let selector = Math.random();
                    for (let i = 0; i < areaConfigs[this.type].entities.length; i++) {
                        if (selector > i/areaConfigs[this.type].entities.length && selector <= (i+1)/areaConfigs[this.type].entities.length) {
                            config = areaConfigs[this.type].entities[i].config;
                            break;
                        }
                    }
                }

                serverState.createEntities(
                    config, 1, 
                    this.globalX-this.size[0]/2+this.spawnPadding, this.globalY-this.size[1]/2+this.spawnPadding, 
                    this.globalX+this.size[0]/2-this.spawnPadding, this.globalY+this.size[1]/2-this.spawnPadding,
                    this.areaID
                );
                this.entityCount++;
            }
        }
    }

    create(serverState) {
        // clear area of previous resources, then insert in new ones
        // clear resources and entities
        this.clearedObjects = 0;
        for (let [resourceID, resource] of Object.entries(serverState.resources.resource)) {
            if (this.objectInsideArea(resource)) {
                delete serverState.resources.resource[resourceID];
                delete serverState.resources.resourceData[resourceID];
                this.clearedObjects++;
            }
        }
        for (let [entityID, entity] of Object.entries(serverState.entities.entity)) {
            if (this.objectInsideArea(entity)) {
                delete serverState.entities.entity[entityID];
                delete serverState.entities.entityData[entityID];
                this.clearedObjects++;
            }
        }
        for (let [structureID, structure] of Object.entries(serverState.structures.structure)) {
            if (this.objectInsideArea(structure)) {
                delete serverState.structures.structure[structureID];
                delete serverState.structures.structureData[structureID];
                this.clearedObjects++;
            }
        }
        // insert new resources and entities
        this.createdObjects = 0;
        for (let i = 0; i < this.config.resources.length; i++) {
            serverState.createResources(
                this.config.resources[i].type, this.config.resources[i].amount,
                this.globalX-this.size[0]/2+this.spawnPadding, this.globalY-this.size[1]/2+this.spawnPadding, 
                this.globalX+this.size[0]/2-this.spawnPadding, this.globalY+this.size[1]/2-this.spawnPadding,
            );
            this.createdObjects++;
        }

        for (let i = 0; i < this.config.entities.length; i++) {
            serverState.createEntities(
                this.config.entities[i].config, this.config.entities[i].amount, 
                this.globalX-this.size[0]/2+this.spawnPadding, this.globalY-this.size[1]/2+this.spawnPadding, 
                this.globalX+this.size[0]/2-this.spawnPadding, this.globalY+this.size[1]/2-this.spawnPadding,
                this.areaID,
            );
            this.createdObjects++;
        }
        // console.log(`Cleared ${this.clearedObjects} objects when constructing a '${this.type}' area`);
        // console.log(`Created ${this.createdObjects} object TYPES when constructing a '${this.type}' area`);
    }

    update(serverState) {
        this.respawnTick(serverState);
        serverState.areas.areaData[this.areaID] = this.areaDataPackage();
    }

    areaDataPackage() {
        return {
            areaID: this.areaID,
            type: this.type,
            globalX: this.globalX,
            globalY: this.globalY,
            zIndex: this.zIndex,
            config: this.config, // perhaps simplify later and only include what is needed from config?
        }
    }
}
