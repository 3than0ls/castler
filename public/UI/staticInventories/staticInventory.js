


import React from 'react';

// react bootstrap components
import Image from 'react-bootstrap/Image';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'

import { player } from '../../app.js';
import { images } from '../controlUI/controlUI.js';
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