class Effect {
    constructor(name, config) {
        this.name = name;
        this.effectOverTime = config.effectOverTime || false;
        if (this.effectOverTime) {
            this.effectSpeed = config.effectSpeed || 1000;
        }
        this.effect = config.effect || function() {};
        this.expires = config.expires || 1;
    }
}


module.exports = {
    swimming: new Effect('swimming', {
        effectOverTime: false,
        effect: function(user) {
            user.speed = Math.min(1.5, user.maxSpeed/2);
        }
    }),
    poisoned: new Effect('poisoned', {
        effectOverTime: true,
        effectSpeed: 200,
        effect: function(user) {
            user.health -= 3;
        },
        expires: 2000,
    }),

    warmed: new Effect('warmed', {
        effectOverTime: true,
        effectSpeed: 500,
        effect: function(user) {
            user.health ++;
        },
    })
}
