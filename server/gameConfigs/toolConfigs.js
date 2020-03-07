// tool stats
module.exports = {
    wood: {
        damage: 25,
        harvestSpeed: 2,
        attackSpeed: 2,
    },
    stone: {
        damage: 35,
        harvestSpeed: 2.3,
        attackSpeed: 2.3,
    },
    iron: {
        damage: 55,
        harvestSpeed: 2.8,
        attackSped: 2.8,
    },
    mandible: {
        damage: 55,
        harvestSpeed: 3,
        attackSpeed: 3,
        hitEffects: ['poisoned'],
    },
    ruby: {
        damage: 35,
        harvestSpeed: 5,
        attackSpeed: 5,
    }
}

/* 
    name: {
        damage: num
        harvestSpeed: num
        attackSpeed: num
        hitEffects: [str,]
        holdEffects: [str,]
    }

*/