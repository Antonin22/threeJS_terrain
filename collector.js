import { Box3, Vector3, Audio, AudioLoader } from 'three';

export default class TreeCollector {
  constructor(player, treePlacer, listener) {
    this.player = player;         // Instance de Player
    this.treePlacer = treePlacer; // Instance de TreePlacer
    this.counter = 0;
    this.uiElement = document.getElementById('treeCounter');
    this.listener = listener;
    
    // Créer des objets Audio pour les sons
    this.treeSound = new Audio(listener);
    this.golemSound = new Audio(listener);
    
    const audioLoader = new AudioLoader();
    // Charger le son pour le just_tree
    audioLoader.load('sounds/hit-tree.mp3', (buffer) => {
      this.treeSound.setBuffer(buffer);
      this.treeSound.setVolume(0.5);
    });
    // Charger le son pour le tree_golem
    audioLoader.load('sounds/stones.mp3', (buffer) => {
      this.golemSound.setBuffer(buffer);
      this.golemSound.setVolume(0.5);
    });

    this.updateUI();
  }

  updateUI() {
    this.uiElement.innerText = `Arbres: ${this.counter}`;
  }

  checkCollisions() {
    const playerBox = new Box3().setFromObject(this.player.playerGroup);
    // Parcourir les arbres
    for (let i = this.treePlacer.trees.length - 1; i >= 0; i--) {
      const tree = this.treePlacer.trees[i];
      // On ignore certains types d'arbres
      if (tree.name.includes('low_poly_tree')) continue;
      if (tree.name.includes('stylized_pine_tree_tree')) continue;
      
      const treeBox = new Box3().setFromObject(tree);
      if (playerBox.intersectsBox(treeBox)) {
        if (tree.name.includes('low_poly_tree')) continue;
        if (tree.name.includes('stylized_pine_tree_tree')) continue;
        // Retirer l'arbre de la scène et de la liste
        this.treePlacer.debugMesh.remove(tree);
        this.treePlacer.trees.splice(i, 1);
  
        // Vérifier le type d'arbre pour mettre à jour le compteur
        if (tree.name.includes('just_tree')) {
          this.counter++;
          this.treeSound.play();
          //this.updateUI();
          console.log('golem intersecté');
        } else if (tree.name.includes('tree_golem')) {
          this.counter--;
          this.golemSound.play();
          console.log('arbre intersecté');
        }
        
        this.updateUI();
      }
    }
  }
  

  // Méthode pour incrémenter le compteur lors de l'ajout d'un arbre, si besoin
  addTree() {
    this.counter++;
    this.updateUI();
  }
}
