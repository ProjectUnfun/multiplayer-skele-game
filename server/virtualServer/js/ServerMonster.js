class ServerMonster extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, image, id) {
        super(scene, x, y, image);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.image = image;
        this.monsterId = id;

        // Directions: down = 1, up = 2, left = 3, right = 4
        this.direction = 1;

        // spawn locations array
        this.spawnLocations = [
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

        // Set random spawn location
        this.spawnLocation = this.getNewSpawn();
        this.x = this.spawnLocation[0];
        this.y = this.spawnLocation[1];

        // Track when player is moving
        this.isMoving = false;

        // Track player movement option processing
        this.reduceStepCount = false;

        // Enable physics
        this.scene.physics.world.enable(this);

        // Config physics body
        this.body.setSize(32, 32);
        this.body.setOffset(8, 28);

        // Track movement processing
        this.stepCount = 64;
        this.maxStepCount = 64;

        // Add monster to scene
        this.scene.add.existing(this);
    }

    update() {
        this.checkMovement();
    }

    // Method determines monster movement
    checkMovement() {
        // When monster has moved enough steps
        if (this.stepCount < 0) this.reduceStepCount = false;

        // Check if monster has moved enough steps, change movement if it has
        if (this.reduceStepCount) {
            this.stepCount--;
        } else {
            let option = Math.floor(Math.random() * 5);
            this.movement(option);
            this.stepCount = this.maxStepCount;
        }
    }

    // Method moves monster based on random number received
    movement(movementOption) {
        // Check which option is given
        if (movementOption === 0) {
            this.body.setVelocityX(-playerVelocity);
            this.direction = 3;
            this.isMoving = true;
            this.reduceStepCount = true;
        } else if (movementOption === 1) {
            this.body.setVelocityX(playerVelocity);
            this.direction = 4;
            this.isMoving = true;
            this.reduceStepCount = true;
        } else if (movementOption === 2) {
            this.body.setVelocityY(-playerVelocity);
            this.direction = 2;
            this.isMoving = true;
            this.reduceStepCount = true;
        } else if (movementOption === 3) {
            this.body.setVelocityY(playerVelocity);
            this.direction = 1;
            this.isMoving = true;
            this.reduceStepCount = true;
        } else if (movementOption === 4) {
            this.body.setVelocity(0);
            this.isMoving = false;
            this.reduceStepCount = true;
        }
    }

    // Method returns new spawn location array
    getNewSpawn() {
        let index = Math.floor(Math.random() * 9);
        let location = this.spawnLocations[index];
        return location;
    }
}