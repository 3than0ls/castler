import React from 'react';
import ReactDOM from 'react-dom';

// react bootstrap components
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

// custom style sheets
import './../styles.css';
import './leaderboard.css';

import { clientState } from '../../app';

// move nickname here

export class Leaderboard extends React.Component {
    constructor() {
        super();
        this.state = {
            leaderboard: clientState.leaderboardState,
            nickname: window.localStorage.getItem('nickname'),
        }
    }
    componentDidMount() {
        // tick and update leaderboard every second
        this.timerID = setInterval(() => this.tick(), 1000);
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    tick() { 
        this.setState({
            leaderboard: clientState.leaderboardState,
        });
    }

    render() {
        // leaderboard: [{nickname:'nickname',clientID:'clientID',score:score},...]
        const leaderboardComponents = [];
        for (let i = 0; i < this.state.leaderboard.length; i++) {
            leaderboardComponents.push(
                <div key={this.state.leaderboard[i].clientID}>
                    <Row className='items' variant="primary">{i+1}) {this.state.leaderboard[i].nickname}: {this.state.leaderboard[i].score}</Row>
                </div>
            )
        }
        
        return ( // return react fragment
            <> 
                {leaderboardComponents.length !== 0 && 
                    <Col id='leaderboardContainer' className='overlayContainer'>
                        Leaderboard:
                        {leaderboardComponents}
                    </Col>
                }
                <div id="name" className='overlayContainer'>{this.state.nickname}</div>
            </>
        )
    }
}