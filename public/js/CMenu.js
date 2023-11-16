function CMenu() {
  var _pStartPosAudio;
  var _pStartPosCredits;
  var _pStartPosFullscreen;
  var _pStartPosButSingle;
  var _pStartPosButTwo;
  var _pStartPosLang;

  var _oBg;
  var _oLogo;
  var _oButPlaySingle;
  var _oButPlayTwo;
  var _oAudioToggle;
  var _oButCredits;
  var _oFade;
  var _oButFullscreen;
  var _oButLang;
  var _fRequestFullScreen = null;
  var _fCancelFullScreen = null;

  var _oButUserProfile;
  var _pStartPosButProfile;
  var _oButBalance;
  var _pStartPosBalance;

  this._init = function () {
    _oBg = createBitmap(s_oSpriteLibrary.getSprite("bg_menu"));
    s_oStage.addChild(_oBg);

    _pStartPosButSingle = { x: CANVAS_WIDTH / 4, y: CANVAS_HEIGHT / 1.4 };
    _oButPlaySingle = new CGfxButton(
      CANVAS_WIDTH / 5,
      _pStartPosButSingle.y,
      s_oSpriteLibrary.getSprite("vs_pc_panel"),
      s_oStage
    );
    _oButPlaySingle.addEventListener(ON_MOUSE_UP, this._onButPlaySingle, this);

    _pStartPosButTwo = {
      x: CANVAS_WIDTH - CANVAS_WIDTH / 4,
      y: CANVAS_HEIGHT / 1.4,
    };
    _oButPlayTwo = new CGfxButton(
      CANVAS_WIDTH - CANVAS_WIDTH / 5,
      _pStartPosButTwo.y,
      s_oSpriteLibrary.getSprite("vs_man_panel"),
      s_oStage
    );
    _oButPlayTwo.addEventListener(ON_MOUSE_UP, this._onButPlayTwo, this);

    _pStartPosButMatch = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 1.7 };
    _oButPlayMatch = new CGfxButton(
      _pStartPosButMatch.x,
      CANVAS_HEIGHT / 2.3,
      s_oSpriteLibrary.getSprite("winner_match"),
      s_oStage
    );

    _oButPlayMatch.addEventListener(ON_MOUSE_UP, this._onButPlayMatch, this);

    _pStartPosButConnect = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 5 };
    _oButWalletConnect = new CGfxButton(
      _pStartPosButConnect.x,
      _pStartPosButConnect.y,
      s_oSpriteLibrary.getSprite("connect_icon"),
      s_oStage
    );

    _oButWalletConnect.addEventListener(ON_MOUSE_UP, this._onConnect, this);

    _oButWalletConnect.setScale(0.4, 0.4);
    _oButWalletConnect.pulseAnimation();

    createjs.Tween.get(_oButPlaySingle.getGraphic(), { override: false }).to(
      { x: _pStartPosButSingle.x },
      500,
      createjs.Ease.cubicOut
    );

    createjs.Tween.get(_oButPlayTwo.getGraphic(), { override: false }).to(
      { x: _pStartPosButTwo.x },
      500,
      createjs.Ease.cubicOut
    );

    createjs.Tween.get(_oButPlayMatch.getGraphic(), { override: false }).to(
      { y: _pStartPosButMatch.y },
      500,
      createjs.Ease.cubicOut
    );

    var oSpriteLang = s_oSpriteLibrary.getSprite("but_lang");

    if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
      var oSprite = s_oSpriteLibrary.getSprite("audio_icon");
      _pStartPosAudio = {
        x: CANVAS_WIDTH - oSprite.height / 2 - 10,
        y: oSprite.height / 2 + 10,
      };
      _oAudioToggle = new CToggle(
        _pStartPosAudio.x,
        _pStartPosAudio.y,
        oSprite,
        s_bAudioActive,
        s_oStage
      );
      _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
      _pStartPosLang = {
        x: _pStartPosAudio.x - oSpriteLang.width / NUM_LANGUAGES - 10,
        y: _pStartPosAudio.y,
      };
    } else {
      _pStartPosLang = {
        x: CANVAS_WIDTH - oSprite.width / 4 - 10,
        y: oSprite.height / 2 + 10,
      };
    }

    _oButLang = new CButLang(
      _pStartPosLang.x,
      _pStartPosLang.y,
      NUM_LANGUAGES,
      s_iCurLang,
      oSpriteLang,
      s_oStage
    );

    _oButLang.addEventListener(ON_SELECT_LANG, this._onChangeLang, this);

    _pStartPosButProfile = {
      x: CANVAS_WIDTH / 2,
      y: oSprite.height / 2 + 10,
    };
    _oButUserProfile = new CGfxButton(
      _pStartPosButProfile.x,
      _pStartPosButProfile.y,
      s_oSpriteLibrary.getSprite("btn_userProfile"),
      s_oStage
    );
    _oButUserProfile.setVisible(false);

    _oButUserProfile.addEventListener(ON_MOUSE_UP, this._onShowProfile, this);

    var oSprite = s_oSpriteLibrary.getSprite("but_credits");
    _pStartPosCredits = {
      x: oSprite.width / 2 + 10,
      y: oSprite.height / 2 + 10,
    };

    _oButCredits = new CGfxButton(
      _pStartPosCredits.x,
      _pStartPosCredits.y,
      oSprite,
      s_oStage
    );

    _oButCredits.addEventListener(ON_MOUSE_UP, this._onButCreditsRelease, this);

    var doc = window.document;
    var docEl = doc.documentElement;
    _fRequestFullScreen =
      docEl.requestFullscreen ||
      docEl.mozRequestFullScreen ||
      docEl.webkitRequestFullScreen ||
      docEl.msRequestFullscreen;
    _fCancelFullScreen =
      doc.exitFullscreen ||
      doc.mozCancelFullScreen ||
      doc.webkitExitFullscreen ||
      doc.msExitFullscreen;

    if (ENABLE_FULLSCREEN === false) {
      _fRequestFullScreen = false;
    }

    if (_fRequestFullScreen && screenfull.isEnabled) {
      oSprite = s_oSpriteLibrary.getSprite("but_fullscreen");
      _pStartPosFullscreen = {
        x: _pStartPosCredits.x + oSprite.width / 2 + 10,
        y: _pStartPosCredits.y,
      };

      _oButFullscreen = new CToggle(
        _pStartPosFullscreen.x,
        _pStartPosFullscreen.y,
        oSprite,
        s_bFullscreen,
        s_oStage
      );
      _oButFullscreen.addEventListener(
        ON_MOUSE_UP,
        this._onFullscreenRelease,
        this
      );
    }

    if (!s_oLocalStorage.isUsed()) {
      var oMsgBoxPanel = new CAreYouSurePanel();
      oMsgBoxPanel.changeMessage(TEXT_ERR_LS, -170);
      oMsgBoxPanel.setOneButton();
    }

    _oFade = new createjs.Shape();
    _oFade.graphics
      .beginFill("black")
      .drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    s_oStage.addChild(_oFade);

    createjs.Tween.get(_oFade).to({ alpha: 0 }, 1000, createjs.Ease.cubicOut);

    $("#canvas_upper_3d").css("pointer-events", "none");
    sizeHandler();

    Wallet.changeButton = (data) => {
      if (data == "disconnected") {
        alertShow("disconnected!");
        this.showProfileAndWalletInfo(false);
      } else {
        alertShow("connected!");
        this.showProfileAndWalletInfo(true);
      }
    };

    if (Wallet.selectedAccount) {
      this.showProfileAndWalletInfo(true);
    }
  };

  this._onShowProfile = function () {
    this._onExit(function () {
      s_oMenu.unload();
      s_oMain.gotoProfile();
    });
  };

  this.showProfileAndWalletInfo = function (swi) {
    if (swi) {
      _oButUserProfile.setVisible(true);
      // _oButBalance.setVisible(true);
      _oButWalletConnect.setVisible(false);
    } else {
      _oButUserProfile.setVisible(false);
      // _oButBalance.setVisible(false);
      _oButWalletConnect.setVisible(true);
    }
  };

  this._onConnect = function () {
    if (!Wallet.selectedAccount) {
      Wallet.onConnect();
    } else {
      alertShow(
        "Already connected\n The disconnection button is located in the wallet!"
      );
    }
  };

  this._onButPlayMatch = function () {
    alertShow("Not completed");
  };

  this._onExit = function (oCbCompleted) {
    _oFade.on("click", function () {});

    createjs.Tween.get(_oButPlaySingle.getGraphic(), { override: true }).to(
      { x: CANVAS_WIDTH / 5 },
      500,
      createjs.Ease.cubicOut
    );

    createjs.Tween.get(_oButPlayTwo.getGraphic(), { override: true }).to(
      { x: CANVAS_WIDTH - CANVAS_WIDTH / 5 },
      500,
      createjs.Ease.cubicOut
    );

    createjs.Tween.get(_oButPlayMatch.getGraphic(), { override: true }).to(
      { y: CANVAS_HEIGHT / 2.5 },
      500,
      createjs.Ease.cubicOut
    );

    _oFade.visible = true;
    createjs.Tween.get(_oFade)
      .to({ alpha: 1 }, 300, createjs.Ease.cubicOut)
      .call(oCbCompleted);
  };

  this.unload = function () {
    _oButPlaySingle.unload();
    _oButCredits.unload();
    _oButPlayTwo.unload();
    _oButPlayMatch.unload();
    _oButWalletConnect.unload();
    // _oButBalance.unload();
    _oButUserProfile.unload();

    if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
      _oAudioToggle.unload();
      _oAudioToggle = null;
    }

    if (_fRequestFullScreen && screenfull.isEnabled) {
      _oButFullscreen.unload();
    }

    _oButLang.unload();
    _oFade.removeAllEventListeners();
    s_oStage.removeAllChildren();
    s_oMenu = null;
  };

  this.refreshButtonPos = function () {
    if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
      _oAudioToggle.setPosition(
        _pStartPosAudio.x - s_iOffsetX,
        s_iOffsetY + _pStartPosAudio.y
      );
    }
    if (_fRequestFullScreen && screenfull.isEnabled) {
      _oButFullscreen.setPosition(
        _pStartPosFullscreen.x + s_iOffsetX,
        _pStartPosFullscreen.y + s_iOffsetY
      );
    }
    _oButCredits.setPosition(
      _pStartPosCredits.x + s_iOffsetX,
      _pStartPosCredits.y + s_iOffsetY
    );

    _oButPlaySingle.setPosition(
      _pStartPosButSingle.x,
      _pStartPosButSingle.y - s_iOffsetY
    );
    _oButPlayTwo.setPosition(
      _pStartPosButTwo.x,
      _pStartPosButTwo.y - s_iOffsetY
    );

    _oButPlayMatch.setPosition(
      _pStartPosButMatch.x,
      _pStartPosButMatch.y - s_iOffsetY
    );

    _oButWalletConnect.setPosition(
      _pStartPosButConnect.x,
      _pStartPosButConnect.y - s_iOffsetY
    );

    // _oButBalance.setPosition(
    //   _pStartPosBalance.x - s_iOffsetX,
    //   s_iOffsetY + _pStartPosBalance.y
    // );

    _oButUserProfile.setPosition(
      _pStartPosButProfile.x - s_iOffsetX,
      s_iOffsetY + _pStartPosButProfile.y
    );

    // _oLogo.scaleX = _oLogo.scaleY = linearFunction(
    //   s_iOffsetY,
    //   0,
    //   EDGEBOARD_Y,
    //   1,
    //   0.9
    // );
    _oButLang.setPosition(
      _pStartPosLang.x - s_iOffsetX,
      _pStartPosLang.y + s_iOffsetY
    );
  };

  this._onButPlaySingle = function () {
    s_iPlayerMode = GAME_MODE_CPU;
    s_iGameMode = GAME_MODE_EIGHT;

    this._onExit(function () {
      s_oMenu.unload();
      s_oMain.gotoDifficultyMenu();
    });
  };

  this._onButPlayTwo = function () {
    s_iPlayerMode = GAME_MODE_TWO;
    s_iGameMode = GAME_MODE_EIGHT;

    this._onExit(function () {
      s_oMenu.unload();
      s_oMain.gotoRoomList();
    });
    if (Wallet.selectedAccount) {
    } else {
      alertShow("Please connect your wallet");
      // this._onConnect();
    }
  };

  this._onChangeLang = function (iLang) {
    s_iCurLang = iLang;
    refreshLanguage();
  };

  this._onButCreditsRelease = function () {
    new CCreditsPanel();
  };

  this._onAudioToggle = function () {
    Howler.mute(s_bAudioActive);
    s_bAudioActive = !s_bAudioActive;
  };

  this.resetFullscreenBut = function () {
    if (_fRequestFullScreen && screenfull.isEnabled) {
      _oButFullscreen.setActive(s_bFullscreen);
    }
  };

  this._onFullscreenRelease = function () {
    if (s_bFullscreen) {
      _fCancelFullScreen.call(window.document);
    } else {
      _fRequestFullScreen.call(window.document.documentElement);
    }

    sizeHandler();
  };

  s_oMenu = this;

  this._init();
}

var s_oMenu = null;
