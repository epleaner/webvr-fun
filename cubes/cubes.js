// Last time the scene was rendered.
let lastRenderTime = 0;
// Currently active VRDisplay.
let vrDisplay;
// How big of a box to render.
let boxSize = 5;
// Various global THREE.Objects.
let scene;
let shapes = [];
let controls;
let effect;
let camera;
// EnterVRButton for rendering enter/exit UI.
let vrButton;
let renderer;

function onTextureLoaded(texture) {
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
  scene.add(skybox);
}


function onResize(e) {
  effect.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

// Get the HMD, and if we're dealing with something that specifies
// stageParameters, rearrange the scene.
function initStage() {
  navigator.getVRDisplays().then(function (displays) {
    if (displays.length > 0) {
      vrDisplay = displays[0];
      if (vrDisplay.stageParameters) {
        setStageDimensions(vrDisplay.stageParameters);
      }
      vrDisplay.requestAnimationFrame(animate);
    }
  });
}

function setStageDimensions(stage) {
  // Make the skybox fit the stage.
  let material = skybox.material;
  scene.remove(skybox);

  // Size the skybox according to the size of the actual stage.
  let geometry = new THREE.BoxGeometry(stage.sizeX, boxSize, stage.sizeZ);
  skybox = new THREE.Mesh(geometry, material);

  // Place it on the floor.
  skybox.position.y = boxSize / 2;
  scene.add(skybox);

  // Place the shape in the middle of the scene, at user height.
  shape.position.set(0, controls.userHeight, 0);
}

const onKeyDown = (event) => {
  const distance = 0.1;
  switch (event.keyCode) {
    case 83: // up
      camera.position.z += distance;
      break;
    case 87: // down
      camera.position.z -= distance;
      break;
  }
};

const initRenderer = () => {
  // Setup three.js WebGL renderer. Note: Antialiasing is a big performance hit.
  // Only enable it if you actually need to.
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio);

  // Append the canvas element created by the renderer to document body element.
  document.body.appendChild(renderer.domElement);

  // Apply VR stereo rendering to renderer.
  effect = new THREE.VREffect(renderer);
  effect.setSize(window.innerWidth, window.innerHeight);
};

const initCamera = () => {
  // Create a three.js camera.
  let aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000);

  controls = new THREE.VRControls(camera);
  controls.standing = true;

  camera.position.y = controls.userHeight;
};

const initWindowEvents = () => {
  window.addEventListener('resize', onResize, true);
  window.addEventListener('vrdisplaypresentchange', onResize, true);

  window.addEventListener('keydown', onKeyDown, false);
};

const initWebVrUi = () => {
  // Initialize the WebVR UI.
  let uiOptions = {
    color: 'black',
    background: 'white',
    corners: 'square'
  };
  vrButton = new webvrui.EnterVRButton(renderer.domElement, uiOptions);
  vrButton.on('exit', function () {
    camera.quaternion.set(0, 0, 0, 1);
    camera.position.set(0, controls.userHeight, 0);
  });
  vrButton.on('hide', function () {
    document.getElementById('ui').style.display = 'none';
  });
  vrButton.on('show', function () {
    document.getElementById('ui').style.display = 'inherit';
  });
  document.getElementById('vr-button').appendChild(vrButton.domElement);
  document.getElementById('magic-window').addEventListener('click', function () {
    vrButton.requestEnterFullscreen();
  });
};

const initSkyBox = () => {
  // Add a repeating grid as a skybox.
  let loader = new THREE.TextureLoader();
  loader.load('img/box.png', onTextureLoaded);
};

const initScene = () => {
  initRenderer();
  initCamera();
  initWindowEvents();
  initWebVrUi();
  // initSkyBox();
  initStage();

  // Create a three.js scene.
  scene = new THREE.Scene();
};

function animateShapes(timestamp) {
  const dampen = 0.006;
  let delta = Math.min(timestamp - lastRenderTime, 500) * dampen;

  lastRenderTime = timestamp;

  shapes.forEach(shape => shape.animate(delta));
}

// Request animation frame loop function
function animate(timestamp) {
  // Apply animations to shape mesh
  animateShapes(timestamp);

  controls.update();

  // Only update controls if we're presenting.
  // if (vrButton.isPresenting()) {
  //   controls.update();
  // }

  // Render the scene.
  effect.render(scene, camera);

  vrDisplay.requestAnimationFrame(animate);
}

const randomInRange = (min = 0, max = 0) => Math.random() * (max - min) + min;

const drawShapes = () => {
  let material = new THREE.MeshNormalMaterial({
    wireframe: true,
    wireframeLinewidth: 10,
    morphTargets: true
  });

  // let boxGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  // let sphereGeometry = new THREE.SphereGeometry( 1, 32, 32 );

  let geometry = new THREE.BoxGeometry(1, 1, 1);

  for(let i = 1; i < 50; i++) {
    let shape = new THREE.Mesh(geometry, material);
    const max = 50;
    const min = -50;

    shape.position.set(randomInRange(-50, 50), randomInRange(-50, 50) , randomInRange(-50, 50));

    shape.rotationSpeed = {
      x: randomInRange(-1, 1),
      y: randomInRange(-1, 1),
      z: randomInRange(-1, 1)
    }

    shape.animate = (delta) => {
      // move towards viewer
      shape.translateOnAxis(shape.worldToLocal(new THREE.Vector3(0, controls.userHeight, 0)), 0.01);

      shape.rotation.x += delta * shape.rotationSpeed.x;
      shape.rotation.y += delta * shape.rotationSpeed.y;
      shape.rotation.z += delta * shape.rotationSpeed.z;
    };

    shapes.push(shape);
    scene.add(shape);
  }
};

let onLoad = () => {
  initScene();

  drawShapes();
};

window.addEventListener('load', onLoad);
