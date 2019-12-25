import React from 'react';

// react bootstrap components
import ProgressBar from 'react-bootstrap/ProgressBar'

// custom style sheet
import './healthBar.css';
import './../../styles.css';

import { player } from '../../../app';

export class HealthBar extends React.Component {
    constructor() {
        super();
        this.state = {
            nowHealth: player.health,
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
            nowHealth: player.health
        });
    }

    render() {
        return( // return react fragment
            <> 
                <div className="statusBarWrapper" id="healthBar">
                    <ProgressBar variant={"round" + (this.state.nowHealth <= 20 ? 'DarkRed' : 'Red')} className="statusBar" now={this.state.nowHealth}/>  
                </div>
            </>
        )
    }
}