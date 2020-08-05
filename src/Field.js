import React from 'react';
import './Field.css';
import Square from './Square';
import Piece from './Piece';
import { ItemTypes } from './ItemTypes';
import openSocket from 'socket.io-client';

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

    var socket = openSocket(process.env.REACT_APP_API_URL);
    socket.on('startGame', data => this.startGame(data));

    this.state = {
      field: f,
      whitesTurn: true,
      whiteSwapped: false,
      blackSwapped: false,
    };

    this.onDrop = this.onDrop.bind(this);
    this.canDrop = this.canDrop.bind(this);
  }

  startGame(data) {
    console.log(data)
  }

  onDrop(source, target) {
    const newField = [...this.state.field];
    newField[target] = this.state.field[source];
    var s = this.state.field[source][1];
    var t = this.state.field[target] ? this.state.field[target][1] : null;
    if (((s === ItemTypes.KING && t === ItemTypes.ROOK) || (t === ItemTypes.KING && s === ItemTypes.ROOK)) &&
      this.state.field[source][0] === this.state.field[target][0]) {
      if (this.state.whitesTurn) {
        this.setState({ whiteSwapped: true });
      } else {
        this.setState({ blackSwapped: true });
      }
      newField[source] = this.state.field[target];
    } else {
      newField[source] = null;
    }
    // check if move results in check for other player
    if (this.checkCheck(this.state.field, source, target, !this.state.whitesTurn)) {
      if (this.testCheckMate(newField)) {
        this.props.setInfoText(this.state.whitesTurn ? "White wins" : "Black wins");
      } else {
        this.props.setInfoText(!this.state.whitesTurn ? "White in check" : "Black in check");
      }
    } else {
      this.props.setInfoText(!this.state.whitesTurn ? "White's turn" : "Black's turn");
    }
    this.setState({ field: newField, whitesTurn: !this.state.whitesTurn });
  }

  testCheckMate(newField) {
    var checkMate = true;
    for (var i = 0; i < 12; i++) {
      if (newField[i] && newField[i][0] !== this.state.whitesTurn) {
        continue;
      } else {
        // find possible moves for other player
        for (var j = 0; j < 12; j++) {
          if (this.canDrop(i, j, !this.state.whitesTurn, newField)) {
            // check if possible move by other player cancels check
            if (!this.checkCheck(newField, i, j, !this.state.whitesTurn)) {
              checkMate = false;
              break;
            }
          }
        }
      }
      if (!checkMate) {
        break;
      }
    }
    return checkMate;
  }

  canDrop(source, target, color = this.state.whitesTurn, field = this.state.field) {
    if (!field[source]) {
      return false;
    }
    if (color === field[source][0] || source === target) {
      return false;
    } else if (field[target] != null && field[target][1] === ItemTypes.KING) {
      return false;
    } else {

      if (this.checkCheck(field, source, target, color)) {
        return false;
      }

      if (field[target] && field[source][0] === field[target][0]) {
        if ((color && this.state.whiteSwapped) || (!color && this.state.blackSwapped)) {
          return false;
        } else {
          var outerRook = null;
          for (var i = color ? 0 : 11; color ? i < 12 : i > 0; color ? i++ : i--) {
            if (field[i] && field[i][1] === ItemTypes.ROOK) {
              outerRook = i;
              break;
            }
          }
          var l = source === outerRook;
          if (l || target === outerRook) {
            if (field[l ? target : source][1] === ItemTypes.KING) {

              return true;
            }
          }
        }
        return false;
      }

      var lower = source <= target ? source : target;
      var upper = lower === source ? target : source;
      switch (field[source][1]) {
        case ItemTypes.ROOK:
          for (var j = lower + 1; j < upper; j++) {
            if (field[j]) {
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
          if ((upper - lower) !== 2) {
            return false;
          }
          break;
        default:
      }
      return true;
    }
  }

  /**
   * check if color is in check after move is carried out
   */
  checkCheck(field, source, target, color) {
    field = field.slice()
    var s = field[source];
    var t = field[target];
    field[target] = field[source];
    if (t && s[0] === t[0] &&
      ((s[1] === ItemTypes.KING && t[1] === ItemTypes.ROOK) ||
        (t[1] === ItemTypes.KING && s[1] === ItemTypes.ROOK))) {
      field[source] = t;
    } else {
      field[source] = null;
    }
    var king = null;
    for (var k = 0; k < 12; k++) {
      if (field[k] && field[k][0] === !color && field[k][1] === ItemTypes.KING) {
        king = k;
        break;
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
              if (i + j === king) {
                return true;
              } else {
                if (field[i + j] && j !== 0) {
                  break;
                }
              }
            }
            break;
          case ItemTypes.KNIGHT:
            if (i + 2 === king || i - 2 === king) {
              return true;
            }
            break;
          case ItemTypes.KING:
            if (i + 1 === king || i - 1 === king) {
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