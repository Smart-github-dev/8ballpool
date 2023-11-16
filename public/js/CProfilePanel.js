function CProfile() {
  var _pStartPosExit;

  var _oBg;
  var _oButExit;
  var _oFade;

  var _interface;
  var _fRequestFullScreen = null;
  var _fCancelFullScreen = null;

  var _domElement;
  this._init = function () {
    _oBg = createBitmap(s_oSpriteLibrary.getSprite("bg_menu"));
    s_oStage.addChild(_oBg);

    var oSpriteExit = s_oSpriteLibrary.getSprite("but_exit");
    _pStartPosExit = {
      x: CANVAS_WIDTH - oSpriteExit.width / 2 - 10,
      y: oSpriteExit.height / 2 + 10,
    };

    _oButExit = new CGfxButton(
      _pStartPosExit.x,
      _pStartPosExit.y,
      oSpriteExit,
      s_oStage
    );
    _oButExit.addEventListener(ON_MOUSE_DOWN, this._onMouseDownButExit, this);

    _interface = document.getElementById("room_interface");
    $(_interface).show();
    _domElement = new createjs.DOMElement(_interface);

    s_oStage.addChild(_domElement);

    window.addEventListener("resize", this.resizeDOMElement);

    _oFade = new createjs.Shape();
    _oFade.graphics
      .beginFill("black")
      .drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    s_oStage.addChild(_oFade);

    createjs.Tween.get(_oFade).to({ alpha: 0 }, 1000, createjs.Ease.cubicOut);

    document
      .getElementById("create_room_btn")
      .addEventListener("click", this.showModal);

    document
      .getElementById("create-room-ok")
      .addEventListener("click", this.openRoom);

    document
      .getElementById("create-room-cancel")
      .addEventListener("click", this.hideModal);

    document
      .getElementById("search_btn")
      .addEventListener("click", this.searchRoom);

    document
      .getElementById("quick_join_btn")
      .addEventListener("click", this.quckJoin);

    document
      .getElementById("refresh_roominfo")
      .addEventListener("click", this.refreshRooms);

    this.resizeDOMElement();
    this.onSocket();
    sizeHandler();
  };

  this.onSocket = function () {
    socket.addEventListener("createroom-res", this.onCreateRoom);
    socket.addEventListener("joinroom-res", this.onJoinRes);
    socket.addEventListener("add-room", this.addRoom);
    socket.addEventListener("remove-room", this.removeRoom);
    socket.addEventListener("setall-room", this.setRoom);
    socket.addEventListener("new-join", this.newJoin);

    socket.emit("getall-room");
  };

  this.newJoin = function (data) {
    console.log(data);
    var card = document.querySelector(`#${data.roomid}`);
    if (card) {
      var position = card.querySelector(`.player2`);
      if (position) {
        position.innerHTML = data.pid;
      }
    }
  };

  this.addRoom = function (data) {
    $(".content-wraper").append(`
            <div class="vs_card fade-on-scroll" id="${data.roomid}">
                <div class="vs-card-wraper">
                    <div class="vs-card-avatar player1">
                    ${
                      data.players && typeof data.players[0] !== "undefined"
                        ? `<div>${data.players[0].playerid}</div>`
                        : ""
                    }
                    </div>
                    <div class="info-status-btn">
                        <button type="button" class="btn1 vs-card-btn" style="font-size: 15px;" onclick="s_oRoomList.joinRoom('${
                          data.roomid
                        }')">join</button>
                        <button type="button" class="btn1 vs-card-btn" style="font-size: 15px;" onclick="s_oRoomList.spectator('${
                          data.roomid
                        }')">spectator</button>
                    </div>
                    <div class="vs-card-avatar player2">
                    ${
                      data.players && typeof data.players[1] !== "undefined"
                        ? `<div>${data.players[1].playerid}</div>`
                        : ""
                    }
                    </div>
                </div>
            </div>
      `);
  };

  this.removeRoom = function (data) {
    $(`#${data.roomid}`).remove();
  };

  this.setRoom = function (datas) {
    $(".content-wraper").html("");
    datas.forEach((room) => {
      s_oRoomList.addRoom(room);
    });
  };

  this.onJoinRes = function (res) {
    if (res.success) {
      s_oRoomList.onOpenRoom(res.pid);
      alertShow("Success to join room.");
    } else {
      alertShow("Failed to join room.");
    }
  };

  this.quckJoin = function () {
    socket.emit("joinroom-req");
  };

  this.refreshRooms = function () {
    $(".content-wraper").html("");
    socket.emit("getall-room");
  };

  this.onOpenRoom = function (pid) {
    this._onExit(function () {
      s_oRoomList.unload();
      s_oMain.gotoGame(pid);
      $(s_oMain).trigger("start_session");
    });
  };

  this.spectator = function (roomid) {
    socket.emit("spectator-req", roomid);
  };

  this.joinRoom = function (roomid) {
    socket.emit("joinroom-req", roomid);
  };

  this.searchRoom = function () {
    var roomid = $("#search_roomid").val();
    if (roomid == "") {
      $("#search_roomid").css("border-color", "red");
      return;
    }
    socket.emit("joinroom-req", roomid);
  };

  this.onCreateRoom = function (res) {
    if (res.success) {
      socket.emit("joinroom-req", res.roomid);
      alertShow("Success to create room.");
    } else {
      alertShow("Failed to create room.");
    }
  };

  this.showModal = function () {
    $(".rooms_wraper").hide();
    $("#create_room_modal").fadeIn();
  };

  this.hideModal = function () {
    $(".rooms_wraper").fadeIn();
    $("#create_room_modal").hide();
  };

  this.openRoom = function () {
    var amount = $("#bet_amount").val();
    var isPrivate = document.getElementById("permission").checked;

    if (amount < 10) {
      s_oRoomList.amountError();
      return;
    }
    socket.emit("createroom-req", {
      amount,
      isPrivate,
    });
  };

  this.amountError = function () {
    $("#bet_amount").css("border-color", "red");
    $("#bet_amount").focus();
  };

  this.resizeDOMElement = function () {
    var scalW =
      s_oStage.canvas.offsetWidth / document.documentElement.clientWidth;
    var scalH =
      s_oStage.canvas.offsetHeight / document.documentElement.clientHeight;
    scal = scalW < 1 ? scalW : scalH < 1 ? scalH : 1;
    _domElement.scaleX = scal;
    _domElement.scaleY = scal;
    var rooms_wraper = document.querySelector(".content-wraper");

    rooms_wraper.style.width = s_oStage.canvas.offsetWidth * 0.8 + "px";
    rooms_wraper.style.height = s_oStage.canvas.offsetHeight * 0.6 + "px";
  };

  this._onCreateRoom = function () {};

  this._onMouseDownButExit = function () {
    this._onExit(function () {
      s_oUserProfile.unload();
      s_oMain.gotoMenu();
    });
  };

  this._onExit = function (oCbCompleted) {
    _oFade.on("click", function () {});
    $(_interface).hide();
    $(".rooms_wraper").show();
    $("#create_room_modal").hide();
    socket.removeEventListener("createroom-res", this.onCreateRoom);
    socket.removeEventListener("joinroom-res", this.onJoinRes);

    socket.removeEventListener("add-room", this.addRoom);
    socket.removeEventListener("remove-room", this.removeRoom);
    socket.removeEventListener("setall-room", this.setRoom);

    document
      .getElementById("create_room_btn")
      .removeEventListener("click", this.showModal);
    document
      .getElementById("create-room-ok")
      .removeEventListener("click", this.openRoom);
    document
      .getElementById("create-room-cancel")
      .removeEventListener("click", this.hideModal);

    document
      .getElementById("search_btn")
      .removeEventListener("click", this.searchRoom);
    document
      .getElementById("quick_join_btn")
      .removeEventListener("click", this.quckJoin);

    window.removeEventListener("resize", this.resizeDOMElement);

    _oFade.visible = true;
    createjs.Tween.get(_oFade)
      .to({ alpha: 1 }, 300, createjs.Ease.cubicOut)
      .call(oCbCompleted);
  };

  this.unload = function () {
    _oButExit.unload();
    _oFade.removeAllEventListeners();
    s_oStage.removeAllChildren();
    s_oUserProfile = null;
  };

  this.refreshButtonPos = function () {
    _oButExit.setPosition(
      _pStartPosExit.x - s_iOffsetX,
      s_iOffsetY + _pStartPosExit.y
    );
  };

  this._onChangeLang = function (iLang) {
    refreshLanguage();
  };

  this._onAudioToggle = function () {};

  this.resetFullscreenBut = function () {};

  this._onFullscreenRelease = function () {
    if (s_bFullscreen) {
      _fCancelFullScreen.call(window.document);
    } else {
      _fRequestFullScreen.call(window.document.documentElement);
    }

    sizeHandler();
  };

  s_oUserProfile = this;

  this._init();
}

var s_oUserProfile = null;
