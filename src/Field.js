import React from 'react';
import './Field.css';
import Square from './Square';
import Piece from './Piece';
import Top from './Top';
import { ItemTypes } from './ItemTypes';

export default class Field extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      field: this.getStartField(),
      whitesTurn: true,
      whiteSwapped: false,
      blackSwapped: false,
      playersMove: true,
      offline: true,
      firstMove: true,
      socket: null,
      partnerID: null,
      showQuit: false,
    };

    this.onDrop = this.onDrop.bind(this);
    this.canDrop = this.canDrop.bind(this);
    this.setSocket = this.setSocket.bind(this);
    this.makeMove = this.makeMove.bind(this);
    this.quitGame = this.quitGame.bind(this);
  }

  setSocket(s) {
    this.setState({ socket: s })
    this.registerEndpoints()
  }

  getStartField() {
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
    return f;
  }

  startGame(data) {
    this.setState({
      field: data["field"] ? this.parseField(data["field"]) : this.getStartField(),
      offline: false,
      playersMove: data["moveNext"],
      whitesTurn: "whitesTurn" in data ? data["whitesTurn"] : true,
      firstMove: false,
      whiteSwapped: false,
      blackSwapped: false,
      partnerID: data["partnerID"],
      showQuit: true,
    })
    this.updateTextField()
  }

  quitGame(data = null, emit = true) {
    this.setState({
      field: this.getStartField(),
      whitesTurn: true,
      whiteSwapped: false,
      blackSwapped: false,
      playersMove: true,
      offline: true,
      firstMove: true,
      partnerID: "",
      showQuit: false,
    });
    if (emit) {
      this.state.socket.emit("quitGame")
    }
  }

  makeMove(data) {
    this.onDrop(data["from"], data["to"])
  }

  parseField(data) {
    var f = []
    for (var i = 0; i < 12; i++) {
      if (data[i]) {
        var type = null;
        switch (data[i][1]) {
          case "ROOK":
            type = ItemTypes.ROOK
            break;
          case "KING":
            type = ItemTypes.KING
            break;
          case "KNIGHT":
            type = ItemTypes.KNIGHT
            break;
          default:
        }
        f[i] = [data[i][0], type]
      } else {
        f[i] = null
      }
    }
    return f
  }

  registerEndpoints() {
    this.state.socket.on('startGame', data => this.startGame(data));
    this.state.socket.on('move', data => this.makeMove(data));
    this.state.socket.on('quitGame', data => this.quitGame(data, false));
  }

  async onDrop(source, target) {

    if (this.state.firstMove) {
      if (this.state.field[source][0]) {
        this.setState({ whitesTurn: false })
      }
      this.setState({ firstMove: false })
    }

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

    this.setState({ field: newField, whitesTurn: !this.state.whitesTurn, playersMove: !this.state.playersMove });

    this.updateTextField()

    if (this.state.playersMove) {
      return
    }

    if (this.state.offline) {
      var moves = this.getMoves()
      if (moves.length === 0) {
        return
      }
      var move = moves[Math.floor(Math.random() * moves.length)]
      await this.sleep(500)
      this.onDrop(move[0], move[1])
    } else {
      var m = {
        "from": source,
        "to": target
      }
      this.state.socket.emit("makeMove", m)
    }
  }

  updateTextField() {
    // check if move results in check for other player
    if (this.checkCheck()) {
      if (this.testCheckMate()) {
        this.props.setInfoText(!this.state.whitesTurn ? "White wins" : "Black wins");
      } else {
        this.props.setInfoText(this.state.whitesTurn ? "White in check" : "Black in check");
      }
    } else {
      this.props.setInfoText(this.state.whitesTurn ? "White's turn" : "Black's turn");
    }
  }

  // get possible moves for currently active player
  getMoves() {
    var field = this.state.field;
    var moves = []
    for (var i = 0; i < 12; i++) {
      if (field[i] && field[i][0] === this.state.whitesTurn) {
        continue
      } else {
        for (var j = 0; j < 12; j++) {
          if (this.canDrop(i, j)) {
            moves.push([i, j])
          }
        }
      }
    }
    return moves
  }

  async sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
  }

  testCheckMate() {
    var checkMate = true;
    var moves = this.getMoves()
    for (var i = 0; i < moves.length; i++) {
      var newField = this.getFieldAfterMove(this.state.field, moves[i][0], moves[i][1])
      if (!this.checkCheck(newField, !this.state.whitesTurn)) {
        checkMate = false;
        break;
      }
    }
    return checkMate;
  }

  canDrop(source, target) {
    var color = this.state.whitesTurn
    var field = this.state.field
    if (!field[source] || (!this.state.offline && !this.state.playersMove)) {
      return false;
    }
    if ((color === field[source][0] && !this.state.firstMove) || source === target) {
      return false;
    } else if (field[target] != null && field[target][1] === ItemTypes.KING) {
      return false;
    } else {

      if (this.checkCheck(this.getFieldAfterMove(field, source, target), color)) {
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

  getFieldAfterMove(field, source, target) {
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
    return field
  }

  /**
   * check if color is in check after move is carried out
   */
  checkCheck(field = this.state.field, color = this.state.whitesTurn) {
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
    return (
      <div id="wrapper">
        <Top setSocket={this.setSocket} partnerID={this.state.partnerID}
          quitGame={this.quitGame} showQuit={this.state.showQuit} />
        <div id="center">
          < div id="field" > {squares} </div>
        </div>
      </div>
    );
  }
}