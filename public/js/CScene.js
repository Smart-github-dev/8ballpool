var CAMERA_SCENARIO;
function CScene() {
  var _oScene;
  var _oRenderer;

  var _coin_render = false;

  this._init = function () {
    _oScene = new THREE.Scene();

    CAMERA_SCENARIO = new THREE.OrthographicCamera(
      CANVAS_WIDTH / -2,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_HEIGHT / -2,
      1,
      1000
    );
    CAMERA_SCENARIO.position.z = 100;
    CAMERA_SCENARIO.zoom = 1;
    // _oScene.add(CAMERA_SCENARIO);
    CAMERA_SCENARIO.updateProjectionMatrix();

    var oSpotLight = new THREE.SpotLight(0xffffff);
    oSpotLight.position.set(0, 0, 1700);
    oSpotLight.penumbra = 0.1;
    oSpotLight.power = 0.75 * Math.PI;
    _oScene.add(oSpotLight);

    var oAmbientLight = new THREE.AmbientLight(0xffffff, 0.3);
    _oScene.add(oAmbientLight);

    _oRenderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: $("#canvas_3d")[0],
      alpha: true,
      precision: "lowp",
      powerPreference: "low-power",
    });
    //properties for casting shadow
    _oRenderer.shadowMap.enabled = false;
    //oRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    _oRenderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);
    _oRenderer.gammaFactor = 2.2;
  };

  this.create3DBall = function (oTexture, iBallRadius, vPos3D) {
    var geometry = new THREE.SphereGeometry(iBallRadius, 16, 16);
    var material = new THREE.MeshPhongMaterial({
      specular: 0x222222,
      shininess: 80,
      map: oTexture,
    });
    var oBall = new THREE.Mesh(geometry, material);

    oBall.castShadow = true;
    oBall.receiveShadow = true;
    _oScene.add(oBall);
    oBall.position.copy(vPos3D);
    return oBall;
  };

  this.createCoin = function (result, callback) {
    var angularSpeed = 0.2;
    var lastTime = 0;
    var g = 9.8;

    var V0 = 140;

    var t = 0.8;
    const frontMaterial = new THREE.MeshStandardMaterial({
      map: new THREE.TextureLoader().load(
        "http://localhost:2083/img/coin_front_texture.png"
      ),
    });

    const backMaterial = new THREE.MeshStandardMaterial({
      map: new THREE.TextureLoader().load(
        "http://localhost:2083/img/coin_back_texture.png"
      ),
    });

    var camera = new THREE.PerspectiveCamera(
      45,
      CANVAS_WIDTH / CANVAS_HEIGHT,
      1,
      2000
    );
    camera.position.z = 1500;

    var frontMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(100, 100, 5, 50, 50, false),
      frontMaterial
    );

    var backMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(100, 100, 5, 50, 50, false),
      backMaterial
    );

    backMesh.position.y = -5;

    const cylinder = new THREE.Group();

    cylinder.add(frontMesh);
    cylinder.add(backMesh);

    cylinder.rotation.z = 0;
    cylinder.rotation.y = Math.PI / 2;

    cylinder.rotation.x = Math.PI / 2;

    cylinder.scale.set(0.7, 0.7, 0.7);

    cylinder.overdraw = true;

    cylinder.castShadow = true;
    cylinder.receiveShadow = true;

    _oScene.add(cylinder);

    _coin_render = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Optional: add ambient light for overall illumination
    _oScene.add(ambientLight);

    function animate() {
      var time = new Date().getTime();
      var timeDiff = time - lastTime;
      var angleChange = (angularSpeed * timeDiff * 2 * Math.PI) / 100;
      lastTime = time;
      if (cylinder.position.z >= 0) {
        cylinder.rotation.x +=
          cylinder.position.z > 850 ? angleChange * 0.1 : angleChange;
        cylinder.position.z = V0 * t - (g * t * t) / 2;
        t += cylinder.position.z > 850 ? 0.1 : 0.2;
        setTimeout(animate, 30);
      } else {
        cylinder.rotation.x = result ? Math.PI / 2 : -Math.PI / 2;
        cylinder.scale.set(0.65, 0.65, 0.65);

        setTimeout(() => {
          _oScene.remove(cylinder);
          _oScene.remove(ambientLight);
          _coin_render = false;
          callback();
        }, 1000);
      }
      _oRenderer.render(_oScene, camera);
    }
    setTimeout(animate, 1000);
  };

  this.consoleInfoRenderer = function () {
    console.log(_oRenderer.info);
  };

  this.update = function () {
    if (!_coin_render) {
      _oRenderer.render(_oScene, CAMERA_SCENARIO);
    }
  };

  this.unload = function () {
    _oRenderer.clear();
    _oRenderer = null;
    _oScene = null;
  };

  this._init();
  s_oScenario = this;
}

var s_oScenario;
