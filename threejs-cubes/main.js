import * as THREE from 'three';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

// Cube group
const cubeGroup = new THREE.Group();
scene.add(cubeGroup);

// Create 3x3x3 cubes
const cubes = [];
const spacing = 1.5;

for (let x = -1; x <= 1; x++) {
  for (let y = -1; y <= 1; y++) {
    for (let z = -1; z <= 1; z++) {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ color: 0x00aaff });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(x * spacing, y * spacing, z * spacing);
      cube.userData.baseScale = 1;
      cubes.push(cube);
      cubeGroup.add(cube);
    }
  }
}

// Animation loop
function animate(time) {
  requestAnimationFrame(animate);
  const t = time * 0.001;

  // Animate each cube scale
  cubes.forEach((cube, i) => {
    const offset = i * 0.1;
    const scale = 0.6 + Math.abs(Math.sin(t + offset)) * 0.4;
    cube.scale.set(scale, scale, scale);
  });

  cubeGroup.rotation.x += 0.002;
  cubeGroup.rotation.y += 0.003;

  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
