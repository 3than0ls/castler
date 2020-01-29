const imageSize = require('image-size')

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
        this.size = [imageSize(`./public/assets/areas/${config.type}.png`).width, imageSize(`./public/assets/areas/${config.type}.png`).height];
        this.config = config;

        this.spawnPadding = Math.round(((this.size[0] + this.size[1])/2)/15);

        // entity respawning in an area
        this.entityCount = 0;
        config.entities.forEach(entityData => { this.entityCount += entityData.amount });
        this.entityLimit = config.entityLimit || this.entityCount;
        this.entityRespawnTime = config.entityRespawnTime || 1000;
        this.entityRespawnTick = 0;

        this.areaID = 'a' + Math.random().toString(36).substr(2, 9);
    }

    objectInsideArea(object, invert=false) {
        if (object.globalX >= -this.size[0]/2 + this.globalX && object.globalX <= this.size[0]/2 + this.globalX &&
            object.globalY >= -this.size[1]/2 + this.globalY && object.globalY <= this.size[1]/2 + this.globalY) {
            if (invert) {
                return false;
            }
            return true;
        }
    }

    respawnTick(serverState, CreateMap) {
        // entity count will be decreased when an entity dies, which will be called in entityAI
        if (this.entityCount < this.entityLimit) {
            this.entityRespawnTick++;
            if (this.entityRespawnTick >= this.entityRespawnTime) {
                this.entityRespawnTick = 0;

                let type;
                if (this.config.entities.length === 1) {
                    type = this.config.entities[0].type;
                } else if (this.config.entities.length > 1) {
                    type = Math.random();
                    for (let i = 0; i < this.config.entities.length; i++) {
                        if (type > i/this.config.entities.length && type <= (i+1)/this.config.entities.length) {
                            type = this.config.entities[i].type;
                            break;
                        }
                    }
                }

                CreateMap.createEntities(
                    serverState, type, 1, 
                    this.globalX-this.size[0]/2+this.spawnPadding, this.globalY-this.size[1]/2+this.spawnPadding, 
                    this.globalX+this.size[0]/2-this.spawnPadding, this.globalY+this.size[1]/2-this.spawnPadding,
                    this.areaID
                );
                this.entityCount++;
            }
        }
    }

    create(serverState, CreateMap) {
        // clear area of previous resources, then insert in new ones
        // clear resources and entities
        this.clearedObjects = 0;
        for (let [resourceID, resource] of Object.entries(serverState.resources)) {
            if (this.objectInsideArea(resource)) {
                delete serverState.resources[resourceID];
                this.clearedObjects++;
            }
        }
        for (let [entityID, entity] of Object.entries(serverState.entities.entityState)) {
            if (this.objectInsideArea(entity)) {
                delete serverState.entities.entityState[entityID];
                delete serverState.entities.entityAI[entityID];
                this.clearedObjects++;
            }
        }
        for (let [structureID, structure] of Object.entries(serverState.structures)) {
            if (this.objectInsideArea(structure)) {
                delete serverState.structures[structureID];
                this.clearedObjects++;
            }
        }
        // insert new resources and entities
        this.createdObjects = 0;
        for (let i = 0; i < this.config.resources.length; i++) {
            CreateMap.createResources(
                serverState, this.config.resources[i].type, this.config.resources[i].amount,
                this.globalX-this.size[0]/2+this.spawnPadding, this.globalY-this.size[1]/2+this.spawnPadding, 
                this.globalX+this.size[0]/2-this.spawnPadding, this.globalY+this.size[1]/2-this.spawnPadding,
            );
            this.createdObjects++;
        }

        for (let i = 0; i < this.config.entities.length; i++) {
            CreateMap.createEntities(
                serverState, this.config.entities[i].type, this.config.entities[i].amount, 
                this.globalX-this.size[0]/2+this.spawnPadding, this.globalY-this.size[1]/2+this.spawnPadding, 
                this.globalX+this.size[0]/2-this.spawnPadding, this.globalY+this.size[1]/2-this.spawnPadding,
                this.areaID,
            );
            this.createdObjects++;
        }
        // console.log(`Cleared ${this.clearedObjects} objects when constructing a '${this.type}' area`);
        // console.log(`Created ${this.createdObjects} object TYPES when constructing a '${this.type}' area`);
    }
}
