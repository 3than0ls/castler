import React from 'react';

// how in the actual hell does react bootstrap work? find out

// react bootstrap components
import ProgressBar from 'react-bootstrap/ProgressBar'

// custom style sheet
import './healthbar.css';
import './../styles.css';

import { player } from '../../app';

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
                <div className="healthbarWrapper">
                    <ProgressBar variant={"round" + (this.state.nowHealth <= 20 ? 'DarkRed' : 'Red')} className="healthbar" now={this.state.nowHealth}/>  
                </div>
            </>
        )
    }
}