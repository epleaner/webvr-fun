import SceneHelper from '../src/scene_helper';

const randomInRange = (min = 0, max = 0) => Math.random() * (max - min) + min;

const drawShapes = (scene) => {
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

    scene.shapes.push(shape);
    scene.add(shape);
  }
};

let onLoad = () => {
  const scene = new SceneHelper().init();

  drawShapes(scene);
};

window.addEventListener('load', onLoad);
