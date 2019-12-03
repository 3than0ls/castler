module.exports = class ResourceState {
    constructor(globalX, globalY, type, resourceID) {
        this.resourceID = resourceID || 'r' + Math.random().toString(36).substr(2, 9);
        this.type = type;
        this.globalX = globalX || 0;
        this.globalY = globalY || 0;
        this.playerHit = false;
        this.amount = 50;
    }
    harvest(amount) {
        this.amount -= amount;
    }
}