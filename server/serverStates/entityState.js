const lootDrops = require('./lootDrops.js');

module.exports = class EntityState {
    constructor(globalX, globalY, type, homeStructureID, entityID) {
        this.entityID = entityID || 'e' + Math.random().toString(36).substr(2, 9);
        this.type = type;
        this.globalX = globalX || 0;
        this.globalY = globalY || 0;
        this.homeStructureID = homeStructureID || 'map';
        this.angle = Math.round((Math.random() - 0.5) * 360);
        this.playerHit = false;

        this.loot = lootDrops(type);

        switch (type) { // type dependent entity variables
            case 'duck':
                this.health = 100;
                this.neutrality = "passive";
                break;
            case 'boar':
                this.health = 250;
                this.neutrality = "neutral";
                break;
            default:
                this.health = 100;
                this.neutrality = "passive";
                break;
        }
    }
    killed() {
        return this.health <= 0;
    }
}