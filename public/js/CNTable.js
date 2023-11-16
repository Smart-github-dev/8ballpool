function CNTable(oParentContainer, oCpuDifficultyParams, playerId) {
  var _bHoldStick;
  var _bReadyForShot;
  var _bBreakShot;
  var _bForceStopStick;
  var _bFirstShot;
  var _bCueBallInHole;
  var _iState;
  var _iPowerShot;
  var _iLowestBall;
  var _iShotPoints;
  var _iComboShots;
  var _aBallsToPotPlayers; //Num of balls to pot for each player in 8ball
  var _aCueBallCollision;
  var _aCbCompleted;
  var _aCbOwner;
  var _iCntBallsIntoHoles;
  var _iTimeAnimStick;
  var _iMaxTimeAnimationStick;
  var _iDistFromBlankBall;
  var _aBalls;
  var _aBallsInHoles;
  var _aBallsInHoleInCurShot;
  var _aFieldEdges;
  var _vStickDirection;
  var _vMousePosAtHoldStick;
  var _vInvStickDirection;
  var _vStickInitDir;
  var _oListenerPress;
  var _oListenerMove;
  var _oListenerRelease;
  var _oPhysicsController;
  var _iDimStack;

  var _oDollyDir;
  var _oCueBallDir;
  var _oHittenBallDir;
  var _oCircleShape;
  var _oHitAreaShot;
  var _oStick;
  var _oCueBall;
  var _oBallContainer;
  var _oContainer;
  var _oContainerUpperBumper;
  var _oContainerDownBumper;
  var _oContainerUpperTable;
  var _oParentContainer = oParentContainer;

  var _oHandCueBallDrag;
  var _fPrevStickAngle;
  var _iPrevState;
  var _iColorCuePrevTrajectory;

  var _iCpuShotTurn;
  var _oCpuDifficultyParams;

  var _aSoundsInstance;
  var _balls = [];

  var _currentPlayer = 0;

  var _playerId;
  var _otherPlayerPos = {
    x: 0,
    y: 0,
  };

  var _ready = false;

  this._init = function (oCpuDifficultyParams) {
    _aCbCompleted = new Array();
    _aCbOwner = new Array();
    _aSoundsInstance = new Array();
    _iDimStack = 0;
    _oCpuDifficultyParams = oCpuDifficultyParams;
    this.reset();

    var oSpriteBg = s_oSpriteLibrary.getSprite("pool_table");
    TABLE_CENTER = {
      x: CANVAS_WIDTH / 2 - oSpriteBg.width / 4,
      y: CANVAS_HEIGHT / 2 - oSpriteBg.height / 4,
    };

    _oContainerUpperTable = new createjs.Container();
    s_oStageUpper3D.addChild(_oContainerUpperTable);

    _oContainer = new createjs.Container();
    _oContainerUpperTable.x = _oContainer.x =
      CANVAS_WIDTH / 2 - oSpriteBg.width / 2;
    _oContainerUpperTable.y = _oContainer.y =
      CANVAS_HEIGHT / 2 - oSpriteBg.height / 2;
    _oParentContainer.addChild(_oContainer);

    var oBg = createBitmap(oSpriteBg);
    _oContainer.addChild(oBg);

    TABLE_CENTER_COORDINATE = new CVector2(
      CANVAS_WIDTH / 2 - oSpriteBg.width / 4,
      CANVAS_HEIGHT / 2 - oSpriteBg.height / 4
    );
    if (DEBUG_SHOW_TABLE_CENTER_SHAPE) {
      this._createGraphicCenterTableShape();
    }

    this._initTableEdges();

    if (DEBUG_SHOW_RECT_COLLISION) {
      var oRectCollision = new createjs.Shape();
      oRectCollision.graphics
        .beginStroke("red")
        .drawRect(
          RECT_COLLISION.x,
          RECT_COLLISION.y,
          RECT_COLLISION.width,
          RECT_COLLISION.height
        );
      _oContainerUpperTable.addChild(oRectCollision);
    }

    var iWidthOffset = 300;
    var iHeightOffset = 300;

    _oHitAreaShot = new createjs.Shape();
    _oHitAreaShot.graphics
      .beginFill("red")
      .drawRect(
        -iWidthOffset * 0.5,
        -iHeightOffset * 0.5,
        oSpriteBg.width + iWidthOffset,
        oSpriteBg.height - 60 + iHeightOffset
      );
    _oHitAreaShot.alpha = 0.01;
    _oHitAreaShot.cache(
      -iWidthOffset * 0.5,
      -iHeightOffset * 0.5,
      oSpriteBg.width + iWidthOffset,
      oSpriteBg.height - 60 + iHeightOffset
    );
    _oContainer.addChild(_oHitAreaShot);

    _oContainerUpperBumper = new createjs.Container();
    _oContainerUpperTable.addChild(_oContainerUpperBumper);
    _oContainerDownBumper = new createjs.Container();
    _oContainerDownBumper.visible = false;
    _oContainer.addChild(_oContainerDownBumper);

    this._createTableDownUpperBumper();
    this.onSocket();
  };

  this.cointoss = function (result) {
    s_oScenario.createCoin(result == playerId, () => {
      s_oTable.readystate();
    });
  };
  this.readystate = function () {
    _oListenerPress = _oHitAreaShot.on("mousedown", this._onPressHitArea);
    this.initBalls();
    _oCueBall.enableEvents();
    _oCueBall.addEventListener(
      ON_PRESS_DOWN_BALL,
      this._onPressDownCueBall,
      this
    );

    _oStick = new CStick(_oContainerUpperTable);
    this.initStick();

    _iColorCuePrevTrajectory = ON_CUE_PLACEABLE;

    var oGraphics = new createjs.Graphics();
    _oDollyDir = new createjs.Shape(oGraphics);
    _oContainer.addChild(_oDollyDir);

    var oGraphics = new createjs.Graphics();
    _oCueBallDir = new createjs.Shape(oGraphics);
    _oContainer.addChild(_oCueBallDir);

    var oGraphics = new createjs.Graphics();
    _oHittenBallDir = new createjs.Shape(oGraphics);
    _oContainer.addChild(_oHittenBallDir);

    var oGraphics = new createjs.Graphics()
      .beginStroke("#fff")
      .drawCircle(0, 0, BALL_DIAMETER / 2);
    _oCircleShape = new createjs.Shape(oGraphics);
    _oCircleShape.visible = false;
    _oContainer.addChild(_oCircleShape);
    if (DEBUG_SHOW_HOLE_CENTER_POS_SHAPE) {
      for (var i = 0; i < HOLE_CENTER_POS.length; i++) {
        var oCircle = createGraphicCircle(
          HOLE_CENTER_POS[i],
          BALL_RADIUS,
          null,
          "#fff"
        );
        _oContainer.addChild(oCircle);
      }
    }
    // _oPhysicsController = new CPhysicsController();
    _iPrevState = _iState = STATE_TABLE_PLACE_CUE_BALL_BREAKSHOT;
    this._placeCueBall();
    this.updateStick();
    _vStickDirection.set(1, 0);
    this.renderStickDirection();
    _oHandCueBallDrag = new CHandBallDrag(_oContainerUpperTable);
    _oHandCueBallDrag.setPos(_oCueBall.getX(), _oCueBall.getY());
    _oHandCueBallDrag.show();
    if (DEBUG_SHOW_EDGE_TABLE) {
      this.renderEdges();
    }
    socket.emit("getStates");
    _ready = true;
  };

  this.onSocket = function () {
    socket.addEventListener("render-ball", s_oTable.setBalls);
    socket.addEventListener("_onBallInHole", s_oTable._onBallInHole);
    socket.addEventListener(
      "_onCheckBallPosInHole",
      s_oTable._onCheckBallPosInHole
    );
    socket.addEventListener(
      "_onCollisionBallWithEdge",
      s_oTable._onCollisionBallWithEdge
    );

    socket.addEventListener(
      "_onCollisionBallWithBall",
      s_oTable._onCollisionBallWithBall
    );
    socket.addEventListener("iState", s_oTable.setState);
    socket.addEventListener("_onPressHitArea", s_oTable._onNetPressHitArea);
    socket.addEventListener(
      "_onPressMoveHitArea",
      s_oTable._onNetPressMoveHitArea
    );
    socket.addEventListener("_onReleaseHitArea", s_oTable._onNetReleaseHitArea);

    socket.addEventListener(
      "_onPressDownCueBall",
      s_oTable._onNetPressDownCueBall
    );
    socket.addEventListener(
      "_onPressMoveCueBall",
      s_oTable._onNetPressMoveCueBall
    );
    socket.addEventListener("_onPressUpCueBall", s_oTable._onNetPressUpCueBall);

    socket.addEventListener("updateStick", s_oTable.setOtherPlayerPos);
    socket.addEventListener("_coinToss", s_oTable.cointoss);
    socket.addEventListener("respotCueBall", s_oTable.respotCueBall);

    socket.addEventListener("changeTurn", s_oTable.changeTurn);
    socket.addEventListener(
      "setBallInInterface",
      s_oGame.setNetBallInInterface
    );

    socket.addEventListener("setNextBallToHit", s_oGame.setNextBallToHit);
    socket.addEventListener("matchResult", s_oTable.matchResult);
  };

  this.matchResult = function (winPid) {
    if (winPid === _playerId) {
      s_oGame._netshowWinPanel("YOU WINNER");
    } else {
      s_oGame._netgameOver("YOU LOST");
    }
  };

  this.onRemoveSocket = function () {
    socket.removeEventListener("render-ball", s_oTable.setBalls);
    socket.removeEventListener("_onBallInHole", s_oTable._onBallInHole);
    socket.removeEventListener(
      "_onCheckBallPosInHole",
      s_oTable._onCheckBallPosInHole
    );
    socket.removeEventListener(
      "_onCollisionBallWithEdge",
      s_oTable._onCollisionBallWithEdge
    );

    socket.removeEventListener(
      "_onCollisionBallWithBall",
      s_oTable._onCollisionBallWithBall
    );
    socket.removeEventListener("iState", s_oTable.setState);
    socket.removeEventListener("_onPressHitArea", s_oTable._onNetPressHitArea);
    socket.removeEventListener(
      "_onPressMoveHitArea",
      s_oTable._onNetPressMoveHitArea
    );

    socket.removeEventListener("respotCueBall", s_oTable.respotCueBall);

    socket.removeEventListener(
      "_onReleaseHitArea",
      s_oTable._onNetReleaseHitArea
    );

    socket.removeEventListener(
      "_onPressDownCueBall",
      s_oTable._onNetPressDownCueBall
    );
    socket.removeEventListener(
      "_onPressMoveCueBall",
      s_oTable._onNetPressMoveCueBall
    );
    socket.removeEventListener(
      "_onPressUpCueBall",
      s_oTable._onNetPressUpCueBall
    );

    socket.removeEventListener("updateStick", s_oTable.setOtherPlayerPos);
    socket.removeEventListener("_coinToss", s_oTable.cointoss);
    socket.removeEventListener("changeTurn", s_oTable.changeTurn);

    socket.removeEventListener(
      "setBallInInterface",
      s_oGame.setNetBallInInterface
    );
    socket.removeEventListener("setNextBallToHit", s_oGame.setNextBallToHit);

    socket.removeEventListener("matchResult", s_oTable.matchResult);

    socket.emit("leaveroom-req");
  };

  this.setBalls = function (balls) {
    _balls = balls;
  };

  this.changeTurn = function (bFault) {
    s_oGame.netChangeTurn(_currentPlayer + 1, bFault);
  };

  this.getSelfPid = function () {
    return _playerId;
  };

  this.setState = function (state, trunPlayer, playerId) {
    if (playerId) {
      _playerId = playerId;
    }

    if (trunPlayer) {
      _currentPlayer = trunPlayer == _playerId ? 0 : 1;
    }

    switch (state) {
      case STATE_TABLE_PLACE_CUE_BALL:
      case STATE_TABLE_PLACE_CUE_BALL_BREAKSHOT:
      case STATE_TABLE_MOVE_STICK: {
        if (_currentPlayer == 0) {
          s_oGame.showShotBar();
        }
        _oStick.setVisible(true);
        break;
      }
      case STATE_TABLE_SHOOT: {
      }
      case STATE_TABLE_SHOOTING: {
        s_oGame.hideShotBar();
        _oHandCueBallDrag.hide();
        _bReadyForShot = false;
        _oStick.setVisible(false);
        break;
      }
    }
    _iState = state;
  };

  this.setOtherPlayerPos = function (pos) {
    if (_currentPlayer == 0) return;
    _otherPlayerPos = pos;
  };

  this.respawnBallInRails = function (oBallInHole) {
    oBallInHole.reset3DObjectTransformation();
    oBallInHole.setScale(1);
    oBallInHole.setPos(POS_RAIL_EXIT.x, POS_RAIL_EXIT.y);
    oBallInHole.setTmpForce(0, 0);
    oBallInHole.setCurForce(
      (8.98 * (BALL_NUMBER - _iDimStack)) / BALL_NUMBER,
      0
    );
    _iDimStack += 0.76;
    oBallInHole.removeMask();
    //CAudioManager.getInstance().playChannel("rolling_ball", 0, 1, 100 );
  };

  this._createTableDownUpperBumper = function () {
    for (var i = 0; i < TABLE_UPPER_BUMPER.length; i++) {
      var oSprite = s_oSpriteLibrary.getSprite(TABLE_UPPER_BUMPER[i].sprite);

      var oBumperUpper = createBitmap(oSprite);
      oBumperUpper.x = TABLE_UPPER_BUMPER[i].x;
      oBumperUpper.y = TABLE_UPPER_BUMPER[i].y;

      var iRegX = oSprite.width / TABLE_UPPER_BUMPER[i].regX;
      var iRegY = oSprite.height / TABLE_UPPER_BUMPER[i].regY;

      oBumperUpper.regX = iRegX === Infinity ? 0 : iRegX;
      oBumperUpper.regY = iRegY === Infinity ? 0 : iRegY;

      _oContainerUpperBumper.addChild(oBumperUpper);

      var oBumperDown = createBitmap(oSprite);
      oBumperDown.x = oBumperUpper.x;
      oBumperDown.y = oBumperUpper.y;
      oBumperDown.regX = oBumperUpper.regX;
      oBumperDown.regY = oBumperUpper.regY;
      _oContainerDownBumper.addChild(oBumperDown);
    }
  };

  this._createGraphicCenterTableShape = function () {
    var oCenter = createGraphicCircle(
      { x: TABLE_CENTER_COORDINATE.getX(), y: TABLE_CENTER_COORDINATE.getY() },
      10,
      null,
      "rgba(255,255,255,1)"
    );
    _oContainer.addChild(oCenter);
  };

  this.addEventListener = function (iEvent, cbCompleted, cbOwner) {
    _aCbCompleted[iEvent] = cbCompleted;
    _aCbOwner[iEvent] = cbOwner;
  };

  //listener called when balls collide
  this._onCollisionBallWithBall = function (iForce) {
    if (iForce === 0) {
      return;
    }

    var fVolume = linearFunction(iForce, 0.1, 40, 0.05, 1);
    // this._playTableSound("ball_collision", fVolume, 100);
    //playSound("ballshits", fVolume, false);
    /*
        var oAM = CAudioManager.getInstance();

        if (iForce > 10) {
                oAM.playChannel("coll_palla_palla.mp3", 0, 1, 100);
        }else if( (iForce < 10) && (iForce>5) ) {
                oAM.playChannel("coll_palla_palla_med.mp3", 0, 1, 100);
        }else{
                oAM.playChannel("coll_palla_palla_low.mp3", 0, 1, 100);
        }*/
  };

  this._playTableSound = function (szName, fVolume, iInterval) {
    var bPlayable = true;
    var iMajTime = 0;
    var iTriggerTime = new Date().getTime();
    for (var i = 0; i < _aSoundsInstance.length; i++) {
      if (
        _aSoundsInstance[i].time > iMajTime &&
        _aSoundsInstance[i].name === szName
      ) {
        iMajTime = _aSoundsInstance[i].time;
      }
    }

    if (iTriggerTime - iMajTime < iInterval) {
      bPlayable = false;
    }

    if (bPlayable) {
      var oSound = playSound(szName, fVolume, false);
      oSound.once("play", function (iID) {
        var oInfo = { time: iTriggerTime, id: iID, name: szName };
        _aSoundsInstance.push(oInfo);
      });

      oSound.once("end", function (iID) {
        for (var i = 0; i < _aSoundsInstance.lenght; i++) {
          var oSoundInfo = _aSoundsInstance[i];

          if (oSoundInfo.id === iID) {
            _aSoundsInstance.splice(i, 1);
            break;
          }
        }
      });
    }

    return bPlayable;
  };

  //listener called when ball is potted
  this._onBallInHole = function (oBallId, fForce) {
    var oBall = _aBalls.find((ball) => ball.getNumber() == oBallId);
    _aBallsInHoles.push(oBallId);
    var fVolume = linearFunction(fForce, 0.1, 40, 0.2, 1);
    oBall.setFlagOnTable(false);
    oBall.setScale(0.9);
    playSound("ball_in_hole", fVolume, false);
    var iTime = linearFunction(fForce, 0, 13, 700, 100);
    oBall.fadeAnimInHole(iTime);
  };

  this._onCheckBallPosInHole = function (oBallId) {
    var oBall = _aBalls.find((ball) => ball.getNumber() == oBallId);
    setTimeout(function () {
      s_oTable.respawnBallInRails(oBall);
    }, 1200);
  };

  //listener called when ball touch any edge
  this._onCollisionBallWithEdge = function (oBallID, fVolume, iEdgeID) {
    var oBall = _aBalls.find((b) => b.getNumber() === oBallID);

    // this._playTableSound("edge_collision", fVolume, 100);

    for (var i = 0; i < MAIN_TABLE_EDGE.length; i++) {
      if (MAIN_TABLE_EDGE[i] === iEdgeID) {
        oBall.increaseEdgeCollisionCount();
      }
    }
  };

  this.reset = function () {
    _bHoldStick = false;
    _bReadyForShot = false;
    _bCueBallInHole = false;
    _bForceStopStick = false;
    _bFirstShot = true;
    _iTimeAnimStick = 0;
    _iCntBallsIntoHoles = 0;
    _iCpuShotTurn = 0;
    _iShotPoints = 0;
    _iComboShots = 1;
    _iLowestBall = 1;
    _aBallsInHoles = new Array();
    _aBallsInHoleInCurShot = new Array();
    _aCueBallCollision = new Array();
    _bBreakShot = true;
    _aBallsToPotPlayers = [7, 7];
    _iPowerShot = 0;
  };

  this.unload = function () {
    _oHitAreaShot.off("mousedown", _oListenerPress);
    this.onRemoveSocket();
    _oHitAreaShot.removeAllEventListeners();
    s_oTable = null;
  };

  this._initTableEdges = function () {
    _aFieldEdges = new Array();
    for (var k = 0; k < FIELD_POINTS.length - 1; k++) {
      var oEdge = new CEdge(
        FIELD_POINTS[k].x,
        FIELD_POINTS[k].y,
        FIELD_POINTS[k + 1].x,
        FIELD_POINTS[k + 1].y,
        k
      );
      _aFieldEdges.push(oEdge);
    }

    //ADD LAST EDGE THAT CONNECTS LAST POINT WITH THE FIRST ONE
    var oEdge = new CEdge(
      FIELD_POINTS[FIELD_POINTS.length - 1].x,
      FIELD_POINTS[FIELD_POINTS.length - 1].y,
      FIELD_POINTS[0].x,
      FIELD_POINTS[0].y,
      FIELD_POINTS.length - 1
    );
    _aFieldEdges.push(oEdge);
  };

  this.renderEdges = function () {
    for (var k = 0; k < _aFieldEdges.length; k++) {
      _aFieldEdges[k].render(_oContainerUpperBumper);
    }
  };

  this.initBalls = function () {
    _oBallContainer = new createjs.Container();
    _oContainer.addChild(_oBallContainer);

    //INIT CUE BALL
    _aBalls = new Array();
    _oCueBall = new CBall(0, _oBallContainer, s_oTextureLibrary["cue_ball"]);
    _oCueBall.setPos(CUE_BALL_POS.x, CUE_BALL_POS.y);

    _aBalls[0] = _oCueBall;

    for (var i = 1; i < BALL_NUMBER + 1; i++) {
      var oTexture = s_oTextureLibrary["ball_" + i];
      var oBall = new CBall(i, _oBallContainer, oTexture);
      _aBalls[i] = oBall;
      _aBalls[i].setFlagOnTable(true);
    }

    this.setInitBallsPosition();
    _aBallsInHoles = new Array();

    //_bInitBalls = true;
  };

  this.setFirstBallCollision = function (oCollisionBall) {
    _aCueBallCollision.push(oCollisionBall);
  };

  this.setInitBallsPosition = function () {
    switch (s_iGameMode) {
      case GAME_MODE_NINE:
        {
          var aRandPos = new Array(1, 2, 3, 5, 6, 7, 8);

          for (var i = 2; i < BALL_NUMBER; i++) {
            var iRand = Math.floor(Math.random() * aRandPos.length);
            _aBalls[i].setPos(
              RACK_POS[aRandPos[iRand]].x,
              RACK_POS[aRandPos[iRand]].y
            );
            aRandPos.splice(iRand, 1);
          }

          _aBalls[0].setPos(CUE_BALL_POS.x, CUE_BALL_POS.y);

          _aBalls[1].setPos(RACK_POS[0].x, RACK_POS[0].y);
          _aBalls[9].setPos(RACK_POS[4].x, RACK_POS[4].y);
        }
        break;
      case GAME_MODE_EIGHT:
        {
          var _aRandPos = new Array(0, 1, 2, 3, 5, 6, 7, 8, 9, 11, 12, 13);
          //in 8ball pool the two corner balls are of different suits and the 8 ball must be in the center of the rack
          var iFirstCorner = Math.floor(Math.random() * 7) + 9;
          var iSecondCorner = Math.floor(Math.random() * 7) + 1;

          for (var i = 1; i < BALL_NUMBER + 1; i++) {
            if (i != 8 && i != iFirstCorner && i != iSecondCorner) {
              var iRand = Math.floor(Math.random() * _aRandPos.length);
              _aBalls[i].setPos(
                RACK_POS[_aRandPos[iRand]].x,
                RACK_POS[_aRandPos[iRand]].y
              );

              _aRandPos.splice(iRand, 1);
            }
          }

          _aBalls[iFirstCorner].setPos(RACK_POS[10].x, RACK_POS[10].y);
          _aBalls[iSecondCorner].setPos(RACK_POS[14].x, RACK_POS[14].y);
          _aBalls[8].setPos(RACK_POS[4].x, RACK_POS[4].y);
        }
        break;

      case GAME_MODE_TIME: {
        var aRandPos = new Array(0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14);

        for (var i = 1; i < BALL_NUMBER; i++) {
          if (i !== 9) {
            var iRand = Math.floor(Math.random() * aRandPos.length);
            _aBalls[i].setPos(
              RACK_POS[aRandPos[iRand]].x,
              RACK_POS[aRandPos[iRand]].y
            );
            aRandPos.splice(iRand, 1);
          }
        }

        _aBalls[0].setPos(CUE_BALL_POS.x, CUE_BALL_POS.y);
        _aBalls[9].setPos(RACK_POS[4].x, RACK_POS[4].y);

        break;
      }
    }

    _aBalls.forEach(function (oBall) {
      this._update3DObjectTransformation(oBall);
    }, this);
  };

  this.initStick = function () {
    _vStickInitDir = new CVector2();
    _vStickInitDir.set(-1, 0);
    _vStickDirection = new CVector2(1, 0);
    _vMousePosAtHoldStick = new CVector2();
    _vInvStickDirection = new CVector2();
  };

  this.startToShot = function () {
    _oHandCueBallDrag.hide();
    _iState = STATE_TABLE_MOVE_STICK;
    _bHoldStick = true;
  };

  this._onMouseDownPowerBar = function (e) {
    vLocalPos = _oContainer.globalToLocal(s_oStage.mouseX, s_oStage.mouseY);
    socket.emit("_onPressHitArea", vLocalPos);
  };

  this._onNetPressHitArea = function (e) {
    if (_iState === STATE_TABLE_SHOOTING) {
      return;
    }
    if (_currentPlayer == 0) return;
    vLocalPos = e;
    s_oTable.startToShot();

    _oCueBall.setDragging(false);

    _vMousePosAtHoldStick.set(vLocalPos.x, vLocalPos.y);

    _fPrevStickAngle = radiantsToDegrees(
      Math.atan2(
        _oCueBall.getPos().getY() - vLocalPos.y,
        _oCueBall.getPos().getX() - vLocalPos.x
      )
    );
    if (_fPrevStickAngle < 0) {
      _fPrevStickAngle += 360;
    } else if (_fPrevStickAngle > 360) {
      _fPrevStickAngle -= 360;
    }
  };

  this._onPressHitArea = function (e) {
    if (_iState === STATE_TABLE_SHOOTING) {
      return;
    }

    if (_currentPlayer == 0) {
      vLocalPos = _oContainer.globalToLocal(s_oStage.mouseX, s_oStage.mouseY);
      if (s_bMobile) {
        _oListenerMove = _oHitAreaShot.on(
          "pressmove",
          s_oTable._onPressMoveHitArea
        );
      } else {
        socket.emit("_onPressHitArea", vLocalPos);
      }
      _oListenerRelease = _oHitAreaShot.on(
        "pressup",
        s_oTable._onReleaseHitArea
      );

      if (!s_bMobile) {
        s_oTable.startToShot();
      }

      _oCueBall.setDragging(false);

      _vMousePosAtHoldStick.set(vLocalPos.x, vLocalPos.y);

      _fPrevStickAngle = radiantsToDegrees(
        Math.atan2(
          _oCueBall.getPos().getY() - vLocalPos.y,
          _oCueBall.getPos().getX() - vLocalPos.x
        )
      );
      if (_fPrevStickAngle < 0) {
        _fPrevStickAngle += 360;
      } else if (_fPrevStickAngle > 360) {
        _fPrevStickAngle -= 360;
      }
    }
  };

  this._onNetPressMoveHitArea = function (e) {
    if (_currentPlayer !== 0) {
      vLocalPos = e;
      var fNewAngle = radiantsToDegrees(
        Math.atan2(
          _oCueBall.getPos().getY() - vLocalPos.y,
          _oCueBall.getPos().getX() - vLocalPos.x
        )
      );

      if (fNewAngle < 0) {
        fNewAngle += 360;
      } else if (fNewAngle > 360) {
        fNewAngle -= 360;
      }

      var fRotationOffset = fNewAngle - _fPrevStickAngle;

      s_oTable.rotateStick(-fRotationOffset);
      _fPrevStickAngle = fNewAngle;
    }
  };

  this._onPressMoveHitArea = function (e) {
    var vLocalPos;
    if (_currentPlayer == 0) {
      vLocalPos = _oContainer.globalToLocal(e.stageX, e.stageY);
      socket.emit("_onPressMoveHitArea", { x: vLocalPos.x, y: vLocalPos.y });
    } else {
      return;
    }

    var fNewAngle = radiantsToDegrees(
      Math.atan2(
        _oCueBall.getPos().getY() - vLocalPos.y,
        _oCueBall.getPos().getX() - vLocalPos.x
      )
    );

    if (fNewAngle < 0) {
      fNewAngle += 360;
    } else if (fNewAngle > 360) {
      fNewAngle -= 360;
    }

    var fRotationOffset = fNewAngle - _fPrevStickAngle;

    s_oTable.rotateStick(-fRotationOffset);
    _fPrevStickAngle = fNewAngle;
  };

  this.startStickAnimation = function () {
    return s_oTable._moveStick();
  };

  this._moveStick = function (oMousePos, vStartPos) {
    _bHoldStick = false;

    var bToShot = _iPowerShot >= MIN_POWER_SHOT;

    if (bToShot) {
      _bBreakShot = false;
      _bReadyForShot = true;
      _oCueBall.setSideEffect(s_oInterface.getSideSpin());
    } else {
      _iState = _iPrevState;

      if (
        _iState === STATE_TABLE_PLACE_CUE_BALL ||
        _iState === STATE_TABLE_PLACE_CUE_BALL_BREAKSHOT
      ) {
        _oHandCueBallDrag.show();
      }
    }
    return bToShot;
  };

  this._onNetReleaseHitArea = function () {
    if (_currentPlayer == 0) return;
    switch (_iState) {
      case STATE_TABLE_MOVE_STICK: {
        s_oTable._moveStick();
        break;
      }
    }
  };

  this._onReleaseHitArea = function () {
    if (_currentPlayer == 0) {
      _oHitAreaShot.off("pressmove", _oListenerMove);
      _oHitAreaShot.off("pressup", _oListenerRelease);
      socket.emit("_onReleaseHitArea");
    }

    switch (_iState) {
      case STATE_TABLE_MOVE_STICK: {
        s_oTable._moveStick();
        break;
      }
    }
  };

  this._onPressDownCueBall = function (oEvent) {
    if (
      _currentPlayer !== 0 ||
      (_iState !== STATE_TABLE_PLACE_CUE_BALL_BREAKSHOT &&
        _iState !== STATE_TABLE_PLACE_CUE_BALL)
    ) {
      return;
    }

    socket.emit("_onPressDownCueBall");
    _oCueBall.addEventListener(
      ON_PRESS_MOVE_BALL,
      this._onPressMoveCueBall,
      this
    );
    _oCueBall.addEventListener(ON_PRESS_UP_BALL, this._onPressUpCueBall, this);
    _oCueBall.setFlagOnTable(false);
    _oStick.setVisible(true);
    _oHandCueBallDrag.setPos(_oCueBall.getX(), _oCueBall.getY());
  };

  this._onNetPressDownCueBall = function () {
    if (_currentPlayer == 0) return;
    _oCueBall.setFlagOnTable(false);
    _oStick.setVisible(true);
    _oHandCueBallDrag.setPos(_oCueBall.getX(), _oCueBall.getY());
  };

  this._onPressMoveCueBall = function (oEvt) {
    var oPos = { x: oEvt.stageX, y: oEvt.stageY };
    this._moveCueBall(oPos);
    if (this._checkCueBallCollisionWithTableElements()) {
      s_oGame.hideShotBar();
      _iColorCuePrevTrajectory = ON_CUE_NOT_PLACEABLE;
    } else {
      s_oGame.showShotBar();
      _iColorCuePrevTrajectory = ON_CUE_PLACEABLE;
    }
    _oHandCueBallDrag.setPos(_oCueBall.getX(), _oCueBall.getY());
  };

  this._onNetPressMoveCueBall = function (oPos) {
    if (_currentPlayer == 0) return;
    if (s_oTable._checkCueBallCollisionWithTableElements()) {
      s_oGame.hideShotBar();
      _iColorCuePrevTrajectory = ON_CUE_NOT_PLACEABLE;
    } else {
      s_oGame.showShotBar();
      _iColorCuePrevTrajectory = ON_CUE_PLACEABLE;
    }
    _oHandCueBallDrag.setPos(_oCueBall.getX(), _oCueBall.getY());
  };

  this._onPressUpCueBall = function () {
    _oCueBall.removeEventListener(ON_PRESS_MOVE_BALL);
    _oCueBall.removeEventListener(ON_PRESS_UP_BALL);
    socket.emit("_onPressUpCueBall");
    _oHandCueBallDrag.setPos(_oCueBall.getX(), _oCueBall.getY());
    this._placeCueBall();
  };

  this._onNetPressUpCueBall = function () {
    if (_currentPlayer == 0) return;
    _oHandCueBallDrag.setPos(_oCueBall.getX(), _oCueBall.getY());
    s_oTable._placeCueBall();
  };

  this._checkCueBallCollisionWithTableElements = function () {
    if (
      _oCueBall.getX() > CUE_BALL_RESPOT_1.x &&
      _oCueBall.getX() < CUE_BALL_RESPOT_3.x &&
      _oCueBall.getY() > CUE_BALL_RESPOT_1.y &&
      _oCueBall.getY() < CUE_BALL_RESPOT_3.y
    ) {
      var vPos = new CVector2();
      vPos.set(_oCueBall.getX(), _oCueBall.getY());
      for (var k = 1; k < BALL_NUMBER + 1; k++) {
        var tmpDist = distance2(vPos, _aBalls[k].getPos());
        if (tmpDist <= BALL_DIAMETER_QUADRO) {
          return true;
        }
      }
    }
    return false;
  };

  this._placeCueBall = function () {
    if (!this._checkCueBallCollisionWithTableElements()) {
      _oContainerUpperBumper.visible = true;
      _oContainerDownBumper.visible = false;
      _oCueBall.setDragging(false);
      _oCueBall.setFlagOnTable(true);
    }
  };

  this._moveCueBall = function (oPos) {
    var vLocalPos = _oContainer.globalToLocal(oPos.x, oPos.y);
    socket.emit("_onPressMoveCueBall", vLocalPos);
  };

  //verify if ball in second parameter collides with any ball using directional volume
  this._checkCpuBallCollision = function (
    vCollPoint,
    oBallPos,
    iNumberBall1,
    iNumberBall2,
    aDataColl
  ) {
    var vBallCCWDir = new CVector2();
    var vBallCWDir = new CVector2();
    var vBallDir = new CVector2();
    vBallDir.setV(vCollPoint);
    vBallDir.subtract(oBallPos);
    var iDirLen = vBallDir.length();
    vBallDir.normalize();

    vBallCCWDir.setV(vBallDir);
    vBallCWDir.setV(vBallDir);
    vBallCCWDir.rot90CCW();
    vBallCWDir.rot90CW();
    vBallCCWDir.scalarProduct(BALL_RADIUS);
    vBallCWDir.scalarProduct(BALL_RADIUS);
    vBallCCWDir.add(oBallPos);
    vBallCWDir.add(oBallPos);

    var vBallCCWDirProjected = new CVector2();
    var vBallCWDirProjected = new CVector2();
    vBallCCWDirProjected.setV(vBallDir);
    vBallCWDirProjected.setV(vBallDir);
    vBallCCWDirProjected.scalarProduct(iDirLen);
    vBallCWDirProjected.scalarProduct(iDirLen);
    vBallCCWDirProjected.add(vBallCCWDir);
    vBallCWDirProjected.add(vBallCWDir);
    var oEdge1 = new CEdge();
    oEdge1.set(
      vBallCWDir.getX(),
      vBallCWDir.getY(),
      vBallCWDirProjected.getX(),
      vBallCWDirProjected.getY()
    );
    var oEdge2 = new CEdge();
    oEdge2.set(
      vBallCCWDir.getX(),
      vBallCCWDir.getY(),
      vBallCCWDirProjected.getX(),
      vBallCCWDirProjected.getY()
    );

    var bCollision = false;
    var oObjectData = { iDistance: 0, vClosestPoint: new CVector2() };

    for (var i = 0; i < BALL_NUMBER + 1; i++) {
      if (i != iNumberBall1 && i != iNumberBall2) {
        if (
          collideEdgeWithCircle(
            oEdge1,
            _aBalls[i].getPos(),
            BALL_RADIUS,
            oObjectData
          )
        ) {
          bCollision = true;
          aDataColl.push({
            ball: _aBalls[i],
            point: oObjectData["vClosestPoint"],
          });
        }
        if (
          collideEdgeWithCircle(
            oEdge2,
            _aBalls[i].getPos(),
            BALL_RADIUS,
            oObjectData
          )
        ) {
          bCollision = true;
          aDataColl.push({
            ball: _aBalls[i],
            point: oObjectData["vClosestPoint"],
          });
        }
      }
    }
    return bCollision;
  };

  //verify if ball in second parameter collides with any edge using directional volume
  function checkBallCollisionWithEdges(vCollPoint, oBallPos, aEdges) {
    var vBallCCWDir = new CVector2();
    var vBallCWDir = new CVector2();
    var vBallDir = new CVector2();
    vBallDir.setV(vCollPoint);
    vBallDir.subtract(oBallPos);
    var iDirLen = vBallDir.length();
    vBallDir.normalize();

    vBallCCWDir.setV(vBallDir);
    vBallCWDir.setV(vBallDir);
    vBallCCWDir.rot90CCW();
    vBallCWDir.rot90CW();
    vBallCCWDir.scalarProduct(BALL_RADIUS);
    vBallCWDir.scalarProduct(BALL_RADIUS);
    vBallCCWDir.add(oBallPos);
    vBallCWDir.add(oBallPos);

    var vBallCCWDirProjected = new CVector2();
    var vBallCWDirProjected = new CVector2();
    vBallCCWDirProjected.setV(vBallDir);
    vBallCWDirProjected.setV(vBallDir);
    vBallCCWDirProjected.scalarProduct(iDirLen);
    vBallCWDirProjected.scalarProduct(iDirLen);
    vBallCCWDirProjected.add(vBallCCWDir);
    vBallCWDirProjected.add(vBallCWDir);
    var oEdge1 = new CEdge();
    oEdge1.set(
      vBallCWDir.getX(),
      vBallCWDir.getY(),
      vBallCWDirProjected.getX(),
      vBallCWDirProjected.getY()
    );
    var oEdge2 = new CEdge();
    oEdge2.set(
      vBallCCWDir.getX(),
      vBallCCWDir.getY(),
      vBallCCWDirProjected.getX(),
      vBallCCWDirProjected.getY()
    );

    var oDataColl = new CEdge();
    var bFound = false;
    for (var i = 0; i < aEdges.length; i++) {
      if (collideEdgeWithEdge(oEdge1, aEdges[i])) {
        oDataColl = aEdges[i];
        bFound = true;
        break;
      }
      if (collideEdgeWithEdge(oEdge2, aEdges[i])) {
        oDataColl = aEdges[i];
        bFound = true;
        break;
      }
    }

    if (bFound) {
      return oDataColl;
    } else {
      return null;
    }
  }

  this.renderStickDirection = function () {
    /*
        if (_bBreakShot) {
                return;
        }*/
    _oDollyDir.graphics.clear();
    _oCueBallDir.graphics.clear();
    _oHittenBallDir.graphics.clear();
    _oCircleShape.x = CANVAS_WIDTH + 100;
    _oCircleShape.y = CANVAS_HEIGHT + 100;
    /*if ( (_bForceStopStick == true) || (_isMouseInTable() == false && m_oAnimStick.bAnim == false) ) {
                    return;
            }*/

    if (_bHoldStick === false) {
      if (_bReadyForShot) {
        //_oStick.setVisible(true);
        var vTweenPos = new CVector2();
        var vStickPos = new CVector2();
        vStickPos.set(_oStick.getX(), _oStick.getY());
        var iLerpFactor;
        _iTimeAnimStick += s_iTimeElaps;
        if (_iPowerShot > 100) {
          iLerpFactor = easeElasticIn(
            _iTimeAnimStick,
            0,
            1,
            TIME_ANIMATION_SHOT_ELASTIC,
            -1
          );
        } else {
          iLerpFactor = easeBackIn(
            _iTimeAnimStick,
            0,
            1,
            TIME_ANIMATION_SHOT_BACK
          );
          if (_iPowerShot < MIN_POWER_SHOT) {
            _iPowerShot = MIN_POWER_SHOT;
          }
        }
        vTweenPos = tweenVectors(
          vStickPos,
          _oCueBall.getPos(),
          vTweenPos,
          iLerpFactor
        );
        if (_iTimeAnimStick >= _iMaxTimeAnimationStick) {
          var fVolume = linearFunction(
            _iPowerShot,
            MIN_POWER_SHOT,
            MAX_POWER_SHOT,
            0.3,
            1
          );
          playSound("stick_shot", fVolume, false);
          _iTimeAnimStick = 0;
          _bReadyForShot = false;
          _iPowerShot *= 0.2;
          _vStickDirection.scalarProduct(_iPowerShot);

          // _oCueBall.addForce(_vStickDirection);

          this.playerShot();

          _vStickDirection.normalize();
          var fFactor = 0.5;
          var fSideSpinForce =
            s_oInterface.getSideSpin() *
            (fFactor * Math.sign(_vStickDirection.getX()));
          var fBackSpinForce =
            s_oInterface.getBackSpin() *
            (fFactor * Math.sign(_vStickDirection.getY()));
          var fSideSpinNorm =
            fSideSpinForce + fBackSpinForce * _vStickDirection.getX();
          var fBackSpinNorm =
            fBackSpinForce - fSideSpinNorm * Math.sign(_vStickDirection.getX());
          // _oCueBall.setEffectForceX(-fSideSpinNorm);
          // _oCueBall.setEffectForceY(-fBackSpinNorm);
          var vEffectForce = _oCueBall.getEffectForceVector();
          vEffectForce.add(_vStickDirection);

          //playSound("shoot", 1,false );
          _iState = STATE_TABLE_SHOOTING;
        }
        _oStick.setPos(vTweenPos.getX(), vTweenPos.getY());
      } else {
        /*
                            if ( m_bTargetting == false ){
                                    return;
                            }*/
        //draw line for ball directions

        var aCollisionData = new Array();
        var vMousePos = new CVector2();
        var vLocalPos = {
          x: _vStickDirection.getX() * 1280 + _oCueBall.getX(),
          y: _vStickDirection.getY() * 1280 + _oCueBall.getY(),
        };
        vMousePos.set(vLocalPos.x, vLocalPos.y);
        var vCollPoint = new CVector2();
        vCollPoint.setV(vMousePos);
        vCollPoint.subtract(_oCueBall.getPos());
        vCollPoint.normalize();
        //find any collision  between cue ball and other balls
        var bCheckBallCollison = this._checkCpuBallCollision(
          vMousePos,
          _oCueBall.getPos(),
          0,
          0,
          aCollisionData
        );
        for (var i = 0; i < aCollisionData.length; i++) {
          if (!aCollisionData[i].ball.isBallOnTable()) {
            aCollisionData.splice(i, 1);
            i--;
          }
        }
        bCheckBallCollison = aCollisionData.length > 0;
        if (bCheckBallCollison) {
          var iMinDist = distance(
            _oCueBall.getPos(),
            aCollisionData[0].ball.getPos()
          );
          var iBallIndex = 0;
          for (var k = 1; k < aCollisionData.length; k++) {
            if (!aCollisionData[k].ball.isBallOnTable()) {
              continue;
            }
            var iCurDist = distance(
              _oCueBall.getPos(),
              aCollisionData[k].ball.getPos()
            );
            if (iCurDist < iMinDist) {
              iMinDist = iCurDist;
              iBallIndex = k;
            }
          }
          var oEdgeCueBall = new CEdge();
          oEdgeCueBall.set(
            _oCueBall.getX(),
            _oCueBall.getY(),
            vMousePos.getX(),
            vMousePos.getY()
          );
          var vDir = new CVector2();
          vDir.setV(vCollPoint);
          vDir.scalarProduct(1.5);
          var vCueBallPos = new CVector2();
          vCueBallPos.setV(_oCueBall.getPos());
          while (
            distance(vCueBallPos, aCollisionData[iBallIndex].ball.getPos()) >
            BALL_DIAMETER + 1
          ) {
            vCueBallPos.add(vDir);
          }
          //draw cue ball dir
          var vCueBallNormal = new CVector2();
          vCueBallNormal.setV(aCollisionData[iBallIndex].ball.getPos());
          vCueBallNormal.subtract(vCueBallPos);
          vCueBallNormal.normalize();
          var vCueBallDir = new CVector2();
          vCueBallNormal.invert();
          vCueBallDir = reflectVectorV2(vCueBallNormal, vCollPoint);
          vCueBallDir.normalize();
          vCueBallDir.scalarProduct(48);
          var vCueBallPoint = new CVector2();
          vCueBallPoint.setV(vCueBallPos);
          vCueBallPoint.add(vCueBallDir);
          //draw direction of ball hitted by cue ball
          var vDirBallHitted = new CVector2();
          vDirBallHitted.setV(aCollisionData[iBallIndex].ball.getPos());
          vDirBallHitted.subtract(vCueBallPos);
          vDirBallHitted.normalize();
          vDirBallHitted.scalarProduct(72);
          var vBallHittedPoint = new CVector2();
          vBallHittedPoint.setV(vCueBallPos);
          vBallHittedPoint.add(vDirBallHitted);
          _oCircleShape.visible = true;
          _oCircleShape.x = vCueBallPos.getX();
          _oCircleShape.y = vCueBallPos.getY();
          _oDollyDir.graphics
            .setStrokeStyle(4)
            .beginStroke(
              PREVISION_TRAJECTORY_COLORS[0][_iColorCuePrevTrajectory]
            )
            .moveTo(_oCueBall.getX(), _oCueBall.getY())
            .lineTo(vCueBallPos.getX(), vCueBallPos.getY());
          _oCueBallDir.graphics
            .setStrokeStyle(4)
            .beginStroke(
              PREVISION_TRAJECTORY_COLORS[0][_iColorCuePrevTrajectory]
            )
            .moveTo(vCueBallPos.getX(), vCueBallPos.getY())
            .lineTo(vCueBallPoint.getX(), vCueBallPoint.getY());
          _oHittenBallDir.graphics
            .setStrokeStyle(4)
            .beginStroke(
              PREVISION_TRAJECTORY_COLORS[1][_iColorCuePrevTrajectory]
            )
            .moveTo(vCueBallPos.getX(), vCueBallPos.getY())
            .lineTo(vBallHittedPoint.getX(), vBallHittedPoint.getY());
        } else {
          //verify if stick direction collide with edges
          var oEdgeColl = new CEdge();
          oEdgeColl.set(
            _oCueBall.getX(),
            _oCueBall.getY(),
            vMousePos.getX(),
            vMousePos.getY()
          );
          var oHittenEdge = new CEdge();
          oHittenEdge = checkBallCollisionWithEdges(
            vMousePos,
            _oCueBall.getPos(),
            _aFieldEdges
          );
          if (oHittenEdge !== null) {
            var vPosColl = new CVector2();
            var vDir = new CVector2();
            vDir.setV(vCollPoint);
            vDir.scalarProduct(2);
            vPosColl.setV(_oCueBall.getPos());
            while (!collideEdgeWithCircle(oHittenEdge, vPosColl, BALL_RADIUS)) {
              vPosColl.add(vDir);
            }
            _oCircleShape.visible = true;
            _oCircleShape.x = vPosColl.getX();
            _oCircleShape.y = vPosColl.getY();
            _oDollyDir.graphics
              .beginStroke(
                PREVISION_TRAJECTORY_COLORS[0][_iColorCuePrevTrajectory]
              )
              .moveTo(_oCueBall.getX(), _oCueBall.getY())
              .lineTo(vPosColl.getX(), vPosColl.getY());
          } else {
            _oCircleShape.visible = false;
            _oDollyDir.graphics
              .beginStroke(
                PREVISION_TRAJECTORY_COLORS[0][_iColorCuePrevTrajectory]
              )
              .moveTo(_oCueBall.getX(), _oCueBall.getY())
              .lineTo(
                _oCueBall.getX() +
                  _vStickDirection.getX() * _iDistFromBlankBall,
                _oCueBall.getY() + _vStickDirection.getY() * _iDistFromBlankBall
              );
          }
        }
        //move stick
        _oStick.setPos(_oCueBall.getX(), _oCueBall.getY());
        var iAngle = toDegree(
          angleBetweenVectors(_vStickInitDir, _vStickDirection)
        );
        var vLocalPos = {
          x: _vStickDirection.getX() * 1280 + _oCueBall.getX(),
          y: _vStickDirection.getY() * 1280 + _oCueBall.getY(),
        };
        if (vLocalPos.y > _oCueBall.getY()) {
          iAngle = 180 - iAngle + 180;
        }
        _oStick.setRotation(iAngle + 180);
      }
    } else {
      _oStick.setPos(
        _oCueBall.getX() + _vInvStickDirection.getX() * _iPowerShot,
        _oCueBall.getY() + _vInvStickDirection.getY() * _iPowerShot
      );
    }
  };

  this.playerShot = function () {
    if (_currentPlayer == 0) {
      socket.emit("player-shot", {
        x: _vStickDirection.getX(),
        y: _vStickDirection.getY(),
      });
    }
  };

  this.updateStick = function () {
    var vTmpMouse = new CVector2();
    var vLocalPos;
    if (_currentPlayer == 0) {
      vLocalPos = _oContainer.globalToLocal(s_oStage.mouseX, s_oStage.mouseY);

      socket.emit("updateStick", vLocalPos);
    } else {
      vLocalPos = _otherPlayerPos;
    }

    vTmpMouse.set(vLocalPos.x, vLocalPos.y);
    if (_bHoldStick === false) {
      if (_bReadyForShot === true) {
        _iTimeAnimStick += s_iTimeElaps;
        if (_iTimeAnimStick > _iMaxTimeAnimationStick) {
          _iTimeAnimStick = _iMaxTimeAnimationStick;
        }
      } else {
        var bDirByMouse = !s_bMobile && _oCueBall.isBallOnTable();
        if (_currentPlayer != 0 || bDirByMouse) {
          _vStickDirection.setV(vTmpMouse);
          _vStickDirection.subtract(_oCueBall.getPos());
        }
        _iDistFromBlankBall = _vStickDirection.length();
        if (_currentPlayer != 0 || bDirByMouse) {
          _vStickDirection.normalize();
        }
        _vInvStickDirection.setV(_vStickDirection);
        _vInvStickDirection.invert();
      }
    } else if (_currentPlayer != 0 || !s_bMobile) {
      vTmpMouse.subtract(_vMousePosAtHoldStick);
      var iPowerShot = vTmpMouse.length();
      this.holdShotStickMovement(iPowerShot);
    }
  };

  this.holdShotStickMovement = function (iPowerShot) {
    _iPowerShot = iPowerShot;
    if (_iPowerShot > MAX_POWER_SHOT) {
      _iPowerShot = MAX_POWER_SHOT;
    }
    _iMaxTimeAnimationStick =
      _iPowerShot > 100
        ? TIME_ANIMATION_SHOT_ELASTIC
        : TIME_ANIMATION_SHOT_BACK;
  };

  this.renderBalls = function (balls) {
    for (var i = 0; i < _aBalls.length; i++) {
      var ball = balls.find((b) => b.id == _aBalls[i].getNumber());
      if (ball) {
        _aBalls[i].setPosV(new CVector2(ball.x, ball.y));
        _aBalls[i].setCurForce(ball.vCurForce.x, ball.vCurForce.y);
      } else {
        _aBalls[i].addPos(_aBalls[i].getCurForce());
        _aBalls[i].scalarProductCurForce(K_FRICTION);
        if (_aBalls[i].getCurForceLenght2() < K_MIN_FORCE) {
          _aBalls[i].setCurForce(0, 0);
        }
      }
      _aBalls[i].render();
    }

    _aBalls.forEach(function (oBall, i) {
      this._update3DObjectTransformation(oBall, i);
      oBall._updateShadow();
    }, this);
  };

  //re-spot the cue ball after a foul
  this.respotCueBall = function () {
    // _oCueBall.setDragging(true);
    _iState = STATE_TABLE_PLACE_CUE_BALL;
    _oContainerUpperBumper.visible = false;
    _oContainerDownBumper.visible = true;

    // var bIsCpu = s_iPlayerMode === GAME_MODE_CPU && s_oGame.getCurTurn() === 2;
    // if (!bIsCpu) {
    _iPrevState = _iState;
    _oCueBall.setPos(CUE_BALL_POS.x, CUE_BALL_POS.y);
    _oStick.setVisible(true);
    _oHandCueBallDrag.setPos(_oCueBall.getX(), _oCueBall.getY(0));
    _oHandCueBallDrag.show();
    // }
  };

  this.rotateStick = function (fAngleOffset) {
    if (
      _iState === STATE_TABLE_SHOOT ||
      _iState === STATE_TABLE_SHOOTING ||
      (s_iPlayerMode === GAME_MODE_CPU && s_oGame.getCurTurn() === 2) ||
      _bReadyForShot
    ) {
      return;
    }

    rotateVector2D(toRadian(fAngleOffset), _vStickDirection);
    this.updateStick();
    this.renderStickDirection();
  };

  this._assignSuit = function () {
    var bSuitToAssigned =
      _aBallsToPotPlayers[0] === 7 && _aBallsToPotPlayers[1] === 7;
    if (bSuitToAssigned) {
      var iStripes = 0;
      var iSolid = 0;
      for (var k = 0; k < _aBallsInHoleInCurShot.length; k++) {
        if (_aBallsInHoleInCurShot[k] > 8) {
          iStripes++;
        } else {
          iSolid++;
        }
      }

      console.log("STRIPES: " + iStripes);
      console.log("iSolid: " + iSolid);
      if (iStripes > iSolid) {
        console.log("ASSIGN STRIPES TO " + s_oGame.getCurTurn());
        s_oGame.assignSuits(9);
        for (var iCont = 0; iCont < iStripes; iCont++) {
          _aBallsInHoleInCurShot[s_oGame.getCurTurn() - 1]--;
        }
        for (var iCont2 = 0; iCont2 < iSolid; iCont2++) {
          _aBallsInHoleInCurShot[s_oGame.getNextTurn() - 1]--;
        }
      } else {
        console.log("ASSIGN SOLID TO " + s_oGame.getCurTurn());
        s_oGame.assignSuits(1);
        for (var iCont = 0; iCont < iSolid; iCont++) {
          _aBallsToPotPlayers[s_oGame.getCurTurn() - 1]--;
        }
        for (var iCont2 = 0; iCont2 < iStripes; iCont2++) {
          _aBallsToPotPlayers[s_oGame.getNextTurn() - 1]--;
        }
      }
    }
    return bSuitToAssigned;
  };

  //this function respot ball for CPU if previous player commited a fault
  this.respotCpuCueBall = function (vCollPoint, iBallToHit) {
    var iBallIndex;
    switch (s_iGameMode) {
      case GAME_MODE_NINE: {
        iBallIndex = _iLowestBall;
        break;
      }
      case GAME_MODE_EIGHT: {
        iBallIndex = iBallToHit;
        break;
      }
    }
    var vCueBallPos = new CVector2();
    vCueBallPos.setV(_aBalls[iBallIndex].getPos());
    vCueBallPos.subtract(vCollPoint);
    vCueBallPos.normalize();
    vCueBallPos.invert();
    vCueBallPos.scalarProduct(BALL_DIAMETER * 2);
    vCueBallPos.add(vCollPoint);

    for (var k = iBallIndex + 1; k < _aBalls.length; k++) {
      var tmpDist = distance2(vCueBallPos, _aBalls[k].getPos());
      if (tmpDist <= BALL_DIAMETER_QUADRO) {
        return false;
      }
    }

    if (
      vCueBallPos.getX() > CUE_BALL_RESPOT_1.x &&
      vCueBallPos.getX() < CUE_BALL_RESPOT_3.x &&
      vCueBallPos.getY() > CUE_BALL_RESPOT_1.y &&
      vCueBallPos.getY() < CUE_BALL_RESPOT_3.y
    ) {
      _oCueBall.setPos(vCueBallPos.getX(), vCueBallPos.getY());
      _oCueBall.setDragging(false);
      return true;
    } else {
      console.trace(
        "no respotCpuCueBall " + vCueBallPos.getX() + "," + vCueBallPos.getY()
      );
      return false;
    }
  };

  //find the collision point for a cpu shot
  this.findCollisionPoint = function (oXFirst, oYFirst, oSecond) {
    var vDirToHole = new CVector2();
    vDirToHole.set(oXFirst, oYFirst);

    vDirToHole.subtract(oSecond.getPos());

    vDirToHole.normalize();

    vDirToHole.invert();
    var vCollisionPoint = new CVector2();

    var fErrorRatio = randomFloatBetween(
      _oCpuDifficultyParams[_iCpuShotTurn].min,
      _oCpuDifficultyParams[_iCpuShotTurn].max
    );

    vDirToHole.scalarProduct(BALL_DIAMETER * fErrorRatio);

    vDirToHole.add(oSecond.getPos());

    vCollisionPoint.setV(vDirToHole);

    return vCollisionPoint;
  };

  //find collision point between lowest ball and cue ball

  //first: point where cue ball collide lowest ball
  //second:projection of collision point towards the cushion
  //third:all the edges to consider
  this._getEdgeShot = function (vCollision, vDir, aEdges) {
    var oCushionToConsider;
    var vCollPoint = new CVector2();
    vCollPoint.setV(vCollision);

    var iAngle = 1;
    var oEdgeCollPoint = new CEdge();

    vDir.scalarProduct(600);
    var aPossibleShots = new Array();

    while (iAngle < 360) {
      console.log("#######ANGLE " + iAngle);
      rotateVector2D(toRadian(1), vDir);
      var vProjectedPoint = new CVector2();
      vProjectedPoint.set(
        vCollPoint.getX() + vDir.getX(),
        vCollPoint.getY() + vDir.getY()
      );
      oEdgeCollPoint.set(
        vCollision.getX(),
        vCollision.getY(),
        vProjectedPoint.getX(),
        vProjectedPoint.getY()
      );
      var vPointOnCushion = new CVector2();

      for (var k = 0; k < aEdges.length; k++) {
        if (collideEdgeWithEdge(oEdgeCollPoint, aEdges[k], vPointOnCushion)) {
          oCushionToConsider = aEdges[k];
          var vDirReflected = new CVector2();
          vDirReflected.setV(
            reflectVectorV2(vDir, oCushionToConsider.getNormal())
          );
          var oEdgeReflectVec = new CEdge();
          var vReflectedPoint = new CVector2();
          vReflectedPoint.setV(vDirReflected);
          vReflectedPoint.add(vPointOnCushion);
          oEdgeReflectVec.set(
            vPointOnCushion.getX(),
            vPointOnCushion.getY(),
            vReflectedPoint.getX(),
            vReflectedPoint.getY()
          );
          var iDist2 = distance(vPointOnCushion, vCollision);
          console.log(
            "oEdgeReflectVec " +
              oEdgeReflectVec.getPointA().toString() +
              "," +
              oEdgeReflectVec.getPointB().toString()
          );
          if (
            iDist2 > BALL_DIAMETER &&
            collideEdgeWithCircle(
              oEdgeReflectVec,
              _oCueBall.getPos(),
              BALL_RADIUS
            )
          ) {
            var bCollision = false;

            if (
              this._checkCpuBallCollision(
                vPointOnCushion,
                _oCueBall.getPos(),
                0,
                0,
                new Array()
              )
            ) {
              bCollision = true;
              console.log(
                k +
                  " 1 collision " +
                  vPointOnCushion.getX() +
                  "," +
                  vPointOnCushion.getY() +
                  " and cue ball"
              );
            } else if (
              this._checkCpuBallCollision(
                vCollision,
                vPointOnCushion,
                0,
                0,
                new Array()
              )
            ) {
              bCollision = true;
              console.log(
                k +
                  " 2 collision " +
                  vCollision.getX() +
                  "," +
                  vCollision.getY() +
                  " and " +
                  vPointOnCushion.getX() +
                  "," +
                  vPointOnCushion.getY()
              );
            }

            if (!bCollision) {
              vDirReflected.invert();
              vDirReflected.normalize();

              var vMemorizeDir = new CVector2();
              vMemorizeDir.setV(vDirReflected);
              var iDist = distance(
                oEdgeReflectVec.getPointA(),
                oEdgeReflectVec.getPointB()
              );
              aPossibleShots.push({
                dir: vMemorizeDir,
                edge: oEdgeReflectVec,
                dist: iDist + iDist2,
              });
            }
          }
        }
      }

      iAngle += 1;
    }

    if (aPossibleShots.length === 0) {
      return undefined;
    }

    var vTmpPoint = closestPointOnLine(
      aPossibleShots[0].edge.getPointA(),
      aPossibleShots[0].edge.getPointB(),
      _oCueBall.getPos()
    );
    var iMinDist = distance(vTmpPoint, _oCueBall.getPos());
    var iSelectedShot = 0;

    for (var t = 1; t < aPossibleShots.length; t++) {
      var vTmpPoint = closestPointOnLine(
        aPossibleShots[t].edge.getPointA(),
        aPossibleShots[t].edge.getPointB(),
        _oCueBall.getPos()
      );
      var iDist = distance(vTmpPoint, _oCueBall.getPos());

      if (iMinDist > iDist) {
        iMinDist = iDist;
        iSelectedShot = t;
      }
    }
    return aPossibleShots[iSelectedShot];
  };

  this.prepareEdgeShot = function (
    t,
    vCollision,
    vProjectDir,
    aEdges,
    aTotalDist
  ) {
    var aShots = new Array();
    //verify if we can shot using the top left cushion of table
    vProjectDir.set(0, -1);
    var bSuccess = false;
    //collect all the table edges
    aShots[t] = this._getEdgeShot(vCollision, vProjectDir, aEdges);
    //update total distance of best shot for current hole
    if (aShots[t] == undefined) {
      aTotalDist[t] += 9000;
      bSuccess = false;
    } else {
      aTotalDist[t] += aShots[t].dist;
      bSuccess = true;
    }
    //verify if we can shot using the right cushion of table
    if (!bSuccess) {
      //verify if we can shot using the top left cushion of table
      vProjectDir.set(1, 0);

      //collect all the table edges
      aShots[t] = this._getEdgeShot(vCollision, vProjectDir, aEdges);
      //update total distance of best shot for current hole
      if (aShots[t] === undefined) {
        aTotalDist[t] += 9000;
        bSuccess = false;
      } else {
        aTotalDist[t] += aShots[t].dist;
        bSuccess = true;
      }
      if (!bSuccess) {
        //verify if we can shot using the bottom cushion of table
        vProjectDir.set(0, 1);

        //collect all the table edges
        aShots[t] = this._getEdgeShot(vCollision, vProjectDir, aEdges);
        //update total distance of best shot for current hole
        if (aShots[t] == undefined) {
          aTotalDist[t] += 9000;
          bSuccess = false;
        } else {
          aTotalDist[t] += aShots[t].dist;
          bSuccess = true;
        }
        if (!bSuccess) {
          //verify if we can shot using the left cushion of table
          vProjectDir.set(-1, 0);

          //collect all the table edges
          aShots[t] = this._getEdgeShot(vCollision, vProjectDir, aEdges);
          //update total distance of best shot for current hole
          if (aShots[t] == undefined) {
            aTotalDist[t] += 9000;
            return false;
          } else {
            aTotalDist[t] += aShots[t].dist;
            return true;
          }
        } else {
          this._edgeShot(aTotalDist, aShots);
        }
      } else {
        this._edgeShot(aTotalDist, aShots);
      }
    } else {
      this._edgeShot(aTotalDist, aShots);
    }
  };

  this._edgeShot = function (aTotalDist, aShots) {
    if (aShots === undefined) {
      return;
    }
    var iMinDist = aTotalDist[0];
    var iSelected = 0;
    for (var x = 1; x < aTotalDist.length; x++) {
      if (aTotalDist[x] < iMinDist) {
        iMinDist = aTotalDist[x];
        iSelected = x;
      }
    }

    var oDirShot = aShots[iSelected];

    oDirShot = oDirShot === undefined ? undefined : oDirShot.dir;

    this.cpuShot(oDirShot);
  };

  //set the lowest numbered ball on table each turn
  this.setLowestBall = function () {
    for (var i = 1; i < _aBalls.length; i++) {
      if (_aBalls[i].isBallOnTable()) {
        _iLowestBall = i;
        break;
      }
    }
  };

  this.isBreakShot = function () {
    return _bBreakShot;
  };

  this.getCntBallsIntoHoles = function () {
    return _iCntBallsIntoHoles;
  };

  this.updatePhysics = function (balls) {
    _oPhysicsController.update(
      _aBalls.filter((a) => balls.find((b) => b.id != a.getNumber()))
    );
  };

  this.getTableX = function () {
    return _oContainer.x;
  };

  this.getTableY = function () {
    return _oContainer.y;
  };

  this._update3DObjectTransformation = function (oObj2D, i) {
    var oPosObj2D = { x: oObj2D.getX(), y: oObj2D.getY() };
    var oObj3D = oObj2D.getObject3D();

    oObj3D.position.x = -CANVAS_WIDTH * 0.5 + oPosObj2D.x + this.getTableX();
    oObj3D.position.y = CANVAS_HEIGHT * 0.5 - oPosObj2D.y - this.getTableY();

    var vCurForce = oObj2D.getCurForce();
    var fFactor = 0.04;

    var vEffect = oObj2D.getEffectForceVector();

    var vBallForce = new CVector2(vCurForce.getX(), vCurForce.getY());

    vBallForce.add(vEffect);
    var fForce = vBallForce.length() * fFactor;
    vBallForce.normalize();

    vEffect.scalarProduct(DAMPING_BALL_EFFECT);
    oObj3D.rotateOnWorldAxis(
      new THREE.Vector3(vBallForce.getY(), vBallForce.getX(), 0),
      fForce
    );
  };

  this.update = function () {
    if (!_ready) return;
    // s_oTable.updatePhysics(_balls);
    s_oTable.renderBalls(_balls);
    switch (_iState) {
      case STATE_TABLE_PLACE_CUE_BALL:
      case STATE_TABLE_PLACE_CUE_BALL_BREAKSHOT:
      case STATE_TABLE_MOVE_STICK: {
        this.updateStick();
        this.renderStickDirection();
        break;
      }
      case STATE_TABLE_SHOOT: {
      }
      case STATE_TABLE_SHOOTING: {
        break;
      }
    }
  };

  s_oTable = this;

  this._init(oCpuDifficultyParams);
}

var s_oTable = null;
