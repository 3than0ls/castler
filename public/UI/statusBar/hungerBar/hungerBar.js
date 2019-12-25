import React from 'react';

// react bootstrap components
import ProgressBar from 'react-bootstrap/ProgressBar'

// custom style sheet
import './hungerBar.css';
import './../styles.css';

import { player } from '../../../app';

export class HungerBar extends React.Component {
    constructor() {
        super();
        this.state = {
            nowHunger: player.hunger,
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
            nowHunger: player.hunger
        });
    }

    render() {
        return(
            <> 
                <div className="statusBarWrapper" id="hungerBar">
                    <ProgressBar variant={"round" + (this.state.nowHunger <= 20 ? 'DarkYellow' : 'Yellow')} className="statusBar" now={this.state.nowHunger}/>  
                </div>
            </>
        )
    }
}