var s_iScaleFactor = 1;
var s_bIsIphone = false;
var s_iOffsetX;
var s_iOffsetY;
var s_bFocus = true;

function trace(szMsg) {
  console.log(szMsg);
}

module.exports.randomFloatBetween = function (
  minValue,
  maxValue,
  precision = 2
) {
  return parseFloat(
    Math.min(
      minValue + Math.random() * (maxValue - minValue),
      maxValue
    ).toFixed(precision)
  );
};

this.tweenValue = function (fStart, fEnd, fLerp) {
  return fStart + fLerp * (fEnd - fStart);
};

function ctlArcadeResume() {
  if (s_oMain !== null) {
    s_oMain.startUpdate();
  }
}

function ctlArcadePause() {
  if (s_oMain !== null) {
    s_oMain.stopUpdate();
  }
}

function getParamValue(paramName) {
  var url = window.location.search.substring(1);
  var qArray = url.split("&");
  for (var i = 0; i < qArray.length; i++) {
    var pArr = qArray[i].split("=");
    if (pArr[0] == paramName) return pArr[1];
  }
}

function playSound(szSound, iVolume, bLoop) {
  if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
    s_aSounds[szSound].play();
    s_aSounds[szSound].volume(iVolume);

    s_aSounds[szSound].loop(bLoop);

    return s_aSounds[szSound];
  }
  return null;
}

function stopSound(szSound) {
  if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
    s_aSounds[szSound].stop();
  }
}

function setVolume(szSound, iVolume) {
  if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
    s_aSounds[szSound].volume(iVolume);
  }
}

function setMute(szSound, bMute) {
  if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
    s_aSounds[szSound].mute(bMute);
  }
}

function tweenVolume(
  szSound,
  iVolume,
  iTime,
  oEase = createjs.Ease.linear,
  cbCompleted,
  cbScope
) {
  if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
    var oValTween = { from: s_aSounds[szSound].volume(), to: iVolume };

    createjs.Tween.get(oValTween, { override: true })
      .to({ from: oValTween.to }, iTime, oEase)
      .on("change", function () {
        s_aSounds[szSound].volume(oValTween.from);
      })
      .call(function (evt) {
        evt.target.removeAllEventListeners();
        if (cbCompleted !== undefined) {
          cbCompleted.call(cbScope);
        }
      });
  }
}

function isSoundPlaying(szSound) {
  return s_aSounds[szSound].playing();
}

function radiantsToDegrees(fRad) {
  return fRad * (180 / Math.PI);
}

function degreesToRadiants(fAngle) {
  return fAngle * (Math.PI / 180);
}

function saveItem(szItem, oValue) {
  if (s_bStorageAvailable) {
    localStorage.setItem(szItem, oValue);
  }
}

function getItem(szItem) {
  if (s_bStorageAvailable) {
    return localStorage.getItem(szItem);
  }
  return null;
}

module.exports.sortByKey=function(array, key) {
  return array.sort(function (a, b) {
    var x = a[key];
    var y = b[key];
    return x < y ? -1 : x > y ? 1 : 0;
  });
}

module.exports.linearFunction = function (x, x1, x2, y1, y2) {
  return ((x - x1) * (y2 - y1)) / (x2 - x1) + y1;
};

function fullscreenHandler() {
  if (!ENABLE_FULLSCREEN || screenfull.isEnabled === false) {
    return;
  }

  s_bFullscreen = screenfull.isFullscreen;

  if (s_oInterface !== null) {
    s_oInterface.resetFullscreenBut();
  }

  if (s_oMenu !== null) {
    s_oMenu.resetFullscreenBut();
  }

  if (s_oDifficultyMenu !== null) {
    s_oDifficultyMenu.resetFullscreenBut();
  }
}
