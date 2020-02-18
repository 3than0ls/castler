// areas have configs as well, specifying attributes like entity and resource types. This class is created so we do not have to copy and paste config types every time we want to create one

module.exports = {
    lake: {
        type: 'lake',
        entities: [
            {type: 'frog', amount: 2},
        ],
        resources: [],
        entityLimit: 4,
        entityRespawnTime: 800,
        zIndex: 0,
    },
    mine: {
        type: 'mine',
        entities: [
            {type: 'beetle', amount: 2},
        ],
        resources: [
            {type: 'iron', amount: 4},
            {type: 'rock', amount: 4}
        ],
        entityLimit: 4,
        entityRespawnTime: 1000,
        zIndex: 1,
    }
};