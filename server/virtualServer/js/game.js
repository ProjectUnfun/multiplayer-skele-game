// Collection of connected players
const players = {};

// Collection of spawned monsters
const monsters = {};

// Field stores movement speed
const playerVelocity = 160;

// Field stores monster ID numbers
let monsterIdNumber = 0;

// Track number of monsters
const numberOfMonsters = 0;

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
    // load a 64 x 64 image to correlate with the client side sprite
    this.load.image('player', 'assets/serverPlayer.png');

    // load a 32 x 32 image to be used as player attack physics body
    this.load.image('attackBox', 'assets/hitboxFrame.png');

    // load tiled map info
    this.load.image("terrain_atlas", "assets/level/terrain_atlas.png");
    this.load.tilemapTiledJSON("map", "assets/level/IterativeMap4.json");
}

function create() {
    // Create a secondary reference to the current scene ???
    const self = this;

    // Create a physics group for all connected players
    this.players = this.physics.add.group();

    // Create a physics group for all spawned monsters
    this.monsters = this.physics.add.group();

    // Create map for boundary collision detection server side
    this.map = new Map(
        this,
        "map",
        "terrain_atlas",
        "Ground",
        "Blocked",
        "Deco1"
    );

    // Players vs map blocked layer
    this.physics.add.collider(this.players, this.map.blockedLayer);

    // Monsters vs map blocked layer
    this.physics.add.collider(this.monsters, this.map.blockedLayer);

    // Spawn monsters
    for (let i = 0; i < numberOfMonsters; i++) {
        monsters[monsterIdNumber] = new ServerMonster(self, 0, 0, 'player', monsterIdNumber);
        addMonster(self, monsters[monsterIdNumber]);
        monsterIdNumber++;
    }

    // When a client connects to the server
    io.on('connection', (socket) => {
        console.log(`User: ${socket.id} has connected to the server`);

        // create a new player object in the players group
        players[socket.id] = new ServerPlayer(self, 0, 0, 'player', socket.id);

        // add player to server
        addPlayer(self, players[socket.id]);

        // send the players object to the new player
        socket.emit('currentPlayers', getPlayersObjects(self));

        // send the monsters object to the new player
        socket.emit('currentMonsters', getMonstersObjects(self));

        // update all other players of the new player
        socket.broadcast.emit('newPlayer', getPlayersObjects(self)[socket.id]);

        // When a client disconnects from the server
        socket.on('disconnect', () => {
            console.log(`User: ${socket.id} has disconnected from the server`);

            // remove player from server
            removePlayer(self, socket.id);

            // remove this player from our players object
            delete players[socket.id];

            // emit a message to all players to remove this player
            io.emit('disconnection', socket.id);
        });

        // when a player moves, update the player data
        socket.on('playerInput', (inputData) => {
            handlePlayerInput(self, socket.id, inputData);
        });
    });
}

function update() {
    // Update all players
    this.players.getChildren().forEach((player) => {
        players[player.playerId].update();

        players[player.playerId].x = player.x;
        players[player.playerId].y = player.y;
        players[player.playerId].direction = player.direction;
        players[player.playerId].isMoving = player.isMoving;
        players[player.playerId].isAttacking = player.isAttacking;
    });

    // Update all monsters
    this.monsters.getChildren().forEach((monster) => {
        monsters[monster.monsterId].update();

        monsters[monster.monsterId].x = monster.x;
        monsters[monster.monsterId].y = monster.y;
        monsters[monster.monsterId].direction = monster.direction;
        monsters[monster.monsterId].isMoving = monster.isMoving;
    });

    // TODO: Will need to check if all monsters are dead and spawn more here

    // Emit event to all clients with update player data
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

// Add a newly connected player to the group of connected players
function addPlayer(self, player) {
    self.players.add(player);
}

// Add a newly spawned monster to the group of spawned monsters
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

// TODO: Will need a removeMonster function when monster death is implemented

// Returns an object that stores the server player data for sending to client
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

// Returns an object that stores the server monster data for sending to client
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
        }
    });
    return monstersObjects;
}

const game = new Phaser.Game(config);
window.gameLoaded();