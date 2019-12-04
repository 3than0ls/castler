module.exports = class EntityState {
    constructor(globalX, globalY, type, nuetrality, entityID) {
        this.entityID = entityID || 'e' + Math.random().toString(36).substr(2, 9);
        this.type = type;
        this.globalX = globalX || 0;
        this.globalY = globalY || 0;
        this.angle = Math.round((Math.random() - 0.5) * 360);
        this.playerHit = false;
        this.neutrality = nuetrality || "passive";

        this.health = 100;
    }
    killed() {
        return this.health <= 0;
    }
}