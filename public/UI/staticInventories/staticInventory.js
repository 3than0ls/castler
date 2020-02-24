


import React from 'react';

// react bootstrap components

import { player } from '../../app.js';
import { CrateInventory } from './crateInventory.js';

export class StaticInventory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            player: player,
        }
    }
    componentDidMount() {
        this.timerID = setInterval(() => this.tick(), 60); // learn more about this
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    tick() { 
        this.setState({
            player: player,
        });
    }

    render() {
        return(
            <> 
                {player.openCrate && 
                    <CrateInventory item={player.targetCrate.contents} />
                }
            </>
        )
    }
}