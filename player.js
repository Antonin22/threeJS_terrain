"use strict";

import {
  Group,
  Mesh,
  BoxGeometry,
  MeshStandardMaterial,
  SpotLight,
  Vector3,
  AnimationMixer
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default class Player {
  /**
   * Constructeur du joueur.
   * @param {Scene} scene - La scène dans laquelle le joueur sera ajouté.
   * @param {Camera} camera - La caméra qui sera attachée au joueur.
   * @param {Terrain} terrain - L'instance du terrain (cylindrique) pour adapter la position.
   * @param {Object} options - Paramètres optionnels (vitesse, offset de caméra, etc.).
   */
  constructor(scene, camera, terrain, options = {}) {
    this.scene = scene;
    this.camera = camera;
    this.terrain = terrain;
    this.speed = options.speed || 2.0; // Vitesse de déplacement (unités par seconde)
    this.theta = 0; // Angle initial pour le déplacement sur le cylindre

    // Variables pour le contrôle clavier (déplacement sur l'axe z)
    this.moveLeft = false;
    this.moveRight = false;
    this._initKeyboardListeners();

    // Créer le groupe du joueur et l'ajouter à la scène
    this.playerGroup = new Group();
    scene.add(this.playerGroup);

    // Définir l'offset de la caméra (par défaut 5 unités au-dessus et 10 unités derrière)
    this.cameraOffset = options.cameraOffset || new Vector3(0, 5, -10);

    // Attacher la caméra au groupe du joueur afin qu'elle suive ses mouvements
    this.playerGroup.add(this.camera);
    this.camera.position.copy(this.cameraOffset);

    // Charger le modèle du joueur avec son animation
    this.loadModel();

    // Création d'une lumière pour le joueur (par exemple, une torche)
    this.spotLight = new SpotLight(0xffee88, 1, 100, Math.PI / 8, 0.5);
    this.spotLight.position.set(0.3, 1.2, 1);
    this.spotLight.target.position.set(0, 1.2, -1);
    this.playerGroup.add(this.spotLight);
    this.playerGroup.add(this.spotLight.target);

    // Propriété pour stocker le mixer d'animation du modèle
    this.playerMixer = null;

    // Orientation et position initiale
    this.playerGroup.rotation.y = Math.PI / 2;
    this.playerGroup.position.y = 0;
  }

  /**
   * Initialise les écouteurs clavier pour gérer les déplacements sur l'axe z.
   */
  _initKeyboardListeners() {
    document.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      if (key === 'q') this.moveLeft = true;
      if (key === 'd') this.moveRight = true;
    });

    document.addEventListener('keyup', (event) => {
      const key = event.key.toLowerCase();
      if (key === 'q') this.moveLeft = false;
      if (key === 'd') this.moveRight = false;
    });
  }

  /**
   * Charge le modèle du joueur au format GLTF.
   * En cas d'erreur, un simple cube est créé en fallback.
   */
  loadModel() {
    const loader = new GLTFLoader();
    loader.load(
      'Xbot.glb',
      (gltf) => {
        // Utiliser la scène chargée comme modèle du joueur
        const object = gltf.scene;

        // Création de l'AnimationMixer pour le modèle
        this.playerMixer = new AnimationMixer(object);

        // Si le modèle possède au moins 7 animations, jouer celle d'index 6
        if (gltf.animations && gltf.animations.length > 6) {
          const action = this.playerMixer.clipAction(gltf.animations[6]);
          action.play();
          console.log('Le personnage s\'anime');
        }

        // Ajouter le modèle animé au groupe du joueur
        this.playerGroup.add(object);
      },
      undefined,
      (error) => {
        console.error("Erreur de chargement du modèle du joueur :", error);
        // Fallback : création d'une boîte pour représenter le joueur
        const geometry = new BoxGeometry(1, 2, 1);
        const material = new MeshStandardMaterial({ color: 0x00ff00 });
        const fallbackMesh = new Mesh(geometry, material);
        this.playerGroup.add(fallbackMesh);
      }
    );
  }

  /**
   * Mise à jour appelée à chaque frame.
   * Ici, l'animation est mise à jour et le joueur se déplace sur l'axe z selon les entrées clavier.
   *
   * @param {number} delta - Temps écoulé (en secondes) depuis la dernière frame.
   */
  update(delta) {
    if (this.playerMixer) {
      this.playerMixer.update(delta);
    }

    // Déplacer le joueur sur l'axe z en fonction des touches pressées
    if (this.moveLeft) {
      this.playerGroup.position.z -= this.speed * delta * 0.3;
    }
    if (this.moveRight) {
      this.playerGroup.position.z += this.speed * delta * 0.3;
    }
  }
}
