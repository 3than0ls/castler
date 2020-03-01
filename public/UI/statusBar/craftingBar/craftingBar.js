import React from 'react';

// react bootstrap components
import ProgressBar from 'react-bootstrap/ProgressBar';
import Spinner from 'react-bootstrap/Spinner';

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
            craftingComplete: Math.round(player.craftingState.craftingComplete*100)
        });
    } // there is a delay between the now and displayed now, how to remove?

    render() {
        console.log(this.state.craftingComplete);
        return(
            <> 
                {this.state.crafting && 
                    <div id="craftingSpinnerContainer">
                        <Spinner variant="purple" animation="border"/>  
                        <div className='statusAmount'>{this.state.craftingComplete}%</div>
                    </div>
                }
            </>
        )
    }
}