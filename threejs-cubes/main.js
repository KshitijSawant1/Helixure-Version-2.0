import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

// Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(5, 5, 10);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Floor
const floorGeo = new THREE.PlaneGeometry(50, 50);
const floorMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

// Cube geometries + materials
const cubeGeo = new THREE.BoxGeometry(2, 2, 2);
const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
const topMat = new THREE.MeshStandardMaterial({ color: 0xc1ff00 }); // yellow-green

// Bottom cube
const cube1 = new THREE.Mesh(cubeGeo, whiteMat);
cube1.position.y = 1;
cube1.castShadow = true;

// Middle cube
const cube2 = new THREE.Mesh(cubeGeo, whiteMat);
cube2.position.y = 3;
cube2.rotation.y = Math.PI / 12;
cube2.castShadow = true;

// Top cube
const cube3 = new THREE.Mesh(cubeGeo, topMat);
cube3.position.y = 5;
cube3.rotation.y = Math.PI / 8;
cube3.castShadow = true;

// Add to scene
scene.add(cube1, cube2, cube3);

// Animate
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Handle resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
