import React from 'react';
import ReactDOM from 'react-dom';

// react bootstrap components
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';

// custom style sheets
import './controlUI.css';
import './../styles.css';


import { Inventory } from './inventory';
import { CraftingUI } from './crafting';
import { Consumable } from './consumable';

// images
function importAll (r) {
    let images = {};
    r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
    return images;
}

const itemImages = importAll(require.context('./../../assets/items', false,  /\.png$/));
const structureImages = importAll(require.context('./../../assets/structures', false,  /\.png$/));
const playerImages = importAll(require.context('./../../assets/player', false,  /\.png$/));
export const images = {...itemImages, ...structureImages, ...playerImages}; 


export class ControlUI extends React.Component {
    constructor() {
        super();
        this.state = {
            uiView: 'inventory',
            open: true,
        }
        this.openControlUI = this.openControlUI.bind(this);

        this.inventoryClick = this.inventoryClick.bind(this);
        this.craftingClick = this.craftingClick.bind(this);
        this.consumableClick = this.consumableClick.bind(this);
    }

    openControlUI() {
        this.setState({
            open: !this.state.open,
        });
    }

    inventoryClick() {
        this.setState({
            uiView: 'inventory',
        });
    }

    craftingClick() {
        this.setState({
            uiView: 'crafting',
        });
    }

    consumableClick() {
        this.setState({
            uiView: 'consumable',
        })
    }

    render() { // perhaps replace with react bootstrap tabbed components
        let visibleComponent;
        switch (this.state.uiView) {
            case 'inventory': 
                visibleComponent = <div id='inventoryContainer'><Inventory /></div>;
                break;
            case 'consumable':
                visibleComponent = <div id='inventoryContainer'><Consumable /></div>;
                break;
            case 'crafting': 
                visibleComponent = <div id='craftingContainer'><CraftingUI /></div>;
                break;
        }
        return(
            <> 
                <div id="controlUIWrapper">
                    <Button
                        variant='openControlUI'
                        onClick={this.openControlUI}>
                            {`${this.state.open ? 'Collapse' : 'Expand'} Inventory`}
                    </Button>
                    <div id="collapseWrapper">
                    <Collapse 
                        dimension='width' 
                        in={this.state.open} 
                        className="collapseContentWrapper"
                    >
                        <div className="noMarginPadding">   
                            <div className="collapseContent">
                                <Row>
                                    <Button variant='uiItem' key={'inventory'} active={this.state.uiView==='inventory'} onClick={this.inventoryClick}>
                                        Inv
                                    </Button>
                                    <Button variant='uiItem' key={'consumable'} active={this.state.uiView==='consumable'} onClick={this.consumableClick}>
                                        Con
                                    </Button>
                                    <Button variant='uiItem' key={'crafting'} active={this.state.uiView==='crafting'} onClick={this.craftingClick}>
                                        Cra
                                    </Button>
                                </Row>
                                {visibleComponent}
                            </div>
                        </div>
                    </Collapse>
                    </div>
                </div>
            </>
        )
    }
}
/*
                    <div id="controlUIContainer">
                        <Row>
                            <Button variant='uiItem' key={'inventory'} active={this.state.uiView==='inventory'} onClick={this.inventoryClick}>
                                Inv
                            </Button>
                            <Button variant='uiItem' key={'consumable'} active={this.state.uiView==='consumable'} onClick={this.consumableClick}>
                                Con
                            </Button>
                            <Button variant='uiItem' key={'crafting'} active={this.state.uiView==='crafting'} onClick={this.craftingClick}>
                                Cra
                            </Button>
                        </Row>
                        {visibleComponent}
                    </div>*/

                    //  id="controlUIContainer"