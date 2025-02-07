"use strict";

// --- Importations de Three.js ---
import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  AmbientLight,
  Clock,
  SpotLight,
  SpotLightHelper,
  Vector3
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Terrain from './terrain.js';
import Player from './player.js';

const scene = new Scene();
const aspect = window.innerWidth / window.innerHeight;
const camera = new PerspectiveCamera(75, aspect, 0.1, 5000);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Éclairage ---
const ambientLight = new AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const spotLight = new SpotLight(0xdddddd, 500, 1000);
spotLight.position.set(1, 0, 4);
spotLight.castShadow = true;
scene.add(spotLight);

const spotLightHelper = new SpotLightHelper(spotLight);
scene.add(spotLightHelper);

// --- Contrôles ---
// OrbitControls est conservé ici pour faciliter le débogage ou l'observation de la scène,
// mais la caméra reste attachée au joueur pour la vue à la 3ème personne.
const controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window);

// --- Initialisation des modules ---

// Création d'un terrain cylindrique animé (inspiré de l'exemple Codrops)
const terrainOptions = {
  radius: 600,          // Rayon du cylindre
  height: 800,          // Hauteur du cylindre
  radialSegments: 140,   // Nombre de segments radiaux
  heightSegments: 110,   // Nombre de segments verticaux
  amplitude: 10,        // Amplitude de la déformation (animation)
  frequency: 0.01        // Fréquence de la déformation
};
const terrain = new Terrain(scene, terrainOptions);

// Création du joueur.
// Ici, la caméra sera placée derrière et légèrement au-dessus du personnage.
// La position et l'orientation du joueur ne sont pas gérées ici puisque c'est le cylindre qui tourne,
// le joueur restant fixe (seule l'animation est mise à jour).
const playerOptions = {
  speed: 10,  // Vitesse utilisée pour l'animation (non utilisée pour déplacer le joueur)
  cameraOffset: new Vector3(0, 2, -4)  // La caméra sera positionnée 3 unités au-dessus et 10 unités derrière le joueur.
};
const player = new Player(scene, camera, terrain, playerOptions);

// La caméra est désormais attachée dans la classe Player, vous n'avez pas besoin de la repositionner ici.
// (Vous pouvez conserver OrbitControls pour observer la scène en déplaçant manuellement la caméra, si besoin.)

const clock = new Clock();

function animate() {
  const delta = clock.getDelta();

  // Mise à jour du terrain (le cylindre qui tourne)
  terrain.update(delta);

  // Mise à jour du joueur (l'animation du personnage)
  player.update(delta);



  // Mise à jour des contrôles (optionnel)
  controls.update();

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
