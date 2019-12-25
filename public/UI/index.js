import React from 'react';

import { Inventory } from "./inventory/inventory.js";
import { HealthBar } from './statusBar/healthBar/healthBar.js';
import { Leaderboard } from './leaderboard/leaderboard.js';
import { HungerBar } from './statusBar/hungerBar/hungerBar.js';


export function App() {
    return (
        <>
            <div id="interface">
                <Inventory />
                <HealthBar />
                <HungerBar />
                <Leaderboard />
            </div>
        </>
    )
}
