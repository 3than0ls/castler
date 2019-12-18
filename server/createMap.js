const ResourceState = require('./serverStates/resourceState.js');
const EntityState = require('./serverStates/entityState.js');
const EntityAI = require('./serverStates/entityAI.js');

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = class CreateMap {
    constructor(serverState) {
        this.resources = serverState.resources;
        this.entities = serverState.entities;
    }
    createResources(type, amount, x, y, maxX=0, maxY=0) {
        for(let i = 0; i < amount; i++) {
            let resource = new ResourceState(randomInt(x, maxX), randomInt(y, maxY), type);
            this.resources[resource.resourceID] = resource;
        }
    }
    createEntities(type, amount, x, y, maxX=0, maxY=0) {
        for (let i = 0; i < amount; i ++) {
            let entity = new EntityState(randomInt(x, maxX), randomInt(y, maxY), type);
            this.entities.entityState[entity.entityID] = entity;
            this.entities.entityAI[entity.entityID] = new EntityAI(entity.entityID, entity);
        }
    }
    test() {
        this.createResources('tree', 4, -800, -800, 800, 800);
        this.createResources('rock', 4, -800, -800, 800, 800);

        this.createEntities('duck', 25, -900, -900, 900, 900);
        this.createEntities('boar', 5, -900, -900, 900, 900);
    }
}