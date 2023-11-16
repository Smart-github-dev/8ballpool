const { Table } = require("./Table");
const {
  FPS,
  GAME_STATUS_IDLE,
  GAME_STATUS_READY,
  GAME_STATUS_START,
  STATE_TABLE_MOVE_STICK,
  ON_WON,
} = require("./setting");

module.exports = function (io, roomid, data) {
  var _table;
  var _status;
  var _players = new Map();
  var _currentPlayer;
  var _roomid;
  var _bet_amount = 0;
  var _isPrivate = false;
  var _bSuitAssigned;
  var _aSuitePlayer;
  this.init = function (roomid, data) {
    _bUpdate = true;
    _bSuitAssigned = false;
    _roomid = roomid;
    _table = new Table(io, this);

    // _table.addEventListener(ON_WON, this.matchResult, this);

    setInterval(this.update, 1000 / FPS);
    _status = GAME_STATUS_IDLE;
    _bet_amount = data.amount;
    _isPrivate = data.isPrivate;
    this.setFirstPlayer();
  };

  this.matchResult = function (winPid) {
    _status = GAME_STATUS_IDLE;
    io.to(roomid).emit("matchResult", winPid);
    _bUpdate = false;
  };

  this.getRoomPermission = function () {
    return _isPrivate;
  };

  this.getBetAmount = function () {
    return _bet_amount;
  };

  this.update = function () {
    if (_bUpdate === false) {
      return;
    }

    switch (_status) {
      case GAME_STATUS_IDLE:
        {
        }
        break;
      case GAME_STATUS_READY:
        {
        }
        break;
      case GAME_STATUS_START:
        {
          _table.update();
        }
        break;
    }
  };

  this.getRoomId = function () {
    return _roomid;
  };

  this.setFirstPlayer = function (id) {
    _currentPlayer = "player1";
  };

  this.getCurrentPlayer = function () {
    return _currentPlayer;
  };

  this.jointrue = function (socket, pid) {
    socket.emit("joinroom-res", {
      msg: "joining success",
      success: true,
      pid,
    });
    this.onSocket(socket);
    socket.join(_roomid);
    socket.roomid = _roomid;
    socket.playerId = pid;
    console.log("join room :" + _roomid);
    if (!_isPrivate && pid == "player2") {
      io.emit("new-join", {
        roomid: _roomid,
        posid: pid,
        pid: socket.id,
      });
    }
  };

  this.getOtherplayerId = function (playerId) {
    return _players.get(playerId === "player1" ? "player2" : "player1")
      .socketid;
  };

  this.changeTurn = function (bFault) {
    console.log("change" + bFault);
    _currentPlayer = _currentPlayer === "player1" ? "player2" : "player1";
    io.to(roomid).emit("changeTurn", bFault);
  };

  this.getCurTurn = function () {
    return _currentPlayer === "player1" ? 1 : 2;
  };

  this.getNextTurn = function () {
    return _currentPlayer === "player1" ? 2 : 1;
  };

  this.assignSuits = function (iBallNumber) {
    _aSuitePlayer = new Array();
    if (iBallNumber < 8) {
      if (_currentPlayer === "player1") {
        _aSuitePlayer[0] = "solid";
        _aSuitePlayer[1] = "stripes";
        this.setBallInInterface("solid");
      } else {
        _aSuitePlayer[0] = "stripes";
        _aSuitePlayer[1] = "solid";
        this.setBallInInterface("stripes");
      }
    } else {
      if (_currentPlayer === "player1") {
        _aSuitePlayer[0] = "stripes";
        _aSuitePlayer[1] = "solid";
        this.setBallInInterface("stripes");
      } else {
        _aSuitePlayer[0] = "solid";
        _aSuitePlayer[1] = "stripes";
        this.setBallInInterface("solid");
      }
    }
    _bSuitAssigned = true;
  };

  this.setBallInInterface = function (szSuites1) {
    io.to(roomid).emit("setBallInInterface", szSuites1);
  };

  this.isLegalShotFor8Ball = function (iBall, iNumBallToPot) {
    if (_bSuitAssigned) {
      if (_aSuitePlayer[this.getCurTurn() - 1] == "solid" && iBall < 8) {
        return true;
      } else {
        if (_aSuitePlayer[this.getCurTurn() - 1] == "stripes" && iBall > 8) {
          return true;
        } else if (iBall == 8 && iNumBallToPot == 0) {
          return true;
        } else {
          return false;
        }
      }
    } else {
      if (iBall != 8) {
        return true;
      } else {
        return false;
      }
    }
  };

  this.setNextBallToHit = function (iNextBall) {
    io.to(roomid).emit("setNextBallToHit", iNextBall, this.getCurTurn());
  };

  this.onSocket = function (socket) {
    socket.on("_onPressHitArea", (e) => {
      if (socket.playerId !== _currentPlayer) return;
      e.socket = true;
      this.send("_onPressHitArea", e);
    });

    socket.on("_onPressMoveHitArea", (e) => {
      if (socket.playerId !== _currentPlayer) return;
      this.send("_onPressMoveHitArea", e);
    });

    socket.on("_onReleaseHitArea", (e) => {
      if (socket.playerId !== _currentPlayer) return;
      this.send("_onReleaseHitArea", e);
    });

    socket.on("_onPressDownCueBall", (e) => {
      if (socket.playerId !== _currentPlayer) return;
      _table._onPressDownCueBall(e);
      this.send("_onPressDownCueBall", e);
    });

    socket.on("_onPressMoveCueBall", (e) => {
      if (socket.playerId !== _currentPlayer) return;
      _table._onPressMoveCueBall(e);
      this.send("_onPressMoveCueBall", e);
    });

    socket.on("_onPressUpCueBall", (e) => {
      if (socket.playerId !== _currentPlayer) return;
      _table._onPressUpCueBall(e);
      this.send("_onPressUpCueBall", e);
    });

    socket.on("player-shot", (e) => {
      if (socket.playerId !== _currentPlayer) return;
      _table.shotBall(e);
    });

    socket.on("updateStick", (e) => {
      if (socket.playerId !== _currentPlayer) return;
      this.send("updateStick", e);
    });

    socket.on("getStates", () => {
      this.sendState(socket);
    });

    socket.on("send-message", function (msg) {
      io.to(_roomid).emit("send-message", {
        pid: socket.playerId,
        content: msg,
      });
    });
  };

  this.sendState = function (socket) {
    socket.emit("iState", _table.getState(), _currentPlayer, socket.playerId);
  };

  this.send = function (key, e, socket) {
    if (_status == GAME_STATUS_IDLE) return;
    io.to(_roomid).emit(key, e);
  };

  this.joinroom = function (socket) {
    if (_status == GAME_STATUS_IDLE) {
      var keyExists = _players.has("player1");
      if (keyExists) {
        keyExists = _players.has("player2");
        if (keyExists) {
          socket.emit("joinroom-res", {
            msg: "already full join",
            success: false,
          });
        } else {
          _players.set("player2", {
            chooseball: 0,
            SCORE: 0,
            socketid: socket.id,
          });
          this.setStatus(GAME_STATUS_READY);
          this.jointrue(socket, "player2");
        }
      } else {
        _players.set("player1", {
          chooseball: 0,
          SCORE: 0,
          socketid: socket.id,
        });
        this.jointrue(socket, "player1");
        keyExists = _players.has("player2");
        if (keyExists) {
          this.setStatus(GAME_STATUS_READY);
        }
      }
    }
  };

  this.setStatus = function (status) {
    if (status === GAME_STATUS_READY) {
      var number = Math.floor(Math.random() * (1 - 0 + 1)) + 0;
      console.log(number);
      _currentPlayer = number == 0 ? "player1" : "player2";
      setTimeout(() => {
        io.to(roomid).emit("_coinToss", _currentPlayer);
        setTimeout(() => {
          _status = GAME_STATUS_START;
        }, 1000);
      }, 1500);
    }
    _status = status;
  };

  this.leaveroom = function (socket, roomid) {
    const currentRoomId = roomid || Object.keys(socket.rooms)[1];
    const roomExists = io.sockets.adapter.rooms.has(currentRoomId);
    if (roomExists) {
      var keyExists = _players.has(socket.playerId);
      if (keyExists) {
        socket.leave(currentRoomId);
        _players.delete(socket.playerId);
        socket.emit("leaveroom-res", { msg: "success", success: true });
        console.log("leave room : true");
        if (GAME_STATUS_START == _status) {
          if (socket.playerId == "player1") {
            keyExists = _players.has("player2");
            if (keyExists) {
              this.matchResult("player2");
            }
          } else {
            keyExists = _players.has("player1");
            if (keyExists) {
              this.matchResult("player1");
            }
          }
        }
        this.removeSocket(socket);
      }
    } else {
      socket.leave(currentRoomId);
      _players.delete(socket.playerId);
      if (GAME_STATUS_START == _status) {
        if (socket.playerId == "player1") {
          var keyExists = _players.has("player2");
          if (keyExists) {
            this.matchResult("player2");
          }
        } else {
          var keyExists = _players.has("player1");
          if (keyExists) {
            this.matchResult("player1");
          }
        }
      }
      socket.emit("leaveroom-res", { msg: "not existed", success: false });
      console.log("leave room : false");
    }
  };

  this.getPlayerCount = function () {
    return _players.size;
  };

  this.getPlayers = function () {
    return Array.from(_players).map((player) => {
      return { key: player[0], playerid: player[1].socketid };
    });
  };

  this.removeSocket = function (socket) {
    // socket.removeEventListener("_onPressHitArea", (e) => {
    //   e.socket = true;
    //   this.send("_onPressHitArea", e, socket);
    // });
    // socket.removeEventListener("_onPressMoveHitArea", (e) => {
    //   this.send("_onPressMoveHitArea", e, socket);
    // });
    // socket.removeEventListener("_onReleaseHitArea", (e) => {
    //   this.send("_onReleaseHitArea", e, socket);
    // });
    // socket.removeEventListener("player-shot", (e) => {
    //   _table.playerShot(e);
    // });
    // socket.removeEventListener("updateStick", (e) => {
    //   this.send("updateStick", e, socket);
    // });
    // socket.removeEventListener("getStates", () => {
    //   this.sendState(socket);
    // });
  };
  this.reset = function () {};
  this.unload = function () {};

  this.init(roomid, data);
};
