const ResourceState = require('./resourceState.js');
const EntityState = require('./entityState.js');
const EntityAI = require('./entityAI.js');
const CreateMap = require('./../createMap.js');

module.exports = class StructureState {
    constructor(config) {
        this.globalX = config.globalX;
        this.globalY = config.globalY;

        this.primaryColor = config.primaryColor;

        this.type = config.type;
        this.size = config.size;
        this.config = config;

        this.walls = config.walls;

        this.structureID = 's' + Math.random().toString(36).substr(2, 9);
    }

    objectInsideStructure(object, invert=false) {
        if (object.globalX >= -this.size[0]/2 + this.globalX && object.globalX <= this.size[0]/2 + this.globalX &&
            object.globalY >= -this.size[1]/2 + this.globalY && object.globalY <= this.size[1]/2 + this.globalY) {
            if (invert) {
                return false;
            }
            return true;
        }
    }

    create(serverState) {
        // clear area of previous resources, then insert in new ones
        // clear resources and entities
        this.clearedObjects = 0;
        for (let [resourceID, resource] of Object.entries(serverState.resources)) {
            if (this.objectInsideStructure(resource)) {
                delete serverState.resources[resourceID];
                this.clearedObjects++;
            }
        }
        for (let [entityID, entity] of Object.entries(serverState.entities.entityState)) {
            if (this.objectInsideStructure(entity)) {
                delete serverState.entities.entityState[entityID];
                delete serverState.entities.entityAI[entityID];
                this.clearedObjects++;
            }
        }
        // insert new resources and entities
        this.createdObjects = 0;
        for (let i = 0; i < this.config.resources.length; i++) {
            CreateMap.createResources(
                serverState.resources, this.config.resources[i].type, this.config.resources[i].amount,
                this.globalX-this.size[0]/2, this.globalY-this.size[1]/2, this.globalX+this.size[0]/2, this.globalY+this.size[1]/2,
            );
            this.createdObjects++;
        }

        for (let i = 0; i < this.config.entities.length; i++) {
            CreateMap.createEntities(
                serverState.entities, this.config.entities[i].type, this.config.entities[i].amount, 
                this.globalX-this.size[0]/2, this.globalY-this.size[1]/2, this.globalX+this.size[0]/2, this.globalY+this.size[1]/2,
                this.structureID,
            );
            this.createdObjects++;
        }
        // console.log(`Cleared ${this.clearedObjects} objects when constructing a '${this.type}' structure`);
        console.log(`Created ${this.createdObjects} object TYPES when constructing a '${this.type}' structure`);
    }
}
