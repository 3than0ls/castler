import React from 'react';

// react bootstrap components
import ProgressBar from 'react-bootstrap/ProgressBar'

// custom style sheet
import './craftingBar.css';
import './../styles.css';

import { player } from '../../../app';

export class CraftingBar extends React.Component { // used to monitor progress of crafting an item
    constructor() {
        super();
        this.state = {
            crafting: player.craftingState.crafting,
            craftingComplete: Math.round(player.craftingState.craftingComplete * 100)
        }
    }

    componentDidMount() {
        this.timerID = setInterval(() => this.tick(), 60);
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    tick() { 
        this.setState({
            crafting: player.craftingState.crafting,
            craftingComplete: Math.round(player.craftingState.craftingComplete * 125)
        });
    } // there is a delay between the now and displayed now, how to remove?

    render() {
        return(
            <> 
                {this.state.crafting && 
                    <div className="statusBarWrapper" id="craftingBar">
                        <ProgressBar variant={"roundPurple"} className="statusBar" now={this.state.craftingComplete}/>  
                    </div>
                }
            </>
        )
    }
}