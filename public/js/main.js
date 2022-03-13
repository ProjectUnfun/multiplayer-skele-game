var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload() {
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

    // load tiled map info
    this.load.image("terrain_atlas", "assets/level/terrain_atlas_extruded.png");
    this.load.tilemapTiledJSON("map", "assets/level/IterativeMap4.json");
}

function create() {
    // Create a secondary reference to the current scene ???
    var self = this;

    // Create the socket object for communitcation with server
    this.socket = io();

    // Create a physics group for all players sent by server
    this.players = this.physics.add.group();

    // Create a physics group for all monsters sent by server
    this.monsters = this.physics.add.group();

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

    // When the server sends the collection of connected players
    this.socket.on('currentPlayers', (players) => {
        Object.keys(players).forEach((id) => {
            if (players[id].playerId === self.socket.id) {
                addUserPlayer(self, players[id], 'playerWalk');
            } else {
                addOtherPlayers(self, players[id], 'monsterWalk');
            }
        });
    });

    // When the server send the collection of spawned monsters
    this.socket.on('currentMonsters', (monsters) => {
        Object.keys(monsters).forEach((id) => {
            addMonster(self, monsters[id], 'monsterWalk');
        });
    });

    // When the server sends a new player connection event
    this.socket.on('newPlayer', (playerInfo) => {
        addOtherPlayers(self, playerInfo, 'monsterWalk');
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

function update() {
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
function addUserPlayer(self, playerInfo, sprite) {
    const player = new ClientPlayer(self, playerInfo.x, playerInfo.y, sprite, playerInfo.playerId);
    self.players.add(player);
}

// Set up the other players
function addOtherPlayers(self, playerInfo, sprite) {
    const otherPlayer = new OtherPlayer(self, playerInfo.x, playerInfo.y, sprite, playerInfo.playerId);
    self.players.add(otherPlayer);
}

// Set up monsters
function addMonster(self, monsterInfo, sprite) {
    const monster = new Monster(self, monsterInfo.x, monsterInfo.y, sprite, monsterInfo.monsterId);
    self.monsters.add(monster);
}