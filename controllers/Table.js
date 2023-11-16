const { CBall } = require("./Ball");
const CEdge = require("./CEdge");
const {
  angleBetweenVectors,
  toDegree,
  distance2,
  collideEdgeWithCircle,
  collideEdgeWithEdge,
  lineInterpolate,
  distance,
  rotateVector2D,
  toRadian,
  reflectVectorV2,
  closestPointOnLine,
} = require("./Math");
const { CPhysicsController } = require("./PhysicsController");
const { CVector2 } = require("./Vector2");
const {
  ON_BALL_INTO_HOLE,
  ON_BALL_WITH_BALL,
  ON_BALL_WITH_BANK,
  GAME_MODE_EIGHT,
  BALL_RADIUS,
  HOLE_CPU_POINTS,
  BALL_DIAMETER,
  MAX_FORCE_PER_DISTANCE,
  MAX_POWER_SHOT,
  TIME_ANIMATION_SHOT_ELASTIC,
  TIME_ANIMATION_SHOT_BACK,
  STATE_TABLE_SHOOT,
  MAIN_TABLE_EDGE,
  GAME_DIFFICULTY_PARAMS,
  DEBUG_SHOW_PREDICT_TRAJECTORY_COLLISION,
  GAME_MODE_NINE,
  STATE_TABLE_SHOOTING,
  MIN_POWER_SHOT,
  STATE_TABLE_PLACE_CUE_BALL,
  POINTS_FOR_BALL_POT,
  CUE_BALL_RESPOT_1,
  CUE_BALL_RESPOT_3,
  BALL_DIAMETER_QUADRO,
  FIELD_POINTS,
  STATE_TABLE_PLACE_CUE_BALL_BREAKSHOT,
  STATE_TABLE_MOVE_STICK,
  ON_WON,
  ON_PRESS_DOWN_BALL,
} = require("./setting");
const { randomFloatBetween, linearFunction, sortByKey } = require("./utils");

var BALL_NUMBER = 15;
var CUE_BALL_POS = { x: 357, y: 356 };
var RACK_POS = [
  { x: 916, y: 356 },
  { x: 941, y: 370 },
  { x: 941, y: 342 },
  { x: 966, y: 384 },
  { x: 966, y: 356 }, //BALL 8
  { x: 966, y: 328 },
  { x: 991, y: 398 },
  { x: 991, y: 370 },
  { x: 991, y: 342 },
  { x: 991, y: 314 },
  { x: 1016, y: 412 },
  { x: 1016, y: 384 },
  { x: 1016, y: 356 },
  { x: 1016, y: 328 },
  { x: 1016, y: 300 },
];
module.exports.Table = function (io, room) {
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

  var _oHandCueBallDrag;
  var _fPrevStickAngle;
  var _iPrevState;
  var _iColorCuePrevTrajectory;

  var _iCpuShotTurn;

  var _aSoundsInstance;

  var s_iCntTime = 0;
  var s_iTimeElaps = 0;
  var s_iPrevTime = 0;
  var s_iCntFps = 0;
  var s_iCurFps = 0;
  this._init = function () {
    _oCpuDifficultyParams = GAME_DIFFICULTY_PARAMS[0];
    this.reset();

    this._initTableEdges();

    this.initBalls();
    _oCueBall.enableEvents();

    _oPhysicsController = new CPhysicsController(this, io);
    _oPhysicsController.addEventListener(
      ON_BALL_INTO_HOLE,
      this._onBallInHole,
      this
    );
    _oPhysicsController.addEventListener(
      ON_BALL_WITH_BALL,
      this._onCollisionBallWithBall,
      this
    );
    _oPhysicsController.addEventListener(
      ON_BALL_WITH_BANK,
      this._onCollisionBallWithEdge,
      this
    );

    _iPrevState = _iState = STATE_TABLE_PLACE_CUE_BALL;

    this.renderBalls();
    this._placeCueBall();
  };

  //listener called when balls collide
  this._onCollisionBallWithBall = function (oFirstBall, oSecondBall, iForce) {
    if (iForce === 0) {
      return;
    }
    var fVolume = linearFunction(iForce, 0.1, 40, 0.05, 1);

    io.to(room.getRoomId()).emit("_onCollisionBallWithBall", fVolume);
  };

  //listener called when ball is potted
  this._onBallInHole = function (oBall) {
    if (oBall.getNumber() !== 0) {
      _iCntBallsIntoHoles++;
      _aBallsInHoles.push(oBall.getNumber());
      _aBallsInHoleInCurShot.push(oBall.getNumber());
      var fForce = oBall.getCurForceLen();
      io.to(room.getRoomId()).emit("_onBallInHole", oBall.getNumber(), fForce);
    } else {
      _bCueBallInHole = true;
    }

    var iEdgeCollisionCueBall = _oCueBall.getEdgeCollisionCount();
    var iEdgeCollisionBallPotted = oBall.getEdgeCollisionCount();
    var iShotPointsRatio = iEdgeCollisionBallPotted + iEdgeCollisionCueBall;
    // //console.log("SHOT RATIO: " + iShotPointsRatio);
    iShotPointsRatio = iShotPointsRatio <= 0 ? 1 : iShotPointsRatio;
    _iShotPoints += POINTS_FOR_BALL_POT * iShotPointsRatio * _iComboShots;
    _iComboShots++;
  };

  this._onCheckBallPosInHole = function (oBallId) {
    io.to(room.getRoomId()).emit("_onCheckBallPosInHole", oBallId);
  };

  this.prepareNextTurn = function () {
    var turn = this.checkTurn();
    _iState = STATE_TABLE_MOVE_STICK;
    if (!turn.bEndGame) {
      if (turn.bFault) {
        _iState = STATE_TABLE_PLACE_CUE_BALL_BREAKSHOT;
      }
      console.log("isState", _iState, room.getCurrentPlayer());
      io.to(room.getRoomId()).emit("iState", _iState, room.getCurrentPlayer());
    }
  };

  this.getState = function () {
    return _iState;
  };

  //listener called when ball touch any edge
  this._onCollisionBallWithEdge = function (oBall, oEdge = null) {
    var fForce = oBall.getCurForceLen();

    if (fForce === 0) {
      return;
    }

    var fVolume = linearFunction(fForce, 0.1, 40, 0.1, 1);

    io.to(room.getRoomId()).emit(
      "_onCollisionBallWithEdge",
      oBall.getNumber(),
      fVolume,
      oEdge ? oEdge.getID() : null
    );

    var fForce = oBall.getCurForceLen();

    if (!oEdge) {
      return;
    }

    var iEdgeID = oEdge.getID();
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
    // _oBallContainer = new createjs.Container();
    // _oContainer.addChild(_oBallContainer);

    //INIT CUE BALL
    _aBalls = new Array();
    _oCueBall = new CBall(0);
    _oCueBall.setPos(CUE_BALL_POS.x, CUE_BALL_POS.y);

    _aBalls[0] = _oCueBall;

    for (var i = 1; i < BALL_NUMBER + 1; i++) {
      var oBall = new CBall(i);
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
  };

  this.hitBall = function () {
    _iPowerShot *= 0.2;
    _vStickDirection.scalarProduct(_iPowerShot);
    _oCueBall.addForce(_vStickDirection);
  };

  this._onPressDownCueBall = function (oEvent) {
    // _oCueBall.setFlagOnTable(false);
  };

  this._onPressMoveCueBall = function (oPos) {
    this._moveCueBall(oPos);
  };

  this._onPressUpCueBall = function () {
    this._placeCueBall();
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
      _oCueBall.setDragging(false);
      _oCueBall.setFlagOnTable(true);
    }
  };

  this._moveCueBall = function (oPos) {
    if (
      _iState === STATE_TABLE_PLACE_CUE_BALL ||
      _iState === STATE_TABLE_PLACE_CUE_BALL_BREAKSHOT
    ) {
      var vLocalPos = oPos;
      if (
        vLocalPos.y - BALL_RADIUS > FIELD_POINTS[1].y &&
        vLocalPos.y + BALL_RADIUS < FIELD_POINTS[13].y
      ) {
        _oCueBall.setY(vLocalPos.y);
      }

      if (_iState === STATE_TABLE_PLACE_CUE_BALL_BREAKSHOT) {
        if (
          vLocalPos.x + BALL_RADIUS < FIELD_POINTS[9].x &&
          vLocalPos.x - BALL_RADIUS > FIELD_POINTS[21].x
        ) {
          _oCueBall.setX(vLocalPos.x);
        }
      }
    }
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

    for (var i = 0; i < BALL_NUMBER; i++) {
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

  this.renderBalls = function () {
    io.to(room.getRoomId()).emit(
      "render-ball",
      _aBalls
        .filter((b) => b.isBallOnTable())
        .map((ball) => {
          var vCurForce = ball.getCurForce();
          return {
            id: ball.getNumber(),
            x: ball.getX(),
            y: ball.getY(),
            vCurForce: { x: vCurForce.getX(), y: vCurForce.getY() },
          };
        })
    );
  };

  //re-spot the cue ball after a foul
  this.respotCueBall = function () {
    _oCueBall.setDragging(true);
    _iState = STATE_TABLE_PLACE_CUE_BALL;
    _iPrevState = _iState;
    _oCueBall.setPos(CUE_BALL_POS.x, CUE_BALL_POS.y);
    console.log("replace");
    io.to(room.getRoomId()).emit("respotCueBall");
  };

  //check player fault
  this.checkTurn = function () {
    var bFault = false;
    var bTurnChanged = false;
    var bEndGame = false;

    if (_aBalls[8].isBallOnTable() === false) {
      bEndGame = true;
      if (_aBallsToPotPlayers[room.getCurTurn() - 1] === 0) {
        if (room.getCurTurn() === 1) {
          room.matchResult("player1");
        } else {
          room.matchResult("player2");
        }
      } else {
        if (room.getCurTurn() == 1) {
          room.matchResult("player2");
        } else {
          room.matchResult("player1");
        }
      }
      return {};
    }
    //if cue ball has been potted
    if (_bCueBallInHole) {
      console.log(1);
      _bCueBallInHole = false;
      room.changeTurn(true);
      bTurnChanged = true;
      bFault = true;
      this._assignSuit();
      this.respotCueBall();
      for (var i = 0; i < _aBallsInHoleInCurShot.length; i++) {
        if (!room.isLegalShotFor8Ball(_aBallsInHoleInCurShot[i])) {
          _aBallsToPotPlayers[room.getNextTurn() - 1]--;
        } else {
          _aBallsToPotPlayers[room.getCurTurn() - 1]--;
        }
      }
    } else {
      //verify if it is a legal shot for the current player
      if (
        _aCueBallCollision.length !== 0 &&
        room.isLegalShotFor8Ball(
          _aCueBallCollision[0].getNumber(),
          _aBallsToPotPlayers[room.getCurTurn() - 1]
        )
      ) {
        //verify if any ball has been potted
        if (_aBallsInHoleInCurShot.length > 0) {
          //if suites has not been assigned
          if (this._assignSuit()) {
            if (_aBallsToPotPlayers[room.getCurTurn() - 1] == 0) {
              room.setNextBallToHit(8);
            }
          } else {
            //if a player pot first an opponent ball it's foul
            if (room.isLegalShotFor8Ball(_aBallsInHoleInCurShot[0])) {
              console.log("FIRST BALL POTTED IS LEGAL");
              var bLegalShot = true;
              _aBallsToPotPlayers[room.getCurTurn() - 1]--;
              if (_aBallsInHoleInCurShot.length > 1) {
                for (var i = 1; i < _aBallsInHoleInCurShot.length; i++) {
                  if (!room.isLegalShotFor8Ball(_aBallsInHoleInCurShot[i])) {
                    bLegalShot = false;
                    _aBallsToPotPlayers[room.getNextTurn() - 1]--;
                  } else {
                    _aBallsToPotPlayers[room.getCurTurn() - 1]--;
                  }
                }
                if (_aBallsToPotPlayers[room.getCurTurn() - 1] == 0) {
                  room.setNextBallToHit(8);
                }
                bFault = bLegalShot;
                if (!bLegalShot) {
                  room.changeTurn(true);
                  bTurnChanged = true;
                }
              }

              console.log(_aBallsToPotPlayers, _aBallsInHoleInCurShot);
              if (_aBallsToPotPlayers[room.getCurTurn() - 1] == 0) {
                room.setNextBallToHit(8);
              }
            } else {
              room.changeTurn(true);
              bTurnChanged = true;
              bFault = true;
              this.respotCueBall();
              for (var i = 0; i < _aBallsInHoleInCurShot.length; i++) {
                if (!room.isLegalShotFor8Ball(_aBallsInHoleInCurShot[i])) {
                  _aBallsToPotPlayers[room.getNextTurn() - 1]--;
                } else {
                  _aBallsToPotPlayers[room.getCurTurn() - 1]--;
                }
              }

              if (_aBallsToPotPlayers[room.getCurTurn() - 1] === 0) {
                room.setNextBallToHit(8);
              }
            }
          }
        } else {
          room.changeTurn(false);
          bTurnChanged = true;
        }
      } else {
        for (var i = 0; i < _aBallsInHoleInCurShot.length; i++) {
          if (!room.isLegalShotFor8Ball(_aBallsInHoleInCurShot[i])) {
            _aBallsToPotPlayers[room.getNextTurn() - 1]--;
          } else {
            _aBallsToPotPlayers[room.getCurTurn() - 1]--;
          }
        }

        if (_aBallsToPotPlayers[room.getCurTurn() - 1] == 0) {
          room.setNextBallToHit(8);
        }
        room.changeTurn(true);
        bTurnChanged = true;
        bFault = true;
        this.respotCueBall();
      }
    }
    _aCueBallCollision.splice(0);
    _aBallsInHoleInCurShot.splice(0);

    if (!_oCueBall.isDragging()) {
      _iPrevState = _iState = STATE_TABLE_MOVE_STICK;
      // room.showShotBar();
    }

    if (bTurnChanged) {
      _iCpuShotTurn = 0;
      _iComboShots = 1;
    }

    var iPreTurn = bTurnChanged ? 2 : 1;
    _iShotPoints = 0;
    return { bEndGame, bFault };
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

      //console.log("STRIPES: " + iStripes);
      //console.log("iSolid: " + iSolid);
      if (iStripes > iSolid) {
        //console.log("ASSIGN STRIPES TO "+room.getCurTurn());
        room.assignSuits(9);
        for (var iCont = 0; iCont < iStripes; iCont++) {
          _aBallsInHoleInCurShot[room.getCurTurn() - 1]--;
        }
        for (var iCont2 = 0; iCont2 < iSolid; iCont2++) {
          _aBallsInHoleInCurShot[room.getNextTurn() - 1]--;
        }
      } else {
        console.log("ASSIGN SOLID TO " + room.getCurTurn());
        room.assignSuits(1);
        for (var iCont = 0; iCont < iSolid; iCont++) {
          _aBallsToPotPlayers[room.getCurTurn() - 1]--;
        }
        for (var iCont2 = 0; iCont2 < iStripes; iCont2++) {
          _aBallsToPotPlayers[room.getNextTurn() - 1]--;
        }
      }
    }

    console.log("assign:" + bSuitToAssigned);
    return bSuitToAssigned;
  };

  this.shotBall = function (vStickDirection) {
    console.log("shot-ball");
    _oCueBall.addForce(new CVector2(vStickDirection.x, vStickDirection.y));
    _iState = STATE_TABLE_SHOOTING;
    io.to(room.getRoomId()).emit("iState", STATE_TABLE_SHOOTING);
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

    for (var k = iBallIndex + 1; k < BALL_NUMBER; k++) {
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

  //get all the possible holes in which you can pot lowest ball
  this.setAllHolesToAim = function (oBall, oBallToHit, iNumber, aEdges) {
    var aProbableHole = new Array();

    //find the hole we want to aim
    for (var i = 0; i < HOLE_CPU_POINTS.length; i++) {
      var oEdgeWithHole = new CEdge();
      console.log("HOLE " + i);
      oEdgeWithHole.set(
        oBallToHit.getX(),
        oBallToHit.getY(),
        HOLE_CPU_POINTS[i].x,
        HOLE_CPU_POINTS[i].y
      );
      var iDist = distance(
        oEdgeWithHole.getPointA(),
        oEdgeWithHole.getPointB()
      );

      var bCollision = false;
      //verify if there are other balls between ball to pot and the current hole
      for (var j = 0; j < BALL_NUMBER; j++) {
        if (
          j != iNumber &&
          collideEdgeWithCircle(
            oEdgeWithHole,
            _aBalls[j].getPos(),
            BALL_DIAMETER
          )
        ) {
          bCollision = true;
          console.log("collision with " + j);
          break;
        }
      }
      //verify if current ball path is far from cushions
      for (var k = 0; k < aEdges.length; k++) {
        if (collideEdgeWithEdge(oEdgeWithHole, aEdges[k])) {
          bCollision = true;
          console.log("hit edge " + k);
          break;
        }
      }

      if (!bCollision) {
        //we find the dir to the hole
        aProbableHole.push({
          //hole:this["oHole" + i],
          coll: this.findCollisionPoint(
            HOLE_CPU_POINTS[i].x,
            HOLE_CPU_POINTS[i].y,
            oBallToHit
          ),
          dist: iDist,
        });
        console.log("add aProbableHole");
      }
    }

    if (aProbableHole.length !== 0) {
      var iLen = aProbableHole.length;
      var iInd = 0;
      while (iLen > 0) {
        var vCollPoint = aProbableHole[iInd].coll;
        var bSuccess = true;
        if (oBall.getNumber() === 0 && oBall.isDragging()) {
          // bSuccess = this.respotCpuCueBall(vCollPoint, oBallToHit.getNumber());
        }
        if (
          !bSuccess ||
          this._checkCpuBallCollision(
            vCollPoint,
            oBall.getPos(),
            oBall.getNumber(),
            iNumber,
            new Array()
          )
        ) {
          aProbableHole.splice(iInd, 1);
        } else {
          iInd++;
        }
        iLen--;
      }
    } else {
      return [];
    }
    return aProbableHole;
  };

  //first parameter: first ball
  //second parameter: ball to hit
  //third parameter: number of ball to hit
  //array with all table edges
  this.setHoleToAim = function (oBall, oBallToHit, iNumber, aEdges) {
    var aProbableHole = new Array();

    var iCollisionRadiusDetect = BALL_RADIUS * 1.1;
    //find the hole we want to aim
    for (var i = 0; i < 6; i++) {
      var oEdgeWithHole = new CEdge();
      oEdgeWithHole.set(
        oBallToHit.getX(),
        oBallToHit.getY(),
        HOLE_CPU_POINTS[i].x,
        HOLE_CPU_POINTS[i].y
      );
      var iDist = distance2(
        oEdgeWithHole.getPointA(),
        oEdgeWithHole.getPointB()
      );

      var bCollision = false;
      //verify if there are other balls between ball to pot and the current hole
      for (var j = 0; j < BALL_NUMBER; j++) {
        if (
          j != iNumber &&
          collideEdgeWithCircle(
            oEdgeWithHole,
            _aBalls[j].getPos(),
            BALL_DIAMETER
          )
        ) {
          bCollision = true;

          break;
        }
      }
      for (var k = 0; k < aEdges.length; k++) {
        if (collideEdgeWithEdge(oEdgeWithHole, aEdges[k])) {
          bCollision = true;

          break;
        }
      }

      var aPoints = lineInterpolate(oEdgeWithHole, iCollisionRadiusDetect, 3);
      var aEdges = _oPhysicsController.getEdgesByHoleID(i);
      //                    var vHolePoint = new CVector2(HOLE_CPU_POINTS[i].x, HOLE_CPU_POINTS[i].y);
      //                    aPoints.push(vHolePoint);

      for (var n = 0; n < aPoints.length; n++) {
        if (bCollision) {
          break;
        }
        for (var m = 0; m < aEdges.length; m++) {
          bCollision = collideEdgeWithCircle(
            aEdges[m],
            aPoints[n],
            iCollisionRadiusDetect
          );
          if (bCollision) {
            if (DEBUG_SHOW_PREDICT_TRAJECTORY_COLLISION) {
              _oContainer.addChild(
                createGraphicLine(
                  { x: oBallToHit.getX(), y: oBallToHit.getY() },
                  HOLE_CPU_POINTS[i],
                  3,
                  6000,
                  "#f0f"
                )
              );
              _oContainer.addChild(
                createGraphicCircle(
                  { x: aPoints[n].getX(), y: aPoints[n].getY() },
                  iCollisionRadiusDetect,
                  6000,
                  "#0ff"
                )
              );
            }
            break;
          }
        }
      }

      if (!bCollision) {
        //we find the dir to the hole
        var oBallCollPoint = this.findCollisionPoint(
          HOLE_CPU_POINTS[i].x,
          HOLE_CPU_POINTS[i].y,
          oBallToHit
        );

        //DETECT IF CUE BALL COLLIDE WITH CUSHION BACKWARD SELECTED BALL
        var aEdge = _oPhysicsController.getEdgesByHoleID(i);
        var bCueWillCollideCuschion = false;
        for (var j = 0; j < aEdge.length; j++) {
          if (collideEdgeWithCircle(aEdges[j], oBallCollPoint, BALL_RADIUS)) {
            bCueWillCollideCuschion = true;
            break;
          }
        }

        if (!bCueWillCollideCuschion) {
          aProbableHole.push({
            hole: HOLE_CPU_POINTS[i],
            coll: oBallCollPoint,
            dist: iDist,
          });
        } else {
          if (DEBUG_SHOW_PREDICT_TRAJECTORY_COLLISION) {
            _oContainer.addChild(
              createGraphicCircle(
                { x: oBallCollPoint.getX(), y: oBallCollPoint.getY() },
                iCollisionRadiusDetect,
                6000,
                "#0f0"
              )
            );
          }
        }
      }
    }

    if (aProbableHole.length !== 0) {
      // console.log(JSON.stringify(aProbableHole));
      sortByKey(aProbableHole, "dist");
      console.log(JSON.stringify(aProbableHole));

      var iLen = aProbableHole.length;
      var iInd = 0;
      while (iLen > 0) {
        var vCollPoint = aProbableHole[iInd].coll;
        var bSuccess = true;
        // if (oBall.getNumber() === 0 && oBall.isDragging()) {
        //   bSuccess = this.respotCpuCueBall(vCollPoint, oBallToHit.getNumber());
        // }
        if (
          !bSuccess ||
          this._checkCpuBallCollision(
            vCollPoint,
            oBall.getPos(),
            oBall.getNumber(),
            oBall.getNumber(),
            new Array()
          )
        ) {
          aProbableHole.splice(iInd, 1);
        } else {
          iInd++;
        }
        iLen--;
      }
      if (aProbableHole.length == 0) {
        //set a shot to cushions
        return null;
      } else {
        //                            var iMinDist = aProbableHole[0].dist;
        var oHoleChoosen = aProbableHole[0];
        //                            for (var k = 1; k < aProbableHole.length; k++) {
        //                                    if (iMinDist > aProbableHole[k].dist) {
        //                                            iMinDist = aProbableHole[k].dist;
        //                                            oHoleChoosen = aProbableHole[k];
        //                                    }
        //                            }
        return oHoleChoosen;
      }
    } else {
      return null;
    }
  };

  //cpu tries an edge shot
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
          //console.log("oEdgeReflectVec "+oEdgeReflectVec.getPointA().toString()+","+oEdgeReflectVec.getPointB().toString())
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
              //console.log(k+ " 1 collision "+vPointOnCushion.getX()+","+vPointOnCushion.getY()+" and cue ball")
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
              //console.log(k+ " 2 collision "+vCollision.getX()+","+vCollision.getY()+" and "+vPointOnCushion.getX()+","+vPointOnCushion.getY())
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
    for (var i = 1; i < BALL_NUMBER; i++) {
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

  this.updatePhysics = function () {
    var bAllBallsStoppedPrev = _oPhysicsController.areBallsStopped();
    _oPhysicsController.update(_aBalls);
    var bAllBallsStoppedAfter = _oPhysicsController.areBallsStopped();
    if (!bAllBallsStoppedPrev && bAllBallsStoppedAfter) {
      this.prepareNextTurn();
      _iPowerShot = 0;
      for (var i = 0; i < BALL_NUMBER; i++) {
        _aBalls[i].resetEdgeCollisionCount();
      }
    }
  };

  this.getTableX = function () {
    return _oContainer.x;
  };

  this.getTableY = function () {
    return _oContainer.y;
  };

  this.update = function () {
    var iCurTime = new Date().getTime();
    s_iTimeElaps = iCurTime - s_iPrevTime;
    s_iCntTime += s_iTimeElaps;
    s_iCntFps++;
    s_iPrevTime = iCurTime;

    switch (_iState) {
      case STATE_TABLE_PLACE_CUE_BALL:
      case STATE_TABLE_PLACE_CUE_BALL_BREAKSHOT:
      case STATE_TABLE_MOVE_STICK: {
      }
      case STATE_TABLE_SHOOT: {
        this.updatePhysics();
        this.renderBalls();
        break;
      }
      case STATE_TABLE_SHOOTING: {
        this.updatePhysics();
        this.renderBalls();
        break;
      }
    }
  };

  s_oTable = this;

  this._init();
};

var s_oTable = null;
