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
    f[2] = [false, ItemTypes.KING];
    f[3] = [false, ItemTypes.KNIGHT];
    f[4] = [false, ItemTypes.ROOK];
    f[5] = null;
    f[6] = null;
    f[7] = [true, ItemTypes.ROOK];
    f[8] = [true, ItemTypes.KNIGHT];
    f[9] = [true, ItemTypes.KING];
    f[10] = [true, ItemTypes.KNIGHT];
    f[11] = [true, ItemTypes.ROOK];
    this.state = {
      field: f,
      whitesTurn: true
    };
    this.onDrop = this.onDrop.bind(this);
    this.canDrop = this.canDrop.bind(this);
  }

  onDrop(source, target) {
    const newField = [...this.state.field];
    newField[target] = this.state.field[source];
    newField[source] = null;
    if (this.checkCheck(this.state.field.slice(), source, target, !this.state.whitesTurn)) {
      //TODO
    }
    this.setState({ field: newField, whitesTurn: !this.state.whitesTurn });
  }

  canDrop(source, target) {
    var field = this.state.field;
    if (this.state.whitesTurn === field[source][0]) {
      return false;
    } else if (source === target || (field[target] && field[source][0] === field[target][0])) {
      return false;
    } else if (field[target] != null && field[target][1] == ItemTypes.KING) {
      return false;
    } else {
      var lower = source <= target ? source : target;
      var upper = lower === source ? target : source;
      switch (field[source][1]) {
        case ItemTypes.ROOK:
          for (var i = lower + 1; i < upper; i++) {
            if (field[i]) {
              return false;
            }
          }
          break;
        case ItemTypes.KING:
          if ((upper - lower) > 1) {
            return false;
          }
          break;
        case ItemTypes.KNIGHT:
          if ((upper - lower) != 2) {
            return false;
          }
          break;
      }

      if (this.checkCheck(field.slice(), source, target, this.state.whitesTurn)) {
        return false;
      }

      return true;
    }
  }

  /**
   * check if color is in check after move is carried out
   */
  checkCheck(field, source, target, color) {
    field[target] = field[source];
    field[source] = null;
    var king = null;
    for (var i = 0; i < 12; i++) {
      if (field[i] && field[i][0] === !color && field[i][1] === ItemTypes.KING) {
        king = i;
      }
    }
    for (var i = 0; i < 12; i++) {
      if (!field[i]) {
        continue;
      } else if (field[i][0] !== color) {
        continue;
      } else {
        switch (field[i][1]) {
          case ItemTypes.ROOK:
            for (var j = 0; j <= Math.abs(i - king); king >= i ? j++ : j--) {
              if (i + j == king) {
                return true;
              } else {
                if (field[i + j] && j != 0) {
                  break;
                }
              }
            }
            break;
          case ItemTypes.KNIGHT:
            if (i + 2 == king || i - 2 == king) {
              return true;
            }
            break;
          default:
        }
      }
    }
    return false;
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