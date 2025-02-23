import { Box3, Vector3, Audio, AudioLoader } from 'three';

export default class TreeCollector {
  constructor(player, treePlacer, listener) {
    this.player = player;         
    this.treePlacer = treePlacer; 
    this.counter = 0;
    this.uiElement = document.getElementById('treeCounter');
    this.listener = listener;
    this.treeSound = new Audio(listener);
    this.golemSound = new Audio(listener);
    
    const audioLoader = new AudioLoader();
    
    audioLoader.load('sounds/hit-tree.mp3', (buffer) => {
      this.treeSound.setBuffer(buffer);
      this.treeSound.setVolume(0.5);
    });
    
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

    for (let i = this.treePlacer.trees.length - 1; i >= 0; i--) {
      const tree = this.treePlacer.trees[i];
  
      if (tree.name.includes('low_poly_tree')) continue;
      if (tree.name.includes('stylized_pine_tree_tree')) continue;
      
      const treeBox = new Box3().setFromObject(tree);
      if (playerBox.intersectsBox(treeBox)) {
        if (tree.name.includes('low_poly_tree')) continue;
        if (tree.name.includes('stylized_pine_tree_tree')) continue;
        this.treePlacer.debugMesh.remove(tree);
        this.treePlacer.trees.splice(i, 1);
  
        if (tree.name.includes('just_tree')) {
          this.counter++;
          this.treeSound.play();
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
  
  addTree() {
    this.counter++;
    this.updateUI();
  }
}
