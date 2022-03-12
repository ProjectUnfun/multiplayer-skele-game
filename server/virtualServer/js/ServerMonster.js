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

        // Track respawn functionality calls
        this.respawnCalled = false;

        // Track player death status
        this.isDead = false;

        // Enable physics
        this.scene.physics.world.enable(this);

        // Config damage taking
        this.configMonsterDamage();

        // Track movement processing
        this.stepCount = 64;
        this.maxStepCount = 64;

        // Add monster to scene
        this.scene.add.existing(this);
    }

    update() {
        // Check for monster death
        this.checkDeath();

        // Update monster if alive, or call respawn if respawn not already called
        if (this.isDead === false) {
            this.checkMovement();
        } else if (this.respawnCalled === false) {
            // Wait 5 seconds and respawn
            this.scene.time.delayedCall(
                5000,
                () => {
                    let location = this.getNewSpawn();
                    this.x = location[0];
                    this.y = location[1];
                    this.health = this.maxHealth;
                    this.isDead = false;
                    this.respawnCalled = false;
                },
                [],
                this
            );
            this.respawnCalled = true;
        }
    }

    // Method configs monster damage taking fields
    configMonsterDamage() {
        // Config physics body
        this.body.setSize(32, 32);
        this.body.setOffset(16, 22);

        // Monster attackable state
        this.canBeAttacked = true;

        // Monster hitpoints tracking fields
        this.health = 3;
        this.maxHealth = 3;
    }

    stopAttackable() {
        this.canBeAttacked = false;
    }

    startAttackable() {
        this.canBeAttacked = true;
    }

    // Method updates the monster health value when attacked
    updateHealth(damage) {
        this.health -= damage;
        console.log(`Monster: ${this.monsterId} has been damaged`);
    }

    // Method handles player death
    checkDeath() {
        if (this.health <= 0) {
            this.isDead = true;
            this.body.setVelocity(0);
            this.isMoving = false;
        }
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
            this.stepCount = Math.floor(Math.random() * this.maxStepCount);
        }
    }

    // Method moves monster based on random number received
    movement(movementOption) {
        // Check which option is given
        if (movementOption === 0) {
            this.body.setVelocityX(-playerVelocity);
            this.body.setVelocityY(0);
            this.direction = 3;
            this.isMoving = true;
            this.reduceStepCount = true;
        } else if (movementOption === 1) {
            this.body.setVelocityX(playerVelocity);
            this.body.setVelocityY(0);
            this.direction = 4;
            this.isMoving = true;
            this.reduceStepCount = true;
        } else if (movementOption === 2) {
            this.body.setVelocityY(-playerVelocity);
            this.body.setVelocityX(0);
            this.direction = 2;
            this.isMoving = true;
            this.reduceStepCount = true;
        } else if (movementOption === 3) {
            this.body.setVelocityY(playerVelocity);
            this.body.setVelocityX(0);
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