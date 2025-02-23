"use strict";
import { Mesh, CylinderGeometry, MeshPhongMaterial, Matrix4, Vector3, TextureLoader, SRGBColorSpace} from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export default class Terrain {
    /**
     * Crée un terrain sous forme de cylindre tournant avec des variations topographiques (bosses) sans trous.
     *
     * @param {Scene} scene - La scène Three.js à laquelle ajouter le terrain.
     * @param {Object} options - Options de configuration.
    
     */
    constructor(scene, options = {}) {
        this.radius = options.radius || 600;
        this.height = options.height || 800;
        this.radialSegments = options.radialSegments || 40;
        this.heightSegments = options.heightSegments || 10;
        this.rotationSpeed = options.rotationSpeed || 0.01;

        let geometry = new CylinderGeometry(
            this.radius,
            this.radius,
            this.height,
            this.radialSegments,
            this.heightSegments,
            true 
        );

        geometry.applyMatrix4(new Matrix4().makeRotationX(-Math.PI / 2));
        geometry = mergeVertices(geometry);
        this.geometry = geometry;

        const positionAttribute = this.geometry.getAttribute('position');
        const vertexCount = positionAttribute.count;
        this.waves = [];
        
        this.originalPositions = [];
        for (let i = 0; i < vertexCount; i++) {
            const x = positionAttribute.getX(i);
            const y = positionAttribute.getY(i);
            const z = positionAttribute.getZ(i);
            this.originalPositions.push(new Vector3(x, y, z));
            this.waves.push({
                ang: Math.random() * Math.PI * 2,
                amp: 3 + Math.random() * 0.0001,
                speed: 0.001 + Math.random() * 0.0032
            });
        }

        const loader = new TextureLoader();

        const texture = loader.load('./assets/terrain_3.jpg');
        texture.colorspace = SRGBColorSpace;

        this.material = new MeshPhongMaterial({
            transparent: false,
            opacity: 0.6,
            flatShading: true,
            map: texture,
            wireframe: false,
        });

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.receiveShadow = true;
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
            const newX = orig.x + Math.cos(wave.ang) * wave.amp;
            const newY = orig.y + Math.sin(wave.ang) * wave.amp;
            positionAttribute.setXYZ(i, newX, newY, orig.z);
            wave.ang += wave.speed;
        }
        positionAttribute.needsUpdate = true;

        this.mesh.rotation.z += delta * this.rotationSpeed;
    }

    /**
     * Renvoie la hauteur (coordonnée y) du terrain à une position donnée (x, z).
     * Ici, on retourne simplement la position y du mesh.
     *
     * @param {number} x 
     * @param {number} z 
     * @returns {number} 
     */
    getTerrainHeight(x, z) {
        return this.mesh.position.y;
    }
}
