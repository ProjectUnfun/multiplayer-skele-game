// Collection of connected players
const players = {};

// Collection of spawned monsters
const monsters = {};

// Field stores movement speed (original value = 160)
const moveSpeed = 160;

// Track monster ID numbers
let monsterIdNumber = 0;

// Track number of monsters
const numberOfMonsters = 7;

// Store spawn locations
const spawnLocations = [
    [352, 480],
    [800, 608],
    [1280, 224],
    [1248, 960],
    [640, 864],
    [128, 928],
    [1024, 96],
    [1056, 736],
    [96, 160],
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

    // Load tiled map info for server side collision authentication with map blocked layer
    this.load.image("terrain_atlas", "assets/level/terrain_atlas.png");
    this.load.tilemapTiledJSON("map", "assets/level/IterativeMap4.json");
}

function create() {
    // Create a secondary reference to the current scene
    const self = this;

    // Create a physics group for all connected players
    this.players = this.physics.add.group();

    // Create a physics group for all spawned monsters
    this.monsters = this.physics.add.group();

    // Create map for blocked layer collision detection server side
    this.map = new Map(
        this,
        "map",
        "terrain_atlas",
        "Ground",
        "Blocked",
        "Deco1"
    );

    // Add collisions for Players vs map blocked layer
    this.physics.add.collider(this.players, this.map.blockedLayer);

    // Add collisions for Monsters vs map blocked layer
    this.physics.add.collider(this.monsters, this.map.blockedLayer);

    // Spawn monsters based on numberOfMonsters variable set at the top of this file
    for (let i = 0; i < numberOfMonsters; i++) {
        // Add new monster to the spawned monsters collection
        monsters[monsterIdNumber] = new ServerMonster(self, 0, 0, 'player', monsterIdNumber);

        // Add new monster to the physics group
        addMonster(self, monsters[monsterIdNumber]);

        // Increment the ID number for each monster spawned
        monsterIdNumber++;
    }

    // When a client connects to the server...
    io.on('connection', (socket) => {

        // Log the user ID in the server console
        console.log(`User: ${socket.id} has connected to the server`);

        // Add new player object to the collection of connected players
        players[socket.id] = new ServerPlayer(self, 0, 0, 'player', socket.id);

        // Add new player to physics group
        addPlayer(self, players[socket.id]);

        // Send an object containing the data of all connected players
        socket.emit('currentPlayers', getPlayersObjects(self));

        // Send an object containing the data of all spawned monsters
        socket.emit('currentMonsters', getMonstersObjects(self));

        // Update all other connected clients by sending an object containing the new player data
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

    // Emit event to all clients with updated player data
    io.emit('playerUpdates', getPlayersObjects(this));

    // Emit event to all clients with updated monster data
    io.emit('monsterUpdates', getMonstersObjects(this));
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

// Remove a disconnected player from the group of connected players
function removePlayer(self, Id) {
    self.players.getChildren().forEach((player) => {
        if (Id === player.playerId) {
            player.destroy();
        }
    });
}

// Returns an object that stores the data of all connected players for sending to client
function getPlayersObjects(self) {
    const playersObjects = {};
    self.players.getChildren().forEach((player) => {
        playersObjects[player.playerId] = {
            x: player.x,
            y: player.y,
            playerId: player.playerId,
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
        }
    });
    return playersObjects;
}

// Returns an object that stores the data of all spawned monsters for sending to client
function getMonstersObjects(self) {
    const monstersObjects = {};
    self.monsters.getChildren().forEach((monster) => {
        monstersObjects[monster.monsterId] = {
            x: monster.x,
            y: monster.y,
            monsterId: monster.monsterId,
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

// Create game instance
const game = new Phaser.Game(config);
window.gameLoaded();