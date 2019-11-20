import React from 'react';
import ReactDOM from 'react-dom';

export class Inventory extends React.Component {
    render() {
        return(
            <div>
                Hello World!
            </div>
        )
    }
}

ReactDOM.render(<Inventory />, document.getElementById('root')); // have not yet created this element