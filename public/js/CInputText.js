// const { CANVAS_HEIGHT, CANVAS_WIDTH } = require("../../controllers/setting");

function CInputText(pStartPos, color, fontSize, align, oParentContainer) {
  var _oParentContainer;
  var _oContainer;
  var _oText;
  var _oOutlineText;
  var _pStartPos;
  var _oTween;
  var inputField;
  var iWidth = 400;
  var iHeight = 60;
  this._init = function (pStartPos, oParentContainer) {
    _oParentContainer =
      oParentContainer !== undefined ? oParentContainer : s_oStage;

    _oContainer = new createjs.Container();
    _oContainer.visible = false;
    _oParentContainer.addChild(_oContainer);

    inputField = document.createElement("input");
    inputField.type = "text";

    document.body.appendChild(inputField);

    var domElement = new createjs.DOMElement(inputField);

    // domElement.htmlElement.style.fontSize = `${fontSize}px`;

    inputField.addEventListener("change", this.handleChange);

    _oContainer.addChild(domElement);

    _pStartPos = pStartPos;

    _oTween = null;
    this.startAnimation();
  };

  this.handleKeyDown = function (event) {
    if (event.keyCode === 13) {
      // Enter key pressed, do something
    }
  };

  this.handleChange = function (e) {};

  this.getText = function () {
    return inputField.value;
  };

  this.setText = function (szText) {
    inputField.value = szText;
  };

  this.startAnimation = function (oCbCompleted = null, oCbScope) {
    if (_oTween !== null) {
      return;
    }
    _oContainer.x = _pStartPos.x;
    _oContainer.y = _pStartPos.y;

    _oContainer.visible = true;

    createjs.Tween.get(_oContainer).to(
      { alpha: 1 },
      1500,
      createjs.Ease.quadIn
    );
  };

  this.unload = function () {
    _oParentContainer.removeChild(_oContainer);
    document.body.removeChild(inputField);
  };

  this._init(pStartPos, oParentContainer);
}
