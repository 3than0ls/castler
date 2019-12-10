const lootDrops = require('./lootDrops.js');

module.exports = class EntityState {
    constructor(globalX, globalY, type, neutrality, entityID) {
        this.entityID = entityID || 'e' + Math.random().toString(36).substr(2, 9);
        this.type = type;
        this.globalX = globalX || 0;
        this.globalY = globalY || 0;
        this.angle = Math.round((Math.random() - 0.5) * 360);
        this.playerHit = false;
        this.neutrality = neutrality || "passive";

        this.loot = lootDrops(type);

        switch (type) {
            case 'duck':
                this.health = 100;
                break;
            case 'boar':
                this.health = 250;
                break;
            default:
                this.health = 100;
                break;
        }
    }
    killed() {
        return this.health <= 0;
    }
}