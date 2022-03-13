class GameScene extends Phaser.Scene {
    constructor() {
        super("Game");
    }

    init(data) {
        // Run the Score scene in parallel with the game scene
        this.scene.launch("Score");

        // Store name passed from LoginScene
        this.playerName = data.name;
    }

    preload() {
        // Load player movement spritesheet
        this.load.spritesheet("playerWalk", "/assets/WalkLPC.png", {
            frameWidth: 64,
            frameHeight: 64,
        });

        this.load.spritesheet("playerAttack", "assets/HammerLPC.png", {
            frameWidth: 64,
            frameHeight: 64,
        });

        // Load opponent movement spritesheet
        this.load.spritesheet("monsterWalk", "assets/SkeleWalk.png", {
            frameWidth: 64,
            frameHeight: 64,
        });

        // Load opponent attack spritesheet
        this.load.spritesheet("monsterAttack", "assets/SkeleAttack.png", {
            frameWidth: 64,
            frameHeight: 64,
        });

        // Load the potion sprite, the same image used on server side
        this.load.spritesheet("potion", "assets/Potion.png", {
            frameWidth: 32,
            frameHeight: 32,
        });

        // load tiled map info
        this.load.image("terrain_atlas", "assets/level/terrain_atlas_extruded.png");
        this.load.tilemapTiledJSON("map", "assets/level/IterativeMap4.json");
    }

    create() {
        // Create a secondary reference to the current scene ???
        var self = this;

        // Create the socket object for communitcation with server
        this.socket = io();

        // Send player name to server
        this.socket.emit('playerName', { name: this.playerName });

        // Create a physics group for all players, monsters, and potions sent by server
        this.players = this.physics.add.group();
        this.monsters = this.physics.add.group();
        this.potions = this.physics.add.group();

        // Create tiled map
        this.map = new Map(
            this,
            "map",
            "terrain_atlas",
            "Ground",
            "Blocked",
            "Deco1"
        );

        // Run the update method of all children objects of the groups
        this.players.runChildUpdate = true;
        this.monsters.runChildUpdate = true;
        this.potions.runChildUpdate = true;

        // When the server sends the collection of connected players
        this.socket.on('currentPlayers', (players) => {
            Object.keys(players).forEach((id) => {
                if (players[id].playerId === self.socket.id) {
                    this.addUserPlayer(self, players[id], 'playerWalk');
                } else {
                    this.addOtherPlayers(self, players[id], 'monsterWalk');
                }
            });
        });

        // When the server send the collection of spawned monsters
        this.socket.on('currentMonsters', (monsters) => {
            Object.keys(monsters).forEach((id) => {
                this.addMonster(self, monsters[id], 'monsterWalk');
            });
        });

        // When the server sends the collection of spawned potions
        this.socket.on('currentPotions', (potions) => {
            Object.keys(potions).forEach((id) => {
                this.addPotion(self, potions[id], 'potion');
            });
        });

        // When the server sends a new player connection event
        this.socket.on('newPlayer', (playerInfo) => {
            this.addOtherPlayers(self, playerInfo, 'monsterWalk');
        });

        // When the server sends a player disconnection event
        this.socket.on('disconnection', (Id) => {
            self.players.getChildren().forEach((player) => {
                if (Id === player.playerId) {
                    player.healthBar.destroy();
                    player.destroy();
                }
            });
        });

        // When the server sends player data update event
        this.socket.on('playerUpdates', (players) => {
            Object.keys(players).forEach((id) => {
                self.players.getChildren().forEach((player) => {
                    if (players[id].playerId === player.playerId) {
                        player.setPosition(players[id].x, players[id].y);
                        player.direction = players[id].direction;
                        player.isMoving = players[id].isMoving;
                        player.isAttacking = players[id].isAttacking;
                        player.health = players[id].health;
                        player.maxHealth = players[id].maxHealth;
                        player.isDead = players[id].isDead;
                        player.name = players[id].name;
                        player.kills = players[id].kills;
                        player.deaths = players[id].deaths;
                    }
                });
            });
        });

        // When the server sends monster data update event
        this.socket.on('monsterUpdates', (monsters) => {
            Object.keys(monsters).forEach((id) => {
                self.monsters.getChildren().forEach((monster) => {
                    if (monsters[id].monsterId === monster.monsterId) {
                        monster.setPosition(monsters[id].x, monsters[id].y);
                        monster.direction = monsters[id].direction;
                        monster.isMoving = monsters[id].isMoving;
                        monster.health = monsters[id].health;
                        monster.maxHealth = monsters[id].maxHealth;
                        monster.isDead = monsters[id].isDead;
                        monster.isAttacking = monsters[id].isAttacking;
                        monster.name = monsters[id].name;
                    }
                });
            });
        });

        // When the server sends potion data update event
        this.socket.on('potionUpdates', (potions) => {
            Object.keys(potions).forEach((id) => {
                self.potions.getChildren().forEach((potion) => {
                    if (potions[id].potionId === potion.potionId) {
                        potion.setPosition(potions[id].x, potions[id].y);
                        potion.isActive = potions[id].isActive;
                    }
                });
            });
        });

        // Create the user input
        this.cursors = this.input.keyboard.createCursorKeys();

        // Track user input status
        this.leftKeyPressed = false;
        this.rightKeyPressed = false;
        this.upKeyPressed = false;
        this.downKeyPressed = false;
        this.spaceKeyPressed = false;
    }

    update() {
        // Store the old user input status info
        const left = this.leftKeyPressed;
        const right = this.rightKeyPressed;
        const up = this.upKeyPressed;
        const down = this.downKeyPressed;
        const space = this.spaceKeyPressed;

        // Check for new input status
        if (this.cursors.space.isDown) {
            this.spaceKeyPressed = true;
            this.leftKeyPressed = false;
            this.rightKeyPressed = false;
            this.upKeyPressed = false;
            this.downKeyPressed = false;
        } else if (this.cursors.left.isDown) {
            this.leftKeyPressed = true;
            this.rightKeyPressed = false;
            this.upKeyPressed = false;
            this.downKeyPressed = false;
            this.spaceKeyPressed = false;
        } else if (this.cursors.right.isDown) {
            this.rightKeyPressed = true;
            this.leftKeyPressed = false;
            this.upKeyPressed = false;
            this.downKeyPressed = false;
            this.spaceKeyPressed = false;
        } else if (this.cursors.up.isDown) {
            this.upKeyPressed = true;
            this.leftKeyPressed = false;
            this.rightKeyPressed = false;
            this.downKeyPressed = false;
            this.spaceKeyPressed = false;
        } else if (this.cursors.down.isDown) {
            this.downKeyPressed = true;
            this.leftKeyPressed = false;
            this.rightKeyPressed = false;
            this.upKeyPressed = false;
            this.spaceKeyPressed = false;
        } else {
            this.leftKeyPressed = false;
            this.rightKeyPressed = false;
            this.upKeyPressed = false;
            this.downKeyPressed = false;
            this.spaceKeyPressed = false;
        }

        // When the input status has changed, send new input status to server
        if (left !== this.leftKeyPressed || right !== this.rightKeyPressed || up !== this.upKeyPressed ||
            down !== this.downKeyPressed || space !== this.spaceKeyPressed) {
            this.socket.emit('playerInput', {
                left: this.leftKeyPressed, right: this.rightKeyPressed, up: this.upKeyPressed, down: this.downKeyPressed,
                space: this.spaceKeyPressed
            });
        }
    }

    // Set up the user player
    addUserPlayer(self, playerInfo, sprite) {
        const player = new ClientPlayer(self, playerInfo.x, playerInfo.y, sprite, playerInfo.playerId, playerInfo.name);
        self.players.add(player);
    }

    // Set up the other players
    addOtherPlayers(self, playerInfo, sprite) {
        const otherPlayer = new OtherPlayer(self, playerInfo.x, playerInfo.y, sprite, playerInfo.playerId, playerInfo.name);
        self.players.add(otherPlayer);
    }

    // Set up monsters
    addMonster(self, monsterInfo, sprite) {
        const monster = new Monster(self, monsterInfo.x, monsterInfo.y, sprite, monsterInfo.monsterId, monsterInfo.name);
        self.monsters.add(monster);
    }

    // Set up potions
    addPotion(self, potionInfo, sprite) {
        const potion = new Potion(self, potionInfo.x, potionInfo.y, sprite, potionInfo.potionId);
        self.potions.add(potion);
    }
}