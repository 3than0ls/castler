const ResourceState = require('./serverStates/resourceState.js');
const EntityState = require('./serverStates/entityState.js');
const EntityAI = require('./serverStates/entityAI.js');
const StructureState = require('./serverStates/structureState.js');
const AreaState = require('./serverStates/areaState.js');
const CrateState = require('./serverStates/crateState.js');
/*
const AreaState = require('./serverStates/areaState.js');
const StructureState = require('./serverStates/structureState.js');*/

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = class CreateMap {
    constructor(serverState, size) {
        this.resources = serverState.resources;
        this.entities = serverState.entities;
        this.areas = serverState.areas;
        this.structures = serverState.structures;

        this.size = size || [1000, 1000]
    }

    static createResources(serverState, type, amount, minX, minY, maxX=0, maxY=0) {
        for (let i = 0; i < amount; i++) {
            let resource = new ResourceState(randomInt(minX, maxX), randomInt(minY, maxY), type);
            serverState.resources[resource.resourceID] = resource;
        }
    }

    static createEntities(serverState, type, amount, minX, minY, maxX=0, maxY=0, homeAreaID) {
        for (let i = 0; i < amount; i ++) {
            let entity = new EntityState(randomInt(minX, maxX), randomInt(minY, maxY), type, homeAreaID);
            serverState.entities.entityState[entity.entityID] = entity;
            serverState.entities.entityAI[entity.entityID] = new EntityAI(entity.entityID, entity);
            serverState.entities.entityAI[entity.entityID].displaceIfInsideObject(serverState, minX, minY, maxX, maxY);
        }
    }

    static createStructures(serverState, amount, minX, minY, maxX, maxY, structureConfig) {
        for (let i = 0; i < amount; i ++) {
            let config = JSON.parse(JSON.stringify(structureConfig)); // created a deep clone copy of the config and edit it if necessary
            if (!config.globalX) config.globalX = randomInt(minX, maxX);
            if (!config.globalY) config.globalY = randomInt(minY, maxY);
            let structure = new StructureState(config);
            serverState.structures[structure.structureID] = structure;
            structure.clear(serverState);
        }
    }

    static createCrate(serverState, contents, amount, minX, minY, maxX=0, maxY=0) {
        for (let i = 0; i < amount; i++) {
            let crate = new CrateState(randomInt(minX, maxX), randomInt(minY, maxY), contents);
            serverState.crates[crate.crateID] = crate;
        }
    }
    
    static createAreas(serverState, amount, minX, minY, maxX, maxY, areaConfig, zIndex) { 
        // area state takes special variables because inside area state, this file is also imported, which clashes with each other
        // to fix this, we don't import this file in area state, but rather pass this class off as a parameter that's used in area state to create entities and resources

        for (let i = 0; i < amount; i ++) {
            let config = JSON.parse(JSON.stringify(areaConfig)); // created a deep clone copy of the config and edit it if necessary
            if (!config.globalX) config.globalX = randomInt(minX, maxX);
            if (!config.globalY) config.globalY = randomInt(minY, maxY);
            let area = new AreaState(config, zIndex + i);
            serverState.areas[area.areaID] = area;
            area.create(serverState, CreateMap);
        }
    }
    
    boundaryResource() {
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
        }
    }
    test(serverState) {
        const size = this.size;
        
        CreateMap.createResources(serverState, 'tree', size[0]/120, -size[0]/2, -size[1]/2, size[0]/2, size[1]/2);
        CreateMap.createResources(serverState, 'rock', size[1]/120, -size[0]/2, -size[1]/2, size[0]/2, size[1]/2);

        CreateMap.createEntities(serverState, 'duck', size[0]/120, -size[0]/2, -size[1]/2, size[0]/2, size[1]/2);
        CreateMap.createEntities(serverState, 'boar', size[1]/140, -size[0]/2, -size[1]/2, size[0]/2, size[1]/2);

        CreateMap.createStructures(serverState, 3, -1000, -1000, 1000, 1000, { type: 'workbench' });
        CreateMap.createStructures(serverState, 3, -1000, -1000, 1000, 1000, { type: 'furnace' });

        
        CreateMap.createAreas(serverState, 2, -size[0]/3, -size[1]/3, size[0]/3, size[1]/3, {
            type: 'lake',
            entities: [
                {type: 'frog', amount: 2},
            ],
            resources: [],
            entityLimit: 4,
        });

        CreateMap.createAreas(serverState, 2, -size[0]/3, -size[1]/3, size[0]/3, size[1]/3, {
            type: 'mine',
            entities: [
                {type: 'beetle', amount: 2},
            ],
            resources: [
                {type: 'iron', amount: 4},
                {type: 'rock', amount: 4}
            ],
            entityLimit: 4,
        });
    }
    test2(serverState) {
        const size = this.size;
        CreateMap.createStructures(serverState, 3, -1000, -1000, 1000, 1000, { type: 'workbench' });
        CreateMap.createStructures(serverState, 3, -1000, -1000, 1000, 1000, { type: 'furnace' });
        
        CreateMap.createResources(serverState, 'tree', 4, -size[0]/2, -size[1]/2, size[0]/2, size[1]/2);
        CreateMap.createResources(serverState, 'rock', 4, -size[0]/2, -size[1]/2, size[0]/2, size[1]/2);
        CreateMap.createEntities(serverState, 'duck', 4, -size[0]/2, -size[1]/2, size[0]/2, size[1]/2);
        CreateMap.createEntities(serverState, 'boar', 4, -size[0]/2, -size[1]/2, size[0]/2, size[1]/2);
    }

    test3(serverState) {
        const size = this.size;
        CreateMap.createResources(serverState, 'rock', 1, -size[0]/2, -size[1]/2, size[0]/2, size[1]/2);
        CreateMap.createEntities(serverState, 'duck', 2, -size[0]/2, -size[1]/2, size[0]/2, size[1]/2);
        CreateMap.createStructures(serverState, 1, -size[0]/2, -size[1]/2, size[0]/2, size[1]/2, { type: 'workbench' });
    }

    test4(serverState) {
        const size = this.size;
        
        CreateMap.createResources(serverState, 'tree', size[0]/120, -size[0]/2, -size[1]/2, size[0]/2, size[1]/2);
        CreateMap.createResources(serverState, 'rock', size[1]/120, -size[0]/2, -size[1]/2, size[0]/2, size[1]/2);

        CreateMap.createEntities(serverState, 'duck', size[0]/120, -size[0]/2, -size[1]/2, size[0]/2, size[1]/2);
        CreateMap.createEntities(serverState, 'boar', size[1]/140, -size[0]/2, -size[1]/2, size[0]/2, size[1]/2);
        
        CreateMap.createCrate(serverState, 
            { 
                stone: {
                    amount: 20,
                    consumable: false,
                },
                wood: {
                    amount: 20,
                    consumable: false,
                },
        }, 3, -size[0]/2, -size[1]/2, size[0]/2, size[1]/2)

        // create more restrictive and accurate spawn area based on area size later
        CreateMap.createAreas(serverState, 1, -size[0]/3, -size[1]/3, size[0]/3, size[1]/3, {
            type: 'lake',
            entities: [
                {type: 'frog', amount: 2},
            ],
            resources: [],
            entityLimit: 4,
        }, 0);

        CreateMap.createAreas(serverState, 1, -size[0]/3, -size[1]/3, size[0]/3, size[1]/3, {
            type: 'mine',
            entities: [
                {type: 'beetle', amount: 2},
            ],
            resources: [
                {type: 'iron', amount: 4},
                {type: 'rock', amount: 4}
            ],
            entityLimit: 4,
        }, 1);
    }
}