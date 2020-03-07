// game states
const UserState = require('./userState.js');
const EntityAI = require('./entityAI.js');
const ResourceState = require('./resourceState.js');
const StructureState = require('./structureState.js');
const AreaState = require('./areaState.js');
const CrateState = require('./crateState.js');

// game config data files
const entityConfigs = require('../gameConfigs/entityConfigs.js');
const areaConfigs = require('../gameConfigs/areaConfigs.js');

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


module.exports = class ServerStates {
    constructor(size) {
        this.size = size;
        let emptyServerState = {
            users: {
                userData: {}, // data we send to clients
                user: {},   // data that controls and has functions of the user
            },
            resources: {
                resourceData: {},
                resource: {},
            }, 
            entities: {
                entityData: {}, // the data we send to the client holding positioning and other info about entities
                entity: {},  // controls the entity and tells it where to move, but the functions used don't need to be sent to client
            },
            areas: {
                areaData: {},
                area: {},
            },
            structures: {
                structureData: {},
                structure: {},
            },
            crates: {
                crateData: {},
                crate: {},
            }, // crates are containers of dropped items from players
        
            timeTick: 0,
        };
        Object.assign(this, emptyServerState);
    }

    createUser(socketID) {
        let newUserState = new UserState(socketID);
        this.users.user[socketID] = newUserState;
        this.users.userData[socketID] = newUserState.clientDataPackage();
        console.log("Client joined: " + socketID);
    }

    createResources(type, amount, minX, minY, maxX=0, maxY=0) {
        for (let i = 0; i < amount; i++) {
            let resource = new ResourceState(randomInt(minX, maxX), randomInt(minY, maxY), type);
            this.resources.resource[resource.resourceID] = resource;
            this.resources.resourceData[resource.resourceID] = resource;
        }
    }

    createEntities(entityConfig, amount, minX, minY, maxX=0, maxY=0, homeAreaID) {
        for (let i = 0; i < amount; i ++) {
            let entity = new EntityAI(entityConfig, randomInt(minX, maxX), randomInt(minY, maxY), homeAreaID);
            this.entities.entity[entity.entityID] = entity;
            this.entities.entityData[entity.entityID] = entity.entityDataPackage();
        }
    }

    createStructures(amount, minX, minY, maxX, maxY, structureConfig, parentID=undefined) {
        for (let i = 0; i < amount; i ++) {
            let config = JSON.parse(JSON.stringify(structureConfig)); // created a deep clone copy of the config and edit it if necessary
            if (!config.globalX) config.globalX = randomInt(minX, maxX);
            if (!config.globalY) config.globalY = randomInt(minY, maxY);
            let structure = new StructureState(config, parentID);
            this.structures.structure[structure.structureID] = structure;
            this.structures.structureData[structure.structureID] = structure.structureDataPackage();
            structure.clear(this);
        }
    }

    createCrate(contents, amount, minX, minY, maxX=0, maxY=0) {
        console.log('a')
        for (let i = 0; i < amount; i++) {
            let crate = new CrateState(randomInt(minX, maxX), randomInt(minY, maxY), contents);
            this.crates.crate[crate.crateID] = crate;
            this.crates.crateData[crate.crateID] = crate.crateDataPackage();
        }
    }
    
    createAreas(amount, minX, minY, maxX, maxY, areaConfig, zIndex) { 
        // area state takes special variables because inside area state, this file is also imported, which clashes with each other
        // to fix this, we don't import this file in area state, but rather pass this class off as a parameter that's used in area state to create entities and resources

        for (let i = 0; i < amount; i ++) {
            let config = JSON.parse(JSON.stringify(areaConfig)); // created a deep clone copy of the config and edit it if necessary
            if (!config.globalX) config.globalX = randomInt(minX, maxX);
            if (!config.globalY) config.globalY = randomInt(minY, maxY);
            let area = new AreaState(config);
            this.areas.area[area.areaID] = area;
            this.areas.areaData[area.areaID] = area.areaDataPackage();
            area.create(this);
        }
    }


    test() {
        this.createEntities(entityConfigs.duck, 11, -this.size[0]/2, -this.size[1]/2, this.size[0]/2, this.size[1]/2);
        this.createResources('rock', 3, -700, -700, 700, 700);
        this.createStructures(1, -this.size[0]/2, -this.size[1]/2, this.size[0]/2, this.size[1]/2, {type:'workbench'});
        this.createCrate({wood:{amount:5,consumable:false}}, 1, -this.size[0]/2, -this.size[1]/2, this.size[0]/2, this.size[1]/2);
        this.createAreas(1, -this.size[0]/3, -this.size[1]/3, this.size[0]/3, this.size[1]/3, areaConfigs.lake);
    }
}