module.exports = class ResourceState {
    constructor(globalX, globalY, type, resourceID) {
        this.resourceID = resourceID || 'r' + Math.random().toString(36).substr(2, 9);
        this.type = type;
        this.globalX = globalX || 0;
        this.globalY = globalY || 0;
        this.amount = 50;
    }
    updateClientInfo(globalX, globalY, amount) {
        this.globalX = globalX;
        this.globalY = globalY;
        this.amount = amount;
    }
}