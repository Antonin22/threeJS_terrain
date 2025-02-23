"use strict";

// --- Importations de Three.js ---
import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  AmbientLight,
  Clock,
  SpotLight,
  DirectionalLight,
  SpotLightHelper,
  Vector3,
  Raycaster,
  ArrowHelper,
  Fog,
  FogExp2,
  AudioListener
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Terrain from './terrain.js';
import Player from './player.js';
import TreePlacer from './model.js';
import TreeCollector from './collector.js';

const scene = new Scene();
const aspect = window.innerWidth / window.innerHeight;
const camera = new PerspectiveCamera(75, aspect, 0.1, 5000);
scene.fog = new FogExp2(0x000000, 0.015);
const listener = new AudioListener();
camera.add(listener);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Éclairage ---
const ambientLight = new AmbientLight(0xFFFFFF, 0.3);
scene.add(ambientLight);

const spotLight = new SpotLight(0xdddddd, 500, 1500); 
spotLight.position.set(0, 10, 0); 
spotLight.target.position.set(0, 0, 0);
scene.add(spotLight.target);
spotLight.castShadow = true;
scene.add(spotLight);

const directionalLight = new DirectionalLight(0xddddff, 0.5);
directionalLight.position.set(0, 10, 100);
directionalLight.target.position.set(0, 0, 0);
scene.add(directionalLight);
scene.add(directionalLight.target);



//const spotLightHelper = new SpotLightHelper(spotLight);
//scene.add(spotLightHelper);

// --- Contrôles ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window);

const terrainOptions = {
  radius: 600,
  height: 800,
  radialSegments: 140,
  heightSegments: 110,
  amplitude: 5,
  frequency: 0.01
};
const terrain = new Terrain(scene, terrainOptions);

const playerOptions = {
  speed: 10,
  cameraOffset: new Vector3(0, 2, -4)
};
const player = new Player(scene, camera, terrain, playerOptions);
const raycaster = new Raycaster();

const modelUrls = [
  './assets/just_tree.glb',
  './assets/just_tree.glb',
  './assets/just_tree.glb',
  './assets/low_poly_tree.glb',
  './assets/stylized_pine_tree_tree.glb',
  './assets/tree_golem.glb',
  './assets/tree_golem.glb',
  './assets/tree_golem.glb'

];
const treePlacer = new TreePlacer(scene, terrain, modelUrls, {
  refRadius: terrain.radius * 0.8,
  segments: 40
});

const treeCollector = new TreeCollector(player, treePlacer, listener);

// Visu du raycast du player
//const arrowHelper = new ArrowHelper(new Vector3(0, -1, 0), new Vector3(), 100, 0xffff00);
//scene.add(arrowHelper);

const clock = new Clock();

function animate() {
  const delta = clock.getDelta();

  terrain.update(delta);
  player.update(delta);

  const playerPos = player.playerGroup.position.clone();
  const rayOrigin = playerPos.clone().add(new Vector3(0, 10, 0)); 
  const rayDirection = new Vector3(0, -1, 0);
  raycaster.set(rayOrigin, rayDirection);
  const intersects = raycaster.intersectObject(terrain.mesh);
  if (intersects.length > 0) {
    const intersectionPoint = intersects[0].point;
    player.playerGroup.position.y = intersectionPoint.y;
  }
  
  // Visu du raycast du player
  //arrowHelper.position.copy(rayOrigin);
  //arrowHelper.setDirection(rayDirection);

  treePlacer.trees.forEach(tree => {
    const worldPos = new Vector3();
    tree.getWorldPosition(worldPos);
    //console.log("Position de l'arbre:", worldPos);
  });

  // Mettre à jour les arbres pour qu'ils restent alignés sur le terrain
  treePlacer.update(delta);

  treeCollector.checkCollisions();
  if (treeCollector.checkCollisions()) {
    console.log("intersectioon avec un arbre")
  }

  // caméra attachée au playerGroup, elle suit le joueur
  camera.lookAt(player.playerGroup.position);

  //controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
