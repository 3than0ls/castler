class Item {
    constructor(name, config) {
        this.name = name;
        this.primary = config.primary; // primary items are acquired, not crafted, and thus don't have a recipe
        this.consumable = config.consumable || false;
        this.consumeFunction = config.consumeFunction || function(user) {};
        this.craftingTime = config.craftingTime || 1000;
        this.consumedOnCraft = config.consumedOnCraft || false;
        this.craftingStructure = config.craftingStructure || undefined;
        if (!this.primary) {
            this.recipes = config.recipes; // should be a list of recipes that can be used to make this item
        }
    }
    craft(player) {
        let canCraftRecipe = this.canCraft(player.inventory); // canCraftRecipe will return the crafting recipe used if true
        if (canCraftRecipe) {
            for (let recipeItem in canCraftRecipe) {
                player.inventory[recipeItem].amount -= canCraftRecipe[recipeItem];
                if (player.inventory[recipeItem].amount === 0) {
                    delete player.inventory[recipeItem];
                }
            }

            if (!this.consumedOnCraft) {
                if (!player.inventory[this.name]) { // if item doesn't exist in inventory, create it
                    player.inventory[this.name] = {
                        consumable: this.consumable,
                        amount: 0,
                    };
                }
                player.inventory[this.name].amount += 1;
            } else {
                // if consumed on craft is true, automatically consume item
                this.consumeFunction(player);
            }
        }
    }
    canCraft(inventory) {
        if (!this.primary) {
            recipeNumber: for (let i = 0; i < this.recipes.length; i++) { // loop through each different recipe of an item
                // console.log(`\nIterating over recipe number ${i}: ${JSON.stringify(this.recipes[i])}`);
                let hasItems = []; // create a has item array
                for (let recipeItem in this.recipes[i]) { // for each recipe item in a recipe
                    if (!inventory[recipeItem]) {
                        // console.log(`The inventory does not have the items neccesary to craft ${this.name} using the ${JSON.stringify(this.recipes[i])} recipe`);
                        // console.log(`Item needed: ${recipeItem}. Continuing to next recipe`)
                        continue recipeNumber; // a recipe item is missing, skip to next possible recipe (if there are none left, exits loop)
                    } else {
                        if (inventory[recipeItem].amount >= this.recipes[i][recipeItem]) { // if the inventory has more than or equal to the amount required
                            // console.log(`The inventory has enough ${recipeItem} (${inventory[recipeItem]}) to make ${this.name} (amount needed: ${this.recipes[i][recipeItem]})`);
                            hasItems.push(true);
                        } else {
                            // console.log(`The inventory doesn't have enough ${recipeItem} (${inventory[recipeItem]}) to make ${this.name} (amount needed: ${this.recipes[i][recipeItem]})`);
                            // console.log(`Not enough of ${recipeItem} in inventory. Amount required: ${this.recipes[i][recipeItem]}. Continuing to next recipe`)
                            continue recipeNumber; // there is not enough of a recipe item in the inventory to craft item, skip to next possible recipe
                        }
                    }
                }
                let canCraft = hasItems.every((val) => val === true); // tests if hasItems index values are all true
                if (canCraft) return this.recipes[i]; // returns the crafting recipe
            }
            return false; // if loop exited and cannot recipe parts not found, return false   
        } else {
            // item is a primary, and cannot be crafted
            // console.log('You attempted to craft a primary uncraftable item');
            return false;
        }
    }
    test() {
        let canCraft = this.canCraft({
            wood: 10,
            stone: 10,
        });
        console.log(canCraft);
    }
}

function consumed(user, itemName) {
    user.inventory[itemName].amount -= 1;
    if (user.inventory[itemName].amount <= 0) {
        delete user.inventory[itemName];
    }
};

function swapTools(user, newToolTier) {
    const currentTools = user.toolTier.concat('Tools');
    const newTools = newToolTier.concat('Tools');
    if (!user.inventory[currentTools]) {
        user.inventory[currentTools] = {
            amount: 0,
            consumable: true,
        }
    }
    user.inventory[currentTools].amount += 1;
    user.inventory[currentTools].consumable = true; // should be uneccessary and redundant, but just in case...

    user.toolTier = newToolTier;
    if (user.inventory[newTools]) {
        user.inventory[newTools].amount --;
        if (user.inventory[newTools].amount <= 0) {
            delete user.inventory[newTools];
        }
    }
}

function swapArmor(user, newArmorTier) {
    const currentArmor = user.armorTier.concat('Armor');
    const newArmor = newArmorTier.concat('Armor');

    if (currentArmor !== 'basicArmor') {
        if (!user.inventory[currentArmor]) {
            user.inventory[currentArmor] = {
                amount: 0,
                consumable: true,
            }
        }

        user.inventory[currentArmor].amount += 1;
        user.inventory[currentArmor].consumable = true; // should be uneccessary
    }

    user.armorTier = newArmorTier;
    if (user.inventory[newArmor]) {
        user.inventory[newArmor].amount --;
        if (user.inventory[newArmor].amount <= 0) {
            delete user.inventory[newArmor];
        }
    }
}

// make the only parameter for Item a config

module.exports = {
    stone: new Item('stone', {primary: true}),
    wood: new Item('wood', {primary: true}),
    ironChunk: new Item('ironChunk', {primary: true}),
    rawMeat: new Item('rawMeat', {primary: true}),
    feather: new Item('feather', {primary: true}),
    fur: new Item('fur', {primary: true}),
    mandibles: new Item('mandibles', {primary: true}),
    rubies: new Item('rubies', {primary: true}),

    woodTools: new Item('woodTools', {
        primary: false,
        consumable: true,
        consumeFunction: (user) => {
            swapTools(user, 'wood');
        },
        craftingTime: 2500,
        recipes: [
            {
                wood: 5,
            }
        ],
    }),

    stoneTools: new Item('stoneTools', {
        primary: false,
        consumable: true,
        consumeFunction: (user) => {
            swapTools(user, 'stone');
        },
        craftingTime: 2500,
        recipes: [
            {
                stone: 5,
            }
        ],
        craftingStructure: 'workbench',
    }),

    ironTools: new Item('ironTools', {
        primary: false,
        consumable: true,
        consumeFunction: (user) => {
            swapTools(user, 'iron');
        },
        craftingTime: 3500,
        recipes: [
            {
                ironBars: 1,
            }
        ],
        craftingStructure: 'workbench',
    }),

    mandibleTools: new Item('mandibleTools', {
        primary: false,
        consumable: true,
        consumeFunction: (user) => {
            swapTools(user, 'mandible');
        },
        craftingTime: 3500,
        recipes: [
            {
                ironBars: 2,
                mandibles: 4,
            }
        ],
        craftingStructure: 'workbench',
    }),

    rubyTools: new Item('rubyTools', {
        primary: false,
        consumable: true,
        consumeFunction: (user) => {
            swapTools(user, 'ruby');
        },
        craftingTime: 3500,
        recipes: [
            {
                ironBars: 2,
                rubies: 80,
            }
        ],
        craftingStructure: 'workbench',
    }),

    /*
    basicArmor: new Item('basicArmor', {
        primary: false,
        consumable: true,
        consumeFunction: (user) => {
            swapArmor(user, 'basic');
        },
        craftingTime: 2000,
        recipes: [

        ]
    }),*/

    furArmor: new Item('furArmor', {
        primary: false,
        consumable: true,
        consumeFunction: (user) => {
            swapArmor(user, 'fur');
        },
        craftingTime: 3500,
        recipes: [
            {
                fur: 4
            }
        ]
    }),

    ironArmor: new Item('ironArmor', {
        primary: false,
        consumable: true,
        consumeFunction: (user) => {
            swapArmor(user, 'iron');
        },
        craftingTime: 3500,
        recipes: [
            {
                ironBars: 4
            }
        ]
    }),

    devArmor: new Item('devArmor', {
        primary: false,
        consumable: true,
        consumeFunction: (user) => {
            swapArmor(user, 'dev');
        },
        craftingTime: 1,
        recipes: []
    }),

    ironBars: new Item('ironBars', {
        primary: false,
        consumable: false,
        craftingTime: 2000,
        recipes: [
            {
                ironChunk: 5,
            }
        ],
        craftingStructure: 'furnace',
    }),

    cookedMeat: new Item('cookedMeat', {
        primary: false,
        consumable: true,
        craftingTime: 2000,
        consumeFunction: (user) => {
            if (user.hunger < 100) {
                consumed(user, 'cookedMeat');
                user.hunger += 25;
            }
        },
        recipes: [
            {
                rawMeat: 1,
            }
        ],
        craftingStructure: 'furnace',
    }),

    hourGlass: new Item('hourGlass', {
        primary: false,
        consumable: true,
        craftingTime: 10000,
        consumeFunction: (user, serverState) => {
            if (serverState.timeTick <= serverState.dayTimeLength/2) {
                serverState.timeTick = serverState.dayTimeLength/2-1;
            } else if (serverState.timeTick > serverState.dayTimeLength/2) {
                serverState.timeTick = -1;
            }
            consumed(user, 'hourGlass');
        },
        recipes: [/*create a recipe*/],
        craftingStructure: 'workbench',
    }),
    
    workbench: new Item('workbench', {
        primary: false,
        consumable: true,
        craftingTime: 2000,
        consumeFunction: (user) => {
            consumed(user, 'workbench');
            user.score += 5;
        },
        recipes: [
            {
                wood: 15,
                stone: 5,
            }
        ],
    }),

    furnace: new Item('furnace', {
        primary: false,
        consumable: true,
        craftingTime: 2000,
        consumeFunction: (user) => {
            consumed(user, 'furnace');
            user.score += 5;
        },
        recipes: [
            {
                wood: 5,
                stone: 15,
            }
        ],
    }),

    wall: new Item('wall', {
        primary: false,
        consumable: true,
        craftingTime: 2000,
        consumeFunction: (user) => {
            consumed(user, 'wall');
            user.score += 5;
        },
        recipes: [
            {
                wood: 5,
            }
        ],
        craftingStructure: 'workbench',
    }),
}