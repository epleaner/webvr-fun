/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _scene_helper = __webpack_require__(1);

var _scene_helper2 = _interopRequireDefault(_scene_helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var randomInRange = function randomInRange() {
  var min = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return Math.random() * (max - min) + min;
};

var drawShapes = function drawShapes(scene) {
  var material = new THREE.MeshNormalMaterial({
    wireframe: true,
    wireframeLinewidth: 10,
    morphTargets: true
  });

  // let boxGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  // let sphereGeometry = new THREE.SphereGeometry( 1, 32, 32 );

  var geometry = new THREE.BoxGeometry(1, 1, 1);

  for (var i = 1; i < 50; i++) {
    var shape = new THREE.Mesh(geometry, material);
    var max = 50;
    var min = -50;

    shape.position.set(randomInRange(-50, 50), randomInRange(-50, 50), randomInRange(-50, 50));
    shape.rotationSpeed = {
      x: randomInRange(-1, 1),
      y: randomInRange(-1, 1),
      z: randomInRange(-1, 1)
    };

    scene.shapes.push(shape);
    scene.add(shape);
  }
};

var onLoad = function onLoad() {
  var scene = new _scene_helper2.default().init();

  drawShapes(scene);
};

window.addEventListener('load', onLoad);

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
class SceneHelper {
  constructor() {
    // Last time the scene was rendered.
    this.lastRenderTime = 0;

    // How big of a box to render.
    this.boxSize = 5;
  }

  init() {
    this.initRenderer();
    this.initCamera();
    this.initWindowEvents();
    this.initWebVrUi();
    // initSkyBox();
    this.initStage();

    // Create a three.js scene.
    this.scene = new THREE.Scene();
    this.scene.shapes = [];

    return this.scene;
  }

  initRenderer() {
    // Setup three.js WebGL renderer. Note: Antialiasing is a big performance hit.
    // Only enable it if you actually need to.
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Append the canvas element created by the renderer to document body element.
    document.body.appendChild(this.renderer.domElement);

    // Apply VR stereo rendering to renderer.
    this.effect = new THREE.VREffect(this.renderer);
    this.effect.setSize(window.innerWidth, window.innerHeight);
  }

  initCamera() {
    const aspect = window.innerWidth / window.innerHeight;

    // Create a three.js camera.
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000);

    // Create three.js VR controls.
    this.controls = new THREE.VRControls(this.camera);
    this.controls.standing = true;

    this.camera.position.y = this.controls.userHeight;
  }

  initWindowEvents() {
    window.addEventListener('resize', e => this.onResize(e), true);
    window.addEventListener('vrdisplaypresentchange', e => this.onResize(e), true);
    window.addEventListener('keydown', e => this.onKeyDown(e), true);
  }

  onResize(e) {
    this.effect.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  initWebVrUi() {
    // Initialize the WebVR UI.
    const uiOptions = {
      color: 'black',
      background: 'white',
      corners: 'square'
    };

    this.vrButton = new webvrui.EnterVRButton(this.renderer.domElement, uiOptions);

    this.vrButton.on('exit', function () {
      this.camera.quaternion.set(0, 0, 0, 1);
      this.camera.position.set(0, this.controls.userHeight, 0);
    });
    this.vrButton.on('hide', function () {
      document.getElementById('ui').style.display = 'none';
    });
    this.vrButton.on('show', function () {
      document.getElementById('ui').style.display = 'inherit';
    });

    document.getElementById('vr-button').appendChild(this.vrButton.domElement);
    document.getElementById('magic-window').addEventListener('click', () => {
      this.vrButton.requestEnterFullscreen();
    });
  }

  initSkyBox() {
    // Add a repeating grid as a skybox.
    const loader = new THREE.TextureLoader();
    loader.load('img/box.png', onTextureLoaded);
  }

  onTextureLoaded(texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(boxSize, boxSize);

    let geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    let material = new THREE.MeshBasicMaterial({
      map: texture,
      color: 0x01BE00,
      side: THREE.BackSide
    });

    // Align the skybox to the floor (which is at y=0).
    skybox = new THREE.Mesh(geometry, material);
    skybox.position.y = boxSize / 2;
    this.scene.add(skybox);
  }

  // Get the HMD, and if we're dealing with something that specifies
  // stageParameters, rearrange the scene.
  initStage() {
    navigator.getVRDisplays().then(displays => {
      if (displays.length > 0) {
        this.vrDisplay = displays[0];
        if (this.vrDisplay.stageParameters) {
          setStageDimensions(this.vrDisplay.stageParameters);
        }
        this.vrDisplay.requestAnimationFrame(() => this.animate());
      }
    });
  }

  animateShapes(timestamp) {
    const dampen = 0.006;
    let delta = Math.min(timestamp - this.lastRenderTime, 500) * dampen;

    this.lastRenderTime = timestamp;

    this.scene.shapes.forEach(shape => {
      // move towards viewer
      shape.translateOnAxis(shape.worldToLocal(new THREE.Vector3(0, this.controls.userHeight, 0)), 0.01);

      shape.rotation.x += delta * shape.rotationSpeed.x;
      shape.rotation.y += delta * shape.rotationSpeed.y;
      shape.rotation.z += delta * shape.rotationSpeed.z;
    });
  }

  // Request animation frame loop function
  animate(timestamp) {
    // Apply animations to shape mesh
    this.animateShapes(timestamp);

    this.controls.update();

    // Only update controls if we're presenting.
    // if (this.vrButton.isPresenting()) {
    //   controls.update();
    // }

    // Render the scene.
    this.effect.render(this.scene, this.camera);

    this.vrDisplay.requestAnimationFrame(() => this.animate());
  }

  setStageDimensions(stage) {
    // Make the skybox fit the stage.
    let material = skybox.material;
    this.scene.remove(skybox);

    // Size the skybox according to the size of the actual stage.
    let geometry = new THREE.BoxGeometry(stage.sizeX, boxSize, stage.sizeZ);
    skybox = new THREE.Mesh(geometry, material);

    // Place it on the floor.
    skybox.position.y = boxSize / 2;
    this.scene.add(skybox);
  }

  onKeyDown(event) {
    const distance = 0.1;
    switch (event.keyCode) {
      case 83:
        // up
        this.camera.position.z += distance;
        break;
      case 87:
        // down
        this.camera.position.z -= distance;
        break;
    }
  }
}
/* harmony export (immutable) */ __webpack_exports__["default"] = SceneHelper;


/***/ })
/******/ ]);