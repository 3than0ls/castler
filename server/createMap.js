const ResourceState = require('./serverStates/resourceState.js');
const EntityState = require('./serverStates/entityState.js');
const EntityAI = require('./serverStates/entityAI.js');

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = class CreateMap {
    constructor(serverState, size) {
        this.resources = serverState.resources;
        this.entities = serverState.entities;

        this.size = size || [1000, 1000]
    }

    static createResources(resources, type, amount, minX, minY, maxX=0, maxY=0) {
        for (let i = 0; i < amount; i++) {
            let resource = new ResourceState(randomInt(minX, maxX), randomInt(minY, maxY), type);
            resources[resource.resourceID] = resource;
        }
    }
    static createEntities(entities, type, amount, minX, minY, maxX=0, maxY=0, homeStructureID) {
        for (let i = 0; i < amount; i ++) {
            let entity = new EntityState(randomInt(minX, maxX), randomInt(minY, maxY), type, homeStructureID);
            entities.entityState[entity.entityID] = entity;
            entities.entityAI[entity.entityID] = new EntityAI(entity.entityID, entity);
        }
    }

    create() {
        // create map boundaries using resource obstacles
        /*
        const size = this.size;
        const increment = 160;
        for (let i = 0; i <= size[0]; i += increment) {
            let topRowResource = new ResourceState((-size[0]/2) + i, -size[1]/2 + randomInt(0, 60), 'tree');
            this.resources[topRowResource.resourceID] = topRowResource;

            let bottomRowResource = new ResourceState((-size[0]/2) + i, size[1]/2 + randomInt(0, 60), 'tree');
            this.resources[bottomRowResource.resourceID] = bottomRowResource;
        }
        for (let i = 0; i <= size[1]; i += increment) {
            let leftRowResource = new ResourceState(-size[0]/2 + randomInt(0, 60), (-size[1]/2) + i, 'tree');
            this.resources[leftRowResource.resourceID] = leftRowResource;

            let rightRowResource = new ResourceState(size[0]/2 + randomInt(0, 60), (-size[1]/2) + i, 'tree');
            this.resources[rightRowResource.resourceID] = rightRowResource;
        }*/

        this.test();
    }
    test() {
        
        const size = this.size;
        CreateMap.createResources(this.resources, 'tree', size[0]/120, -size[0]/2, -size[1]/2, size[0]/2, size[1]/2);
        CreateMap.createResources(this.resources, 'rock', size[1]/120, -size[0]/2, -size[1]/2, size[0]/2, size[1]/2);

        CreateMap.createEntities(this.entities, 'duck', size[0]/120, -size[0]/2, -size[1]/2, size[0]/2, size[1]/2);
        CreateMap.createEntities(this.entities, 'boar', size[1]/140, -size[0]/2, -size[1]/2, size[0]/2, size[1]/2);
    }
}