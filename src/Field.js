import React from 'react';
import './Field.css';
import Square from './Square';
import { ItemTypes } from './ItemTypes';

export default class Field extends React.Component {
  constructor(props) {
    super(props);
    var f = [];
    f[0] = [false, ItemTypes.ROOK];
    f[1] = [false, ItemTypes.KNIGHT];
    f[2] = [false, ItemTypes.QUEEN];
    f[3] = [false, ItemTypes.KNIGHT];
    f[4] = [false, ItemTypes.ROOK];
    f[5] = null;
    f[6] = null;
    f[7] = [true, ItemTypes.ROOK];
    f[8] = [true, ItemTypes.KNIGHT];
    f[9] = [true, ItemTypes.QUEEN];
    f[10] = [true, ItemTypes.KNIGHT];
    f[11] = [true, ItemTypes.ROOK];
    this.state = {
      field: f
    };
  }

  render() {
    var squares = [];
    for (var i = 0; i < 12; i++) {
      squares.push(< Square id={i} type={this.state.field[i]} />);
    }
    return (< div id="field" > {squares} </div>);
  }
}