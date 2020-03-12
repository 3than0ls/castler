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
        this.dayTimeLength = 5000;
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
            let x = randomInt(minX, maxX);
            let y = randomInt(minY, maxY);

            if (homeAreaID === 'map') { // if home area is the map, then attempt to place entity outside of an inner area
                let attempts = 25;
                for (let i = 0; i < attempts; i++) {
                    for (let area of Object.values(this.areas.area)) {
                        if (area.objectInsideArea({globalX: x, globalY: y, size: 0})) { // create custom object to test
                            x = randomInt(minX, maxX); // tested values are inside area, randomly re-assign values and re-looop
                            y = randomInt(minY, maxY);
                        }
                    }
                }
            }
            let entity = new EntityAI(entityConfig, x, y, homeAreaID);
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
        for (let i = 0; i < amount; i++) {
            let crate = new CrateState(randomInt(minX, maxX), randomInt(minY, maxY), contents);
            this.crates.crate[crate.crateID] = crate;
            this.crates.crateData[crate.crateID] = crate.crateDataPackage();
        }
    }
    
    createAreas(amount, minX, minY, maxX, maxY, areaConfig) { 
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

    respawnTick() {
        // entity count will be decreased when an entity dies
        if (this.entityCount < this.entityLimit) {
            this.entityRespawnTick++;
            if (this.entityRespawnTick >= this.entityRespawnTime) {
                this.entityRespawnTick = 0;

                let config; // figure out which entity (entity config) to generate
                if (this.entityConfig.entities.length === 1) {
                    config = this.entityConfig.entities[0].config;
                } else if (this.entityConfig.entities.length > 1) {
                    let selector = Math.random();
                    for (let i = 0; i < this.entityConfig.entities.length; i++) { // calculates a random entity from the entity config
                        if (selector > i/this.entityConfig.entities.length && selector <= (i+1)/this.entityConfig.entities.length) {
                            config = this.entityConfig.entities[i].config;
                            break;
                        }
                    }
                }
                this.createEntities(
                    config, 1, 
                    -this.size[0]/2, -this.size[1]/2, 
                    this.size[0]/2, this.size[1]/2,
                    'map'
                );
                this.entityCount++;
            }
        }
    }

    cycleTime() {
        this.timeTick ++;
        if (this.timeTick > this.dayTimeLength) {
            this.timeTick = 0;
        }
    }

    update() {
        this.cycleTime();
        this.respawnTick();
    }


    test() {
        this.entityConfig = {
            entities: [
                {config: entityConfigs.duck, amount: 10}
            ],
        }
        // entity respawning in an area
        this.entityCount = 0;
        this.entityConfig.entities.forEach(entityData => { 
            this.createEntities(
                entityData.config, 
                entityData.amount, 
                -this.size[0]/2, -this.size[1]/2, 
                this.size[0]/2, this.size[1]/2,
                'map'
            );
            this.entityCount += entityData.amount 
        });
        this.entityLimit = 11;
        this.entityRespawnTime = 10;
        this.entityRespawnTick = 0;

        this.createResources('rock', 3, -700, -700, 700, 700);
        this.createCrate({wood:{amount:5,consumable:false}}, 1, -this.size[0]/2, -this.size[1]/2, this.size[0]/2, this.size[1]/2);
        this.createAreas(1, -this.size[0]/3, -this.size[1]/3, this.size[0]/3, this.size[1]/3, areaConfigs.lake);
    }
}