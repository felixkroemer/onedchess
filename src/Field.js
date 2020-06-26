import React from 'react';
import './Field.css';
import Square from './Square';
import Piece from './Piece';
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
    this.onDrop = this.onDrop.bind(this);
  }

  onDrop(source, target) {
    const newField = [...this.state.field];
    newField[target] = this.state.field[source];
    newField[source] = null;
    this.setState({ field: newField });
  }

  canDrop(source, target) {
    return true;
  }

  render() {
    var squares = [];
    for (var i = 0; i < 12; i++) {
      var piece = null;
      if (this.state.field[i] != null) {
        piece = <Piece id={i} type={this.state.field[i]} />;
      }
      squares.push(
        < Square id={i} onDrop={this.onDrop} canDrop={this.canDrop}>
          {piece}
        </ Square>
      );
    }
    return (< div id="field" > {squares} </div>);
  }
}