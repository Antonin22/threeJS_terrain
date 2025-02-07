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

        // Création du groupe du joueur
        this.playerGroup = new Group();
        scene.add(this.playerGroup);

        // Charger le modèle du joueur avec son animation
        this.loadModel();

        // Création d'une lumière pour le joueur (par exemple, une torche)
        this.spotLight = new SpotLight(0xffee88, 1, 100, Math.PI / 8, 0.5);
        this.spotLight.position.set(0.3, 1.2, 1);
        this.spotLight.target.position.set(0, 1.2, -1);
        this.playerGroup.add(this.spotLight);
        this.playerGroup.add(this.spotLight.target);

        // Définir un offset de caméra (position relative par rapport au joueur)
        // Par défaut, la caméra est placée 5 unités au-dessus et 10 unités derrière le joueur.
        this.cameraOffset = options.cameraOffset || new Vector3(0, 5, -10);

        // Attacher la caméra au groupe du joueur afin qu'elle suive ses mouvements.
        this.playerGroup.add(this.camera);
        this.camera.position.copy(this.cameraOffset);

        // Propriété pour stocker le mixer d'animation du modèle
        this.playerMixer = null;

        this.playerGroup.rotation.y = Math.PI / 2;
        this.playerGroup.position.y = 0;
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
                    console.log('le perso doit s animer')
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
    * Ici, seule l'animation est mise à jour, puisque le personnage reste fixe (le cylindre tourne autour de lui).
    *
    * @param {number} delta - Temps écoulé (en secondes) depuis la dernière frame.
    */
    update(delta) {
        if (this.playerMixer) {
            this.playerMixer.update(delta);
        }

    }
}
