function CSearchInput(_oParentContainer) {
  var _oJoinBtn;
  var _oSearchInput;

  this._init = function () {
    var iOffsetY = 200;
    _oContainer = new createjs.Container();
    // _oContainer.visible = false;
    _oParentContainer.addChild(_oContainer);

    _oSearchInput = new CInputText(
      { x: 0, y: 0 },
      "#fff",
      30,
      "center",
      _oContainer
    );

    var _searchsprite = s_oSpriteLibrary.getSprite("player_gui");
    // _searchsprite.width = 100;
    // _searchsprite.height = 100;

    _oJoinBtn = new CTextButton(
      650,
      110,
      _searchsprite,
      "JOIN",
      FONT_GAME,
      "#fff",
      30,
      "center",
      _oContainer
    );

    _oJoinBtn.setTextOffsetX(30);
    _oJoinBtn.setTextOffsetY(30);
    
    var pJoinBtn = {
      x: 100,
      y: 100,
    };
    _oContainer.x = pJoinBtn.x;
    _oContainer.y = pJoinBtn.y;
  };

  this.unload = function () {
    _oSearchInput.unload();
    _oJoinBtn.unload();

    s_oCSearchInput = null;
  };

  s_oCSearchInput = this;

  this._init();
}

var s_oCSearchInput = null;
