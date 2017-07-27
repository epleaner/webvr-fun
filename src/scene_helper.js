export default class SceneHelper {
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
    this.controls.standing = false;

    this.camera.position.y = 0;
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

    this.vrButton.on('exit', function() {
      this.camera.quaternion.set(0, 0, 0, 1);
      this.camera.position.set(0, 0, 0);
    });
    this.vrButton.on('hide', function() {
      document.getElementById('ui').style.display = 'none';
    });
    this.vrButton.on('show', function() {
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
    navigator.getVRDisplays().then((displays) => {
      if (displays.length > 0) {
        this.vrDisplay = displays[0];
        if (this.vrDisplay.stageParameters) {
          setStageDimensions(this.vrDisplay.stageParameters);
        }
        this.vrDisplay.requestAnimationFrame((timestamp) => this.animate(timestamp));
      }
    });
  }

  animateShapes(timestamp) {
    const dampen = 0.006;
    let delta = Math.min(timestamp - this.lastRenderTime, 500) * dampen;

    this.lastRenderTime = timestamp;

    this.scene.shapes.forEach(shape => shape.animate(delta));
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

    this.vrDisplay.requestAnimationFrame((timestamp) => this.animate(timestamp));
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
      case 83: // up
        this.camera.position.z += distance;
        break;
      case 87: // down
        this.camera.position.z -= distance;
        break;
    }
  }
}
