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
}

function create() {
    // Create a secondary reference to the current scene ???
    const self = this;

    // Create a physics group for all connected players
    this.players = this.physics.add.group();

    // When a client connects to the server
    io.on('connection', (socket) => {
        console.log(`User: ${socket.id} has connected to the server`);

        // create a new player object in the players group
        players[socket.id] = {
            x: Math.floor(Math.random() * 700) + 50,
            y: Math.floor(Math.random() * 500) + 50,
            playerId: socket.id,
            input: {
                left: false,
                right: false,
                up: false,
                down: false,
            },
            // Directions: 1 = down, 2 = up, 3 = left, 4 = right
            direction: 1,
            isMoving: false,
            isAttacking: false,
        };

        // add player to server
        addPlayer(self, players[socket.id]);

        // send the players object to the new player
        socket.emit('currentPlayers', players);

        // update all other players of the new player
        socket.broadcast.emit('newPlayer', players[socket.id]);

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
    this.players.getChildren().forEach((player) => {
        // Store player input status data
        const input = players[player.playerId].input;

        // Stop player physics body from moving
        player.body.stop();

        // Calculate player position based on player input passed from client
        if (input.left) {
            player.body.setVelocityX(-playerVelocity);
            player.body.setVelocityY(0);
            player.isMoving = true;
            player.direction = 3;
        } else if (input.right) {
            player.body.setVelocityX(playerVelocity);
            player.body.setVelocityY(0);
            player.isMoving = true;
            player.direction = 4;
        } else if (input.up) {
            player.body.setVelocityY(-playerVelocity);
            player.body.setVelocityX(0);
            player.isMoving = true;
            player.direction = 2;
        } else if (input.down) {
            player.body.setVelocityY(playerVelocity);
            player.body.setVelocityX(0);
            player.isMoving = true;
            player.direction = 1;
        } else {
            player.setVelocityX(0);
            player.setVelocityY(0);
            player.isMoving = false;
        }

        // Ensure default direction is setup
        if (player.direction === undefined) {
            player.direction = 1;
        }

        // Ensure default isMoving is setup
        if (player.isMoving === undefined) {
            player.isMoving = false;
        }

        // Update player location & direction fields
        players[player.playerId].x = player.x;
        players[player.playerId].y = player.y;
        players[player.playerId].direction = player.direction;
        players[player.playerId].isMoving = player.isMoving;
    });

    // Emit event to all clients with update player position data
    io.emit('playerMoveUpdates', players);
}

// Assign the input received from a client to the appropriate server player
function handlePlayerInput(self, playerId, input) {
    self.players.getChildren().forEach((player) => {
        if (playerId === player.playerId) {
            players[player.playerId].input = input;
        }
    });
}

// Add a newly connected player to the group of connected players
function addPlayer(self, playerInfo) {
    const player = self.physics.add.image(playerInfo.x, playerInfo.y, 'player');
    player.body.setSize(32, 32);
    player.playerId = playerInfo.playerId;
    self.players.add(player);
}

// Remove a disconnected player from the group of connected players
function removePlayer(self, playerId) {
    self.players.getChildren().forEach((player) => {
        if (playerId === player.playerId) {
            player.destroy();
        }
    });
}

const game = new Phaser.Game(config);
window.gameLoaded();