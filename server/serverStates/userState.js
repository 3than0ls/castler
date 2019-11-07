module.exports = class UserState {
    constructor(clientID, globalX, globalY, angle) {
        this.clientID = clientID;
        this.globalX = globalX || undefined;
        this.globalY = globalY || undefined;
        this.angle = angle || undefined; // may cause issues with player being temporarily rendered in incorrect places
    }
    updateClientInfo(globalX, globalY, angle) {
        this.globalX = globalX;
        this.globalY = globalY;
        this.angle = angle;
    }
}