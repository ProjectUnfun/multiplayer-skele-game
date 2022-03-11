// Collection of connected players
const players = {};

// Field stores player movement speed
const playerVelocity = 160;

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

    // When a client connects to the server
    io.on('connection', (socket) => {
        console.log(`User: ${socket.id} has connected to the server`);

        // create a new player object in the players group
        players[socket.id] = new ServerPlayer(self, 0, 0, 'player', socket.id);

        // add player to server
        addPlayer(self, players[socket.id]);

        // send the players object to the new player
        socket.emit('currentPlayers', getPlayersObjects(self));

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

function update(time) {
    this.players.getChildren().forEach((player) => {
        // update player
        players[player.playerId].update();

        // Update player data
        players[player.playerId].x = player.x;
        players[player.playerId].y = player.y;
        players[player.playerId].direction = player.direction;
        players[player.playerId].isMoving = player.isMoving;
        players[player.playerId].isAttacking = player.isAttacking;
    });

    // Emit event to all clients with update player position data
    io.emit('playerUpdates', getPlayersObjects(this));
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

// Remove a disconnected player from the group of connected players
function removePlayer(self, Id) {
    self.players.getChildren().forEach((player) => {
        if (Id === player.playerId) {
            player.destroy();
        }
    });
}

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

const game = new Phaser.Game(config);
window.gameLoaded();