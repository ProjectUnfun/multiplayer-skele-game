class BootScene extends Phaser.Scene {
    constructor() {
        super("Boot");
    }

    preload() {
        // Load images
        this.loadImages();

        // Load audio
        this.loadAudio();

        // Load tile image and map JSON
        this.loadTilesAndMap();

        // Load spritesheets
        this.loadSpriteSheets();
    }

    create() {
        // After all files are loaded, start the LoginScene
        this.scene.start("Login");
    }

    loadImages() {
        // Icons for UI
        this.load.image("swordIcon", "assets/images/iconSword.png");
        this.load.image("skullIcon", "assets/images/iconSkull.png");

        // Background image
        this.load.image("skeleBG", "assets/images/skullBG.png");
    }

    loadAudio() {
        // Load audio files
        this.load.audio("enemyDeath", ["assets/audio/EnemyDeath.wav"]);
        this.load.audio("playerAttack", ["assets/audio/PlayerAttack.wav"]);
        this.load.audio("monsterDamaged", ["assets/audio/MonsterDamaged.wav"]);
        this.load.audio("playerDamaged", ["assets/audio/PlayerDamaged.wav"]);
        this.load.audio("monsterAttack", ["assets/audio/MonsterAttack.wav"]);
    }

    loadTilesAndMap() {
        // load tiled map info
        this.load.image("terrain_atlas", "assets/level/terrain_atlas_extruded.png");
        this.load.tilemapTiledJSON("map", "assets/level/IterativeMap4.json");
    }

    loadSpriteSheets() {
        // Load player movement spritesheet
        this.load.spritesheet("playerWalk", "/assets/images/WalkLPC.png", {
            frameWidth: 64,
            frameHeight: 64,
        });

        // Load player attack spritesheet
        this.load.spritesheet("playerAttack", "assets/images/HammerLPC.png", {
            frameWidth: 64,
            frameHeight: 64,
        });

        // Load opponent movement spritesheet
        this.load.spritesheet("monsterWalk", "assets/images/SkeleWalk.png", {
            frameWidth: 64,
            frameHeight: 64,
        });

        // Load opponent attack spritesheet
        this.load.spritesheet("monsterAttack", "assets/images/SkeleAttack.png", {
            frameWidth: 64,
            frameHeight: 64,
        });

        // Load the potion sprite, the same image used on server side
        this.load.spritesheet("potion", "assets/images/Potion.png", {
            frameWidth: 32,
            frameHeight: 32,
        });
    }
}