// Collection of connected players
const players = {};

// Collection of spawned monsters
const monsters = {};

// Collection of spawned potions
const potions = {};

// Field stores movement speed (original value = 160)
const moveSpeed = 180;

// Track monster ID numbers
let monsterIdNumber = 0;

// Track number of monsters
const numberOfMonsters = 7;

// Track potion ID numbers
let potionIdNumber = 0;

// Track number of potions
const numberOfPotions = 4;

// Store potion locations
const potionLocations = [
    [480, 109],
    [75, 835],
    [944, 484],
    [293, 532],
    [1272, 938],
    [1296, 100],
    [891, 167],
    [600, 957],
    [869, 1063],
    [1341, 474],
]

// Store spawn locations
const spawnLocations = [
    [352, 480],
    [800, 608],
    [1280, 224],
    [1200, 999],
    [640, 864],
    [128, 928],
    [1024, 96],
    [1056, 736],
    [96, 160],
    [650, 253],
];

// Store bot names
const monsterNames = [
    "Bot1",
    "Bot2",
    "Bot3",
    "Bot4",
    "Bot5",
    "Bot6",
    "Bot7",
    "Bot8",
    "Bot9",
    "Bot10",
    "Bot11",
    "Bot12",
    "Bot13",
    "Bot14",
    "Bot15",
    "Bot16"
];

// Phaser config object
const config = {
    type: Phaser.HEADLESS,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    autoFocus: false,
};

function preload() {
    // Load a 64 x 64 image to correlate with the client side sprite size of 64 x 64
    this.load.image('player', 'assets/serverPlayer.png');

    // Load a 32 x 32 image to be used as player hitbox physics body
    this.load.image('attackBox', 'assets/hitboxFrame.png');

    // Load the potion sprite, the same image used on client side
    this.load.image('potion', 'assets/Potion.png');

    // Load tiled map info for server side collision authentication with map blocked layer
    this.load.image("terrain_atlas", "assets/level/terrain_atlas.png");
    this.load.tilemapTiledJSON("map", "assets/level/IterativeMap4.json");
}

function create() {
    // Create a secondary reference to the current scene
    const self = this;

    // Create a physics group for all connected players, all spawned monsters, and all spawned potions
    this.players = this.physics.add.group();
    this.monsters = this.physics.add.group();
    this.potions = this.physics.add.group();

    // Create map for blocked layer collision detection server side
    this.map = new Map(
        this,
        "map",
        "terrain_atlas",
        "Ground",
        "Blocked",
        "Deco1"
    );

    // Add collisions for Players vs map blocked layer and Monsters vs map blocked layer
    this.physics.add.collider(this.players, this.map.blockedLayer);
    this.physics.add.collider(this.monsters, this.map.blockedLayer);

    // Spawn monsters based on numberOfMonsters variable set at the top of this file
    for (let i = 0; i < numberOfMonsters; i++) {
        // Add new monster to the spawned monsters collection
        monsters[monsterIdNumber] = new ServerMonster(self, 0, 0, 'player', monsterIdNumber, monsterNames[i]);

        // Add new monster to the physics group
        addMonster(self, monsters[monsterIdNumber]);

        // Increment the ID number for each monster spawned
        monsterIdNumber++;
    }

    // Spawn potions based on numberOfPotions variable set at the top of this file
    for (let i = 0; i < numberOfPotions; i++) {
        // Add new potion to the spawned potions collection
        potions[potionIdNumber] = new ServerPotion(self, 0, 0, 'potion', potionIdNumber);

        // Add new potion to physics group
        addPotion(self, potions[potionIdNumber]);

        // Increment the ID number for each potion spawned
        potionIdNumber++;
    }

    // When a client connects to the server...
    io.on('connection', (socket) => {
        // Log the user ID in the server console
        console.log(`User: ${socket.id} has connected to the server`);

        // Add new player object to the collection of connected players
        players[socket.id] = new ServerPlayer(self, 0, 0, 'player', socket.id);

        // Add new player to physics group
        addPlayer(self, players[socket.id]);

        // Get player name input from client
        socket.on('playerName', (data) => {
            players[socket.id].name = data.name;
        });

        // Send all connected players
        socket.emit('currentPlayers', getPlayersObjects(self));

        // Send all spawned monsters
        socket.emit('currentMonsters', getMonstersObjects(self));

        // Send all spawned potions
        socket.emit('currentPotions', getPotionsObjects(self));

        // Update all other connected clients with the new player data
        socket.broadcast.emit('newPlayer', getPlayersObjects(self)[socket.id]);

        // When a client disconnects from the server...
        socket.on('disconnect', () => {
            // Log the user ID in the server console
            console.log(`User: ${socket.id} has disconnected from the server`);

            // Remove player from physics grou[]
            removePlayer(self, socket.id);

            // Remove player from the collection of connected players
            delete players[socket.id];

            // Update all connected clients of the disconnection of the player
            io.emit('disconnection', socket.id);
        });

        // When a client sends it's input, update the server side player data accordingly
        socket.on('playerInput', (inputData) => {
            handlePlayerInput(self, socket.id, inputData);
        });
    });
}

function update() {
    // Update all players in physics group
    this.players.getChildren().forEach((player) => {
        // Call each player's update method
        players[player.playerId].update();

        // Store the updated data in the corresponding object in the collection of connected players
        players[player.playerId].x = player.x;
        players[player.playerId].y = player.y;
        players[player.playerId].direction = player.direction;
        players[player.playerId].isMoving = player.isMoving;
        players[player.playerId].isAttacking = player.isAttacking;
        players[player.playerId].name = player.name;
        players[player.playerId].kills = player.kills;
        players[player.playerId].deaths = player.deaths;
    });

    // Update all monsters in physics group
    this.monsters.getChildren().forEach((monster) => {
        // Call each monster's update method
        monsters[monster.monsterId].update();

        // Store the updated data in the corresponding object in the collection of spawned monsters
        monsters[monster.monsterId].x = monster.x;
        monsters[monster.monsterId].y = monster.y;
        monsters[monster.monsterId].direction = monster.direction;
        monsters[monster.monsterId].isMoving = monster.isMoving;
        monsters[monster.monsterId].isAttacking = monster.isAttacking;
    });

    // Send all clients updated player data
    io.emit('playerUpdates', getPlayersObjects(this));

    // Send all clients updated monster data
    io.emit('monsterUpdates', getMonstersObjects(this));

    // Send all clients updated potion data
    io.emit('potionUpdates', getPotionsObjects(this));
}

// Assign the input received from a client to the appropriate server player
function handlePlayerInput(self, Id, input) {
    self.players.getChildren().forEach((player) => {
        if (Id === player.playerId) {
            players[player.playerId].input = input;
        }
    });
}

// Add given player to physics group
function addPlayer(self, player) {
    self.players.add(player);
}

// Add given spawned monster to physics group
function addMonster(self, monster) {
    self.monsters.add(monster);
}

// Add given spawned potion to physics group
function addPotion(self, potion) {
    self.potions.add(potion);
}

// Remove a disconnected player from the group of connected players
function removePlayer(self, Id) {
    self.players.getChildren().forEach((player) => {
        if (Id === player.playerId) {
            player.destroy();
        }
    });
}

// Returns an object with the data of all connected players for sending to client
function getPlayersObjects(self) {
    const playersObjects = {};
    self.players.getChildren().forEach((player) => {
        playersObjects[player.playerId] = {
            x: player.x,
            y: player.y,
            playerId: player.playerId,
            name: player.name,
            direction: player.direction,
            input: {
                left: player.input.left,
                right: player.input.right,
                up: player.input.up,
                down: player.input.down,
                space: player.input.space,
            },
            isMoving: player.isMoving,
            isAttacking: player.isAttacking,
            health: player.health,
            maxHealth: player.maxHealth,
            isDead: player.isDead,
            kills: player.kills,
            deaths: player.deaths,
        }
    });
    return playersObjects;
}

// Returns an object with the data of all spawned monsters for sending to client
function getMonstersObjects(self) {
    const monstersObjects = {};
    self.monsters.getChildren().forEach((monster) => {
        monstersObjects[monster.monsterId] = {
            x: monster.x,
            y: monster.y,
            monsterId: monster.monsterId,
            name: monster.name,
            direction: monster.direction,
            isMoving: monster.isMoving,
            health: monster.health,
            maxHealth: monster.maxHealth,
            isDead: monster.isDead,
            isAttacking: monster.isAttacking,
        }
    });
    return monstersObjects;
}

// Returns an object with the data of all spawned potions for sending to client
function getPotionsObjects(self) {
    const potionsObjects = {};
    self.potions.getChildren().forEach((potion) => {
        potionsObjects[potion.potionId] = {
            x: potion.x,
            y: potion.y,
            potionId: potion.potionId,
            isActive: potion.isActive,
        }
    });
    return potionsObjects;
}

// Create game instance
const game = new Phaser.Game(config);
window.gameLoaded();