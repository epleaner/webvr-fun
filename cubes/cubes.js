import SceneHelper from '../src/scene_helper';

const randomInRange = (min = 0, max = 0) => Math.random() * (max - min) + min;

const drawShapes = (scene) => {
  const material = new THREE.MeshNormalMaterial({
    wireframe: true,
    wireframeLinewidth: 10,
    morphTargets: true
  });

  // const boxGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  // const sphereGeometry = new THREE.SphereGeometry( 1, 32, 32 );

  const geometry = new THREE.BoxGeometry(1, 1, 1);

  const count = 50;
  const range = 100;

  for(let i = 1; i < count; i++) {
    let shape = new THREE.Mesh(geometry, material);

    shape.position.set(randomInRange(-range, range), randomInRange(-range, range) , randomInRange(-range, range));
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
