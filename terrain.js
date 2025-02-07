"use strict";

import { Mesh, CylinderGeometry, MeshPhongMaterial, Matrix4, Vector3 } from 'three';
// IMPORTANT : Assurez-vous que BufferGeometryUtils est disponible dans votre projet.

import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';


export default class Terrain {
    /**
     * Crée un terrain sous forme de cylindre tournant avec des variations topographiques (bosses) sans trous.
     *
     * @param {Scene} scene - La scène Three.js à laquelle ajouter le terrain.
     * @param {Object} options - Options de configuration.
     *        options.radius         -> Rayon du cylindre (défaut : 600)
     *        options.height         -> Hauteur du cylindre (défaut : 800)
     *        options.radialSegments -> Nombre de segments radiaux (défaut : 40)
     *        options.heightSegments -> Nombre de segments verticaux (défaut : 10)
     *        options.rotationSpeed  -> Vitesse de rotation (défaut : 0.2)
     */
    constructor(scene, options = {}) {
        // Paramètres par défaut
        this.radius = options.radius || 600;
        this.height = options.height || 800;
        this.radialSegments = options.radialSegments || 40;
        this.heightSegments = options.heightSegments || 10;
        this.rotationSpeed = options.rotationSpeed || 0.01;

        // Création de la géométrie du cylindre (BufferGeometry par défaut)
        let geometry = new CylinderGeometry(
            this.radius,
            this.radius,
            this.height,
            this.radialSegments,
            this.heightSegments,
            true  // openEnded: true (pas de capuchons)
        );

        // Faire pivoter le cylindre pour qu'il soit horizontal (la surface circulaire sera dans le plan x-y)
        geometry.applyMatrix4(new Matrix4().makeRotationX(-Math.PI / 2));

        // Fusionner les sommets pour assurer la continuité (comme mergeVertices dans Geometry)
        geometry = mergeVertices(geometry);

        // Conserver la géométrie dans l'instance
        this.geometry = geometry;

        // Créer un tableau pour stocker les données d'animation pour chaque sommet
        const positionAttribute = this.geometry.getAttribute('position');
        const vertexCount = positionAttribute.count;
        this.waves = [];
        // Conserver les positions initiales pour chaque sommet
        this.originalPositions = [];
        for (let i = 0; i < vertexCount; i++) {
            const x = positionAttribute.getX(i);
            const y = positionAttribute.getY(i);
            const z = positionAttribute.getZ(i);
            this.originalPositions.push(new Vector3(x, y, z));
            this.waves.push({
                // Un angle initial aléatoire
                ang: Math.random() * Math.PI * 2,
                // Une amplitude aléatoire entre 5 et 20
                amp: 3 + Math.random() * 0.0001,
                // Une vitesse aléatoire (en radians par frame)
                speed: 0.001 + Math.random() * 0.0032
            });
        }

        // Création du matériau
        this.material = new MeshPhongMaterial({
            color: 0x1ff11f,
            transparent: true,
            opacity: 0.6,
            flatShading: true,
            wireframe: false
        });

        // Création du mesh et activation de la réception des ombres
        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.receiveShadow = true;
        // Positionner le cylindre (par exemple, légèrement vers le bas)
        this.mesh.position.y = -600;
        scene.add(this.mesh);
    }

    /**
     * Met à jour la topographie du cylindre pour simuler des bosses (vagues) sur la surface.
     *
     * @param {number} delta - Temps écoulé (en secondes) depuis la dernière mise à jour.
     */
    update(delta) {
        const positionAttribute = this.geometry.getAttribute('position');
        const vertexCount = positionAttribute.count;
        for (let i = 0; i < vertexCount; i++) {
            const orig = this.originalPositions[i];
            const wave = this.waves[i];
            // Calculer la nouvelle position en décalant le sommet par une rotation circulaire autour de sa position initiale.
            const newX = orig.x + Math.cos(wave.ang) * wave.amp;
            const newY = orig.y + Math.sin(wave.ang) * wave.amp;
            // On ne modifie pas z pour maintenir la continuité du maillage.
            positionAttribute.setXYZ(i, newX, newY, orig.z);
            // Incrémenter l'angle pour la prochaine frame.
            wave.ang += wave.speed;
        }
        // Indiquer à Three.js que l'attribut de position a été mis à jour.
        positionAttribute.needsUpdate = true;

        // Faire tourner le cylindre autour de l'axe z (comme une roue)
        this.mesh.rotation.z += delta * this.rotationSpeed;
    }

    /**
     * Renvoie la hauteur (coordonnée y) du terrain à une position donnée (x, z).
     * Ici, on retourne simplement la position y du mesh.
     *
     * @param {number} x - Position x dans le monde.
     * @param {number} z - Position z dans le monde.
     * @returns {number} - La hauteur y du terrain.
     */
    getTerrainHeight(x, z) {
        return this.mesh.position.y;
    }
}
