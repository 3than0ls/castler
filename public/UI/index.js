import React from 'react';

import { HealthBar } from './statusBar/healthBar/healthBar.js';
import { Leaderboard } from './leaderboard/leaderboard.js';
import { HungerBar } from './statusBar/hungerBar/hungerBar.js';
import { ControlUI } from './controlUI/controlUI.js';
import { CraftingBar } from './statusBar/craftingBar/craftingBar.js';
import { CrateInventory } from './staticInventories/crateInventory.js';
import { StaticInventory } from './staticInventories/staticInventory.js';
import { player } from '../app.js';
import { renderDeathMenu } from './death/menu.js';



function importAll (r) {
    let images = {};
    r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
    return images;
}
const images = importAll(require.context('./../assets/items', false,  /\.png$/));

// move crafting UI and inventory to control UI

export function App() {
    return (
        <>
            <div id="interface">
                <ControlUI />
                <HealthBar />
                <HungerBar />
                <CraftingBar />
                <Leaderboard />
                <StaticInventory />
            </div>
        </>
    )
}
