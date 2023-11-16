// const { CANVAS_WIDTH, CANVAS_HEIGHT } = require("../../controllers/setting");

function CGame(playerId) {
  var _bUpdate = false;
  var _bSuitAssigned;
  var _iCurTurn; //Current Turn in game
  var _iWinStreak;
  var _aSuitePlayer;

  var _oScenario;
  var _oGameOverPanel;
  var _oPlayer1;
  var _oPlayer2;
  var _oScoreGUI;
  var _oInterface;
  var _oTable;
  var _oContainerGame;
  var _oContainerTable;
  var _oContainerInterface;
  var _iScore;

  var _oInteractiveHelp;

  var _oContainerInputController;
  // var _oInputController;
  var _oShotPowerBar;
  var _oContainerShotPowerBar;
  var _oCointainerShotPowerBarInput;
  var _bHoldStickCommand;
  var _iDirStickCommand;
  var _iDirStickSpeedCommand;
  var _messagebar;
  var _domElement;
  this._init = function () {
    _iCurTurn = 1;
    _iWinStreak = 0;
    _bSuitAssigned = false;
    _bHoldStickCommand = false;
    _iDirStickCommand = 1;
    _iDirStickSpeedCommand = COMMAND_STICK_START_SPEED;

    _iScore = 0;

    switch (s_iGameMode) {
      case GAME_MODE_NINE: {
        BALL_NUMBER = 9;
        break;
      }
      case GAME_MODE_EIGHT: {
        BALL_NUMBER = 15;
        break;
      }
      case GAME_MODE_TIME: {
        BALL_NUMBER = 15;
        break;
      }
    }

    RACK_POS = STARTING_RACK_POS[s_iGameMode];

    _oContainerGame = new createjs.Container();
    s_oStage.addChild(_oContainerGame);

    var oBg = createBitmap(s_oSpriteLibrary.getSprite("bg_game"));
    _oContainerGame.addChild(oBg);

    _oContainerTable = new createjs.Container();
    _oContainerGame.addChild(_oContainerTable);

    _oContainerInterface = new createjs.Container();
    s_oStage.addChild(_oContainerInterface);

    _oInterface = new CInterface(_oContainerInterface);
    _oScenario = new CScene();

    if (s_iPlayerMode == GAME_MODE_TWO) {
      _oTable = new CNTable(
        _oContainerTable,
        GAME_DIFFICULTY_PARAMS[s_iGameDifficulty],
        playerId
      );
    } else {
      _oTable = new CTable(
        _oContainerTable,
        GAME_DIFFICULTY_PARAMS[s_iGameDifficulty]
      );
    }
    _oTable.addEventListener(ON_LOST, this.gameOver, this);
    _oTable.addEventListener(ON_WON, this.showWinPanel, this);

    var iY = 40;

    _oScoreGUI = null;

    _oPlayer1 = new CPlayerGUI(CANVAS_WIDTH / 2 - 400, iY, "YOU", s_oStage, 0);
    _oPlayer2 = new CPlayerGUI(
      CANVAS_WIDTH / 2 + 400,
      iY,
      s_iPlayerMode == GAME_MODE_TWO ? "OTHERS" : "CPU",
      s_oStage,
      1
    );
    // if (s_iPlayerMode === GAME_MODE_CPU) {
    _oScoreGUI = new CScoreGUI(CANVAS_WIDTH / 2, iY, s_oStage);
    // }

    if (_iCurTurn === 1) {
      _oPlayer1.highlight();
      _oPlayer2.unlight();
    } else {
      _oPlayer2.highlight();
      _oPlayer1.unlight();
    }

    if (s_iGameMode === GAME_MODE_NINE) {
      this.setNextBallToHit(1);
    }

    _oContainerInputController = new createjs.Container();
    s_oStage.addChild(_oContainerInputController);

    _oContainerShotPowerBar = new createjs.Container();
    s_oStageUpper3D.addChild(_oContainerShotPowerBar);

    _oCointainerShotPowerBarInput = new createjs.Container();
    s_oStage.addChild(_oCointainerShotPowerBarInput);

    if (s_bMobile) {
      _oShotPowerBar = new CShotPowerBar(
        _oContainerShotPowerBar,
        123,
        260,
        _oCointainerShotPowerBarInput
      );

      //_oShotPowerBar.hide(0);
    }

    var oFade = new createjs.Shape();
    oFade.graphics
      .beginFill("black")
      .drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    s_oStageUpper3D.addChild(oFade);

    tweenVolume("soundtrack", SOUNDTRACK_VOLUME_IN_GAME, 1000);

    _oGameOverPanel = new CGameOverPanel(s_oStageUpper3D);
    _oGameOverPanel.addEventListener(ON_EXIT_GAME, this.onExit, this);
    _oGameOverPanel.addEventListener(ON_RESTART, this.restartGame, this);

    _oNetGameOverPanel = new CNetGameOverPanel(s_oStageUpper3D);
    _oNetGameOverPanel.addEventListener(ON_EXIT_GAME, this.onNetExit, this);

    _oInteractiveHelp = null;

    s_bInteractiveHelp = localStorage.getItem("8ball_game_helped")
      ? false
      : true;

    if (s_bInteractiveHelp) {
      _oInteractiveHelp = new CInteractiveHelp(s_oStageUpper3D);
      _oInteractiveHelp.addEventListener(
        ON_END_TUTORIAL,
        this._onEndTutorial,
        this
      );
      $("#canvas_upper_3d").css("pointer-events", "initial");
      s_bInteractiveHelp = false;
    } else {
      this._onEndTutorial();
    }

    createjs.Tween.get(oFade)
      .to({ alpha: 0 }, 1000, createjs.Ease.cubicIn)
      .call(function () {
        s_oStageUpper3D.removeChild(oFade);
        s_oGame._startInteractiveHelp();
      });
    createjs.Tween.get(_oScenario)
      .wait(s_iTimeElaps)
      .call(_oScenario.update, null, _oScenario);

    if (s_iPlayerMode !== GAME_MODE_CPU) {
      function scaler() {
        var scalW =
          s_oStage.canvas.offsetWidth / document.documentElement.clientWidth;
        var scalH =
          s_oStage.canvas.offsetHeight / document.documentElement.clientHeight;
        var _spanScal = scalW < 1 ? scalW : scalH < 1 ? scalH : 1;
        _domElement.scaleX = _spanScal;
        _domElement.scaleY = _spanScal;
      }
      window.addEventListener("resize", scaler);
      _messagebar = document.querySelector(".message-wrapper");
      $(_messagebar).show();
      _domElement = new createjs.DOMElement(_messagebar);
      s_oStage.addChild(_domElement);
      document.addEventListener("keydown", this.onKeyDown);
      scaler();

      socket.on("send-message", this.onMessage);
    }
    this.refreshButtonPos();
    sizeHandler();
  };

  this.onMessage = function (msg) {
    if (_oTable.getSelfPid() == msg.pid) {
      $("#message_contant").append(
        `<p class='messa_self'> > ${msg.content} </p>`
      );
    } else {
      $("#message_contant").append(
        `<p class='message_other'> ${msg.content} < </p>`
      );
    }

    // divElement.scrollTop = divElement.scrollHeight;
    $("#message_contant").scrollTop($("#message_contant")[0].scrollHeight);
  };

  this.onKeyDown = function (e) {
    if (e.keyCode == 13) {
      var msg = $("#input_message").val();
      if (msg.length > 0) {
        $("#input_message").val("");
        socket.emit("send-message", msg);
        // $(".message_contant").addChild(`<p class='messa_self'> >${msg}< </p>`);
      }
    }
    $("#input_message").focus();
  };
  this._startInteractiveHelp = function () {
    if (!_oInteractiveHelp) {
      return;
    }

    if (s_bMobile) {
      _oInteractiveHelp.startTutorial({
        tutorial: TUTORIAL_MOVE_STICK_MOBILE,
        info: {
          movement: false,
          on_show_tutorial: undefined,
        },
      });
      _oInteractiveHelp.startTutorial({
        tutorial: TUTORIAL_SHOT_MOBILE,
        info: {
          movement: false,
          on_show_tutorial: undefined,
          param: _oShotPowerBar,
        },
      });
      _oInteractiveHelp.startTutorial({
        tutorial: TUTORIAL_MOVE_STICK_BUTTONS,
        info: {
          movement: false,
          on_show_tutorial: undefined,
        },
      });
    } else {
      _oInteractiveHelp.startTutorial({
        tutorial: TUTORIAL_SHOT_DESKTOP,
        info: {
          movement: false,
          on_show_tutorial: undefined,
          param: _oShotPowerBar,
        },
      });
    }

    _oInteractiveHelp.startTutorial({
      tutorial: TUTORIAL_CUE_EFFECT,
      info: {
        movement: false,
        on_show_tutorial: undefined,
      },
    });

    _oInteractiveHelp.startTutorial({
      tutorial: TUTORIAL_RESPOT_CUE,
      info: {
        movement: false,
        on_show_tutorial: undefined,
      },
    });
  };

  this._onMouseDownPowerBar = function () {
    if (s_iPlayerMode !== GAME_MODE_CPU) {
      s_oTable._onMouseDownPowerBar();
    }
    s_oTable.startToShot();
  };

  this._onPressMovePowerBar = function (iOffset) {
    if (s_iPlayerMode !== GAME_MODE_CPU) {
      // s_oTable._onPressMoveHitArea();
    }
    s_oTable.holdShotStickMovement(iOffset);
  };

  this._onPressUpPowerBar = function () {
    if (s_iPlayerMode !== GAME_MODE_CPU) {
      s_oTable._onReleaseHitArea();
    }
    if (s_oTable.startStickAnimation()) {
      _oShotPowerBar.setInput(false);
    }
  };

  this.hideShotBar = function () {
    if (s_bMobile) {
      _oShotPowerBar.hide();
    }
  };

  this.showShotBar = function () {
    if (s_bMobile) {
      _oShotPowerBar.show();
    }
  };

  this._onEndTutorial = function () {
    $("#canvas_upper_3d").css("pointer-events", "none");
    _bUpdate = true;

    if (s_bMobile) {
      _oShotPowerBar.initEventListener();
      _oShotPowerBar.addEventListener(
        ON_MOUSE_DOWN_POWER_BAR,
        this._onMouseDownPowerBar,
        this
      );
      _oShotPowerBar.addEventListener(
        ON_PRESS_MOVE_POWER_BAR,
        this._onPressMovePowerBar,
        this
      );
      _oShotPowerBar.addEventListener(
        ON_PRESS_UP_POWER_BAR,
        this._onPressUpPowerBar,
        this
      );
      _oShotPowerBar.show();
    }

    if (_oInteractiveHelp) {
      _oInteractiveHelp.unload();
      _oInteractiveHelp = null;
      localStorage.setItem("8ball_game_helped", true);
    }
  };

  this._onPressDownStickCommand = function (iDir) {
    _iDirStickCommand = iDir;
    _bHoldStickCommand = true;
    _iDirStickSpeedCommand = COMMAND_STICK_START_SPEED;
  };

  this._onPressUpStickCommand = function () {
    _bHoldStickCommand = false;
  };

  this.unload = function (oCbCompleted = null, oCbScope) {
    _bUpdate = false;

    if (s_iPlayerMode !== GAME_MODE_CPU) {
      $(_messagebar).hide();
      document.removeEventListener("keydown", this.onKeyDown);
      socket.removeEventListener("send-message", this.onMessage);
    }

    var oFade = new createjs.Shape();
    oFade.graphics
      .beginFill("black")
      .drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    oFade.alpha = 0;
    s_oStageUpper3D.addChild(oFade);
    createjs.Tween.get(oFade)
      .to({ alpha: 1 }, 700, createjs.Ease.cubicIn)
      .call(function () {
        _oTable.unload();
        _oInterface.unload();
        _oScenario.unload();
        _oGameOverPanel.unload();
        _oNetGameOverPanel.unload();
        s_oStageUpper3D.removeAllChildren();
        s_oStage.removeAllChildren();
        if (oCbCompleted !== null) {
          oCbCompleted.call(oCbScope);
        }
      });
  };

  this.reset = function () {
    _iCurTurn = 1;
    _bSuitAssigned = false;
  };

  this.refreshButtonPos = function () {
    _oInterface.refreshButtonPos();
    _oPlayer1.refreshButtonPos();
    _oPlayer2.refreshButtonPos();

    _oCointainerShotPowerBarInput.x = _oContainerShotPowerBar.x =
      s_iOffsetX * 0.5;

    if (_oInteractiveHelp) {
      _oInteractiveHelp.refreshButtonsPos();
    }
    if (_oScoreGUI) {
      _oScoreGUI.refreshButtonPos();
    }
  };

  //set the lowest ball currently on the table in the player interface
  this.setNextBallToHit = function (iNextBall, curTurn) {
    if (curTurn) {
      if (_oTable.getSelfPid() == "player1") {
        if (curTurn === 1) {
          _oPlayer2.setBallVisible(false);
          _oPlayer1.setBall(iNextBall);
        } else {
          _oPlayer1.setBallVisible(false);
          _oPlayer2.setBall(iNextBall);
        }
      } else {
        if (curTurn === 1) {
          _oPlayer1.setBallVisible(false);
          _oPlayer2.setBall(iNextBall);
        } else {
          _oPlayer2.setBallVisible(false);
          _oPlayer1.setBall(iNextBall);
        }
      }
    } else {
      if (_iCurTurn === 1) {
        _oPlayer2.setBallVisible(false);
        _oPlayer1.setBall(iNextBall);
      } else {
        _oPlayer1.setBallVisible(false);
        _oPlayer2.setBall(iNextBall);
      }
    }
  };

  //change player turn
  this.changeTurn = function (bFault) {
    if (_iCurTurn === 1) {
      _iCurTurn = 2;

      if (!s_oTable.isCpuTurn()) {
        s_oGame.showShotBar();
      }

      _oPlayer2.highlight();
      _oPlayer1.unlight();
    } else {
      _iCurTurn = 1;
      _oPlayer1.highlight();
      _oPlayer2.unlight();
      s_oGame.showShotBar();
    }
    s_oInterface.resetSpin();

    if (bFault) {
      new CEffectText(TEXT_FAULT, s_oStageUpper3D);
    } else {
      new CEffectText(TEXT_CHANGE_TURN, s_oStageUpper3D);
    }
  };

  this.netChangeTurn = function (pid, bFault) {
    if (pid === 1) {
      _oPlayer2.highlight();
      _oPlayer1.unlight();
    } else {
      _oPlayer1.highlight();
      _oPlayer2.unlight();
    }

    if (bFault == 1) {
      new CEffectText(TEXT_FAULT, s_oStageUpper3D);
    } else {
      new CEffectText(TEXT_CHANGE_TURN, s_oStageUpper3D);
    }
  };

  this.assignSuits = function (iBallNumber) {
    _aSuitePlayer = new Array();
    if (iBallNumber < 8) {
      if (_iCurTurn === 1) {
        _aSuitePlayer[0] = "solid";
        _aSuitePlayer[1] = "stripes";
        this.setBallInInterface("solid");
      } else {
        _aSuitePlayer[0] = "stripes";
        _aSuitePlayer[1] = "solid";
        this.setBallInInterface("stripes");
      }
    } else {
      if (_iCurTurn === 1) {
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
    if (szSuites1 == "solid") {
      _oPlayer1.setBall(2);
      _oPlayer2.setBall(15);
    } else {
      _oPlayer1.setBall(15);
      _oPlayer2.setBall(2);
    }
  };

  this.setNetBallInInterface = function (szSuites1) {
    console.log(szSuites1, _oTable.getSelfPid());
    if (_oTable.getSelfPid() == "player1") {
      if (szSuites1 == "solid") {
        _oPlayer1.setBall(2);
        _oPlayer2.setBall(15);
      } else {
        _oPlayer1.setBall(15);
        _oPlayer2.setBall(2);
      }
    } else {
      if (szSuites1 == "solid") {
        _oPlayer1.setBall(15);
        _oPlayer2.setBall(2);
      } else {
        _oPlayer1.setBall(2);
        _oPlayer2.setBall(15);
      }
    }
  };

  this.isLegalShotFor8Ball = function (iBall, iNumBallToPot) {
    if (_bSuitAssigned) {
      if (_aSuitePlayer[_iCurTurn - 1] == "solid" && iBall < 8) {
        return true;
      } else {
        if (_aSuitePlayer[_iCurTurn - 1] == "stripes" && iBall > 8) {
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

  this.increaseWinStreak = function () {
    _iWinStreak++;
    //oWinStreak.text = "Win Streak: "+CAppBiliardo.m_iWinStreak;
  };

  this.resetWinStreak = function () {
    _iWinStreak = 0;
    //oWinStreak.text = "Win Streak: "+_iWinStreak;
  };

  this.gameOver = function (szText) {
    _oGameOverPanel.show(szText);
    $("#canvas_upper_3d").css("pointer-events", "initial");
    _bUpdate = false;
  };

  this._netgameOver = function (szText) {
    _oNetGameOverPanel.show(szText);
    $("#canvas_upper_3d").css("pointer-events", "initial");
    _bUpdate = false;
  };

  this._netshowWinPanel = function (szText) {
    var iScore = s_iGameMode === GAME_MODE_CPU ? _iScore : undefined;
    _oNetGameOverPanel.show(szText, iScore);
    $("#canvas_upper_3d").css("pointer-events", "initial");
    _bUpdate = false;
  };

  this.showWinPanel = function (szText) {
    var iScore = s_iGameMode === GAME_MODE_CPU ? _iScore : undefined;
    _oGameOverPanel.show(szText, iScore);
    $("#canvas_upper_3d").css("pointer-events", "initial");
    _bUpdate = false;
  };

  this.onExit = function () {
    _oScenario.update();
    tweenVolume("soundtrack", SOUNDTRACK_VOLUME_DEFAULT, 1000);
    this.unload(s_oMain.gotoMenu, s_oMain);
    $(s_oMain).trigger("show_interlevel_ad");
    $(s_oMain).trigger("end_session");
  };

  this.onNetExit = function () {
    _oScenario.update();
    tweenVolume("soundtrack", SOUNDTRACK_VOLUME_DEFAULT, 1000);
    this.unload(s_oMain.gotoMenu, s_oMain);
    $(s_oMain).trigger("show_interlevel_ad");
    $(s_oMain).trigger("end_session");
  };
  this.restartGame = function () {
    _oScenario.update();
    this.unload(s_oMain.gotoGame, s_oMain);

    $(s_oMain).trigger("show_interlevel_ad");
    $(s_oMain).trigger("end_session");
  };

  this.updateScore = function (iVal) {
    if (!_oScoreGUI) {
      return;
    }

    var iNewScore = _iScore + iVal;

    _iScore = iNewScore < 0 ? 0 : iNewScore;

    _oScoreGUI.refreshScore(_iScore);
    _oScoreGUI.highlight();
  };

  this.getCurTurn = function () {
    return _iCurTurn;
  };

  this.getNextTurn = function () {
    return _iCurTurn === 1 ? 2 : 1;
  };

  this.getSuiteForCurPlayer = function () {
    return _aSuitePlayer[_iCurTurn - 1];
  };

  this.isSuiteAssigned = function () {
    return _bSuitAssigned;
  };

  this.getPlayer1Name = function () {
    return _oPlayer1.getPlayerName();
  };

  this.getPlayer2Name = function () {
    return _oPlayer2.getPlayerName();
  };

  this._updateInput = function () {
    if (!_bHoldStickCommand) {
      return;
    }

    _oTable.rotateStick(_iDirStickCommand * _iDirStickSpeedCommand);
    _iDirStickSpeedCommand += COMMAND_STICK_SPEED_INCREMENT;

    if (_iDirStickSpeedCommand >= COMMAND_STICK_MAX_SPEED) {
      _iDirStickSpeedCommand = COMMAND_STICK_MAX_SPEED;
    }
  };

  this.update = function () {
    if (_bUpdate === false) {
      return;
    }

    this._updateInput();

    _oTable.update();
    _oScenario.update();
  };

  s_oGame = this;

  this._init();
}

var s_oGame = null;
