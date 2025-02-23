import { 
  CylinderGeometry, 
  Matrix4, 
  Vector3, 
  Quaternion, 
  MeshBasicMaterial,
  Mesh,
  ArrowHelper
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default class TreePlacer {
  /**
   * Constructeur du TreePlacer.
   * @param {Scene} scene - La scène Three.js.
   * @param {Terrain} terrain - L'instance du terrain (le grand cylindre déformé).
   * @param {Array<string>} treeUrls - Tableau d'URLs pour les modèles d'arbres.
   * @param {Object} options - Options pour le cylindre de référence.
   */
  constructor(scene, terrain, treeUrls, options = {}) {
    this.scene = scene;
    this.terrain = terrain;
    this.treeUrls = treeUrls;
    this.rotationSpeed = options.rotationSpeed || 0.01;
    this.loader = new GLTFLoader();
    this.trees = [];
    this.pointsData = []; 

    this.refRadius = options.refRadius || terrain.radius * 0.8;
    this.segments = options.segments || 40;
    this.center = options.center || terrain.mesh.position;

    this.refGeometry = new CylinderGeometry(
      this.refRadius,
      this.refRadius,
      terrain.height,
      this.segments,
      1,      
      true    
    );
    
    this.refGeometry.center();
    
    this.refGeometry.applyMatrix4(new Matrix4().makeRotationX(-Math.PI / 2));
    this.refGeometry.computeVertexNormals();

    // Ce Mesh servira de pivot pour la rotation, donc les arbres ajoutés en enfants suivront sa rotation.
    this.debugMesh = new Mesh(this.refGeometry, new MeshBasicMaterial({ color: 0xff0000, wireframe: true }));
    this.debugMesh.position.copy(this.center);
    this.scene.add(this.debugMesh);

    this.placeTrees();
  }

  // Génère un point aléatoire et sa normale en coordonnées locales du cylindre.
  getRandomLocalPointAndNormal() {
    
    const theta = Math.random() * Math.PI * 2;
    const z = (Math.random() - 0.5) * this.terrain.height;
    
    const originLocal = new Vector3(
      this.refRadius * Math.cos(theta),
      this.refRadius * Math.sin(theta),
      z
    );
    
    const normalLocal = new Vector3(
      Math.cos(theta),
      Math.sin(theta),
      0
    );
    return { originLocal, normalLocal };
  }

  placeTrees() {
    
    this.debugMesh.updateMatrixWorld(true);
    const treeAttempts = 3000;
    const centralBand = 60; 
    
    for (let i = 0; i < treeAttempts; i++) {
     
      const { originLocal, normalLocal } = this.getRandomLocalPointAndNormal();
      
      
      let probability;
      if (Math.abs(originLocal.z) < centralBand) {
        probability = 1;  
      } else {
        probability = 0.02;  
      }
    
      if (Math.random() < probability) {
        this.pointsData.push({ originLocal, normalLocal });
        const arrow = new ArrowHelper(normalLocal.clone(), originLocal.clone(), 20, 0xffff00);
        this.debugMesh.add(arrow);
        this.placeTreeAt(originLocal, normalLocal);
      }
    }
  }
  

  placeTreeAt(localOrigin, localNormal) {
    const url = this.treeUrls[Math.floor(Math.random() * this.treeUrls.length)];
    this.loader.load(
      url,
      (gltf) => {
        const tree = gltf.scene;
    
        let offset = 119;
       
        if (url.includes('tree_golem')) {
          offset += 2;  
        }
        
        
        tree.position.copy(localOrigin.clone().add(localNormal.clone().multiplyScalar(offset)));
    
        const q = new Quaternion();
        q.setFromUnitVectors(new Vector3(0, 1, 0), localNormal);
        tree.quaternion.copy(q);
    
        if (url.includes('tree_golem')) {
          tree.quaternion.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2));
          tree.scale.set(2, 2, 2);
          tree.name = 'tree_golem';
        } else if (url.includes('low_poly_tree') || url.includes('stylized_pine_tree')) {
          tree.scale.set(0.07, 0.07, 0.07);
          if(url.includes('low_poly_tree')) {
            tree.name = 'low_poly_tree';
          } else if(url.includes('stylized_pine_tree')) {
            tree.name = 'stylized_pine_tree';
          }
        } else {
          tree.scale.set(1, 1, 1);
          if (url.includes('just_tree')) {
            tree.name = 'just_tree';
          } else if (url.includes('tree_golem')){
            tree.name = 'tree_golem';
          } 
        }
    
        
        this.debugMesh.add(tree);
        this.trees.push(tree);
      },
      undefined,
      (error) => {
        console.error("Erreur lors du chargement de l'arbre :", error);
      }
    );
  }
  
  
  


  update(delta) {
    this.debugMesh.rotation.z += delta * this.rotationSpeed;
  }
}
