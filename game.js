// game.js
class GameEngine {
  constructor() {
    this.currentScene = null;
    this.playerData = {
      hp: 320,
      mp: 150,
      traits: ['holy', 'leadership'],
      progress: {}
    };
    
    this.initEventListeners();
    this.loadScene('prologue');
    this.updateStatusDisplay();
  }

  async loadScene(sceneId) {
    try {
      const response = await fetch(`scenes/${sceneId}.json`);
      this.currentScene = await response.json();
      this.renderScene();
    } catch (error) {
      console.error('场景加载失败:', error);
    }
  }

  renderScene() {
    document.getElementById('scene-art').style.backgroundImage = 
      `url('${this.currentScene.characterImage}')`;
    document.getElementById('speaker-name').textContent = 
      this.currentScene.character;
    document.getElementById('dialogue-text').textContent = 
      this.currentScene.text;
    
    const choicesContainer = document.getElementById('choice-buttons');
    choicesContainer.innerHTML = this.currentScene.choices
      .map((choice, index) => `
        <button onclick="game.handleChoice(${index})">
          ${choice.text}
        </button>
      `).join('');
    
    document.getElementById('dialogue-container').classList.remove('hidden');
  }

  handleChoice(index) {
    const choice = this.currentScene.choices[index];
    if (choice.effects) this.applyEffects(choice.effects);
    if (choice.nextScene) this.loadScene(choice.nextScene);
  }

  applyEffects(effects) {
    Object.entries(effects).forEach(([key, value]) => {
      this.playerData.progress[key] = (this.playerData.progress[key] || 0) + value;
    });
    this.updateStatusDisplay();
  }

  updateStatusDisplay() {
    document.getElementById('hp-value').textContent = this.playerData.hp;
    document.getElementById('mp-value').textContent = this.playerData.mp;
    document.getElementById('character-traits').innerHTML = this.playerData.traits
      .map(trait => `<span class="trait ${trait}">${this.getTraitName(trait)}</span>`)
      .join('');
  }

  getTraitName(trait) {
    const names = {
      holy: '✨ 圣光加护',
      leadership: '👑 王族威仪'
    };
    return names[trait] || trait;
  }

  initEventListeners() {
    // 可添加全局事件监听器
  }
}

// script/save.js
class SaveSystem {
  static saveGame() {
    const saveData = {
      timestamp: new Date().toISOString(),
      scene: game.currentScene.id,
      playerData: game.playerData
    };
    localStorage.setItem('AriannaSave', JSON.stringify(saveData));
    alert('游戏已保存！');
  }

  static loadGame() {
    const saveData = JSON.parse(localStorage.getItem('AriannaSave'));
    if (saveData) {
      game.playerData = saveData.playerData;
      game.loadScene(saveData.scene);
      game.updateStatusDisplay();
      alert('存档读取成功！');
    } else {
      alert('没有找到存档！');
    }
  }
}

// 初始化游戏
const game = new GameEngine();
window.game = game;
