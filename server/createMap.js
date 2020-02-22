const ResourceState = require('./serverStates/resourceState.js');
const EntityState = require('./serverStates/entityState.js');
const EntityAI = require('./serverStates/entityAI.js');
const StructureState = require('./serverStates/structureState.js');
const AreaState = require('./serverStates/areaState.js');
const CrateState = require('./serverStates/crateState.js');

const areaConfigs = require('./gameConfigs/areaConfigs.js');
const entityConfigs = require('./gameConfigs/entityConfigs');
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
            serverState.resources.resource[resource.resourceID] = resource;
            serverState.resources.resourceData[resource.resourceID] = resource;
        }
    }

    static createEntities(serverState, entityConfig, amount, minX, minY, maxX=0, maxY=0, homeAreaID) {
        for (let i = 0; i < amount; i ++) {
            let entity = new EntityAI(entityConfig, randomInt(minX, maxX), randomInt(minY, maxY), homeAreaID);
            serverState.entities.entity[entity.entityID] = entity;
            serverState.entities.entityData[entity.entityID] = entity.entityDataPackage();
        }
    }

    static createStructures(serverState, amount, minX, minY, maxX, maxY, structureConfig) {
        for (let i = 0; i < amount; i ++) {
            let config = JSON.parse(JSON.stringify(structureConfig)); // created a deep clone copy of the config and edit it if necessary
            if (!config.globalX) config.globalX = randomInt(minX, maxX);
            if (!config.globalY) config.globalY = randomInt(minY, maxY);
            let structure = new StructureState(config);
            serverState.structures.structure[structure.structureID] = structure;
            serverState.structures.structureData[structure.structureID] = structure;
            structure.clear(serverState);
        }
    }

    static createCrate(serverState, contents, amount, minX, minY, maxX=0, maxY=0) {
        for (let i = 0; i < amount; i++) {
            let crate = new CrateState(randomInt(minX, maxX), randomInt(minY, maxY), contents);
            serverState.crates.crate[crate.crateID] = crate;
            serverState.crates.crateData[crate.crateID] = crate.crateDataPackage();
        }
    }
    
    static createAreas(serverState, amount, minX, minY, maxX, maxY, areaConfig, zIndex) { 
        // area state takes special variables because inside area state, this file is also imported, which clashes with each other
        // to fix this, we don't import this file in area state, but rather pass this class off as a parameter that's used in area state to create entities and resources

        for (let i = 0; i < amount; i ++) {
            let config = JSON.parse(JSON.stringify(areaConfig)); // created a deep clone copy of the config and edit it if necessary
            if (!config.globalX) config.globalX = randomInt(minX, maxX);
            if (!config.globalY) config.globalY = randomInt(minY, maxY);
            let area = new AreaState(config);
            serverState.areas.area[area.areaID] = area;
            serverState.areas.areaData[area.areaID] = area.areaDataPackage();
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

    test4(serverState) {
        CreateMap.createEntities(serverState, entityConfigs.duck, 1, -this.size[0]/2, -this.size[1]/2, this.size[0]/2, this.size[1]/2);
        CreateMap.createEntities(serverState, entityConfigs.boar, 2, -this.size[0]/2, -this.size[1]/2, this.size[0]/2, this.size[1]/2);
        CreateMap.createEntities(serverState, entityConfigs.frog, 2, -this.size[0]/2, -this.size[1]/2, this.size[0]/2, this.size[1]/2);
        // CreateMap.createEntities(serverState, entityConfigs.beetle, 2, -this.size[0]/2, -this.size[1]/2, this.size[0]/2, this.size[1]/2);

        CreateMap.createStructures(serverState, 1, -this.size[0]/2, -this.size[1]/2, this.size[0]/2, this.size[1]/2, {type:'workbench'});
        CreateMap.createCrate(serverState, {wood:{amount:5,consumable:false}}, 1, -this.size[0]/2, -this.size[1]/2, this.size[0]/2, this.size[1]/2);
        CreateMap.createCrate(serverState, {stone:{amount:5,consumable:false}}, 1, -this.size[0]/2, -this.size[1]/2, this.size[0]/2, this.size[1]/2);
        CreateMap.createCrate(serverState, {ruby:{amount:5,consumable:false}}, 1, -this.size[0]/2, -this.size[1]/2, this.size[0]/2, this.size[1]/2);

        CreateMap.createAreas(serverState, 1, -this.size[0]/3, -this.size[1]/3, this.size[0]/3, this.size[1]/3, areaConfigs.mine);
    }
}