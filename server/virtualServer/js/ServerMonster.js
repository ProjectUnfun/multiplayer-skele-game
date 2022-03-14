class ServerMonster extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, image, id, name) {
        super(scene, x, y, image);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.image = image;
        this.monsterId = id;
        this.name = name;

        // Directions: down = 1, up = 2, left = 3, right = 4
        this.direction = 1;

        // Set default random spawning location
        this.spawnLocation = this.getNewSpawn();
        this.x = this.spawnLocation[0];
        this.y = this.spawnLocation[1];

        // Enable physics
        this.scene.physics.world.enable(this);

        // Config monster
        this.configMonsterMovement();
        this.configMonsterDamage();
        this.configMonsterAttack();

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
                    this.canBeAttacked = true;
                },
                [],
                this
            );
            this.respawnCalled = true;
        }
    }

    // Method configs movement
    configMonsterMovement() {
        // Track movement
        this.isMoving = false;

        // Track movement option processing
        this.reduceStepCount = false;

        // Set default stepCount & maxStepCount
        this.stepCount = 64;
        this.maxStepCount = 64;
    }

    // Method configs damage taking
    configMonsterDamage() {
        // Config physics body
        this.body.setSize(32, 32);
        this.body.setOffset(16, 22);

        // Track death status
        this.isDead = false;

        // Track attackable state
        this.canBeAttacked = true;

        // Track respawn functionality calls
        this.respawnCalled = false;

        // Health (Hit Points, HP) values
        this.health = 2;
        this.maxHealth = 2;
    }

    // Method configs damage dealing
    configMonsterAttack() {
        // Track attack status
        this.isAttacking = false;

        // Attack power value
        this.attackValue = 1;

        // When a monster and player overlap, monster attacks
        this.scene.physics.add.overlap(
            this,
            this.scene.players,
            this.handleAttack,
            undefined,
            this
        );
    }

    // Method handles monster attacking players
    handleAttack(monster, player) {
        if (player.canBeAttacked === true && this.isAttacking === false && this.isDead === false) {
            // Stop movement, alter attacking flag
            this.body.setVelocity(0);
            this.isAttacking = true;

            // Make target unattackable to prevent multiple hits in quick succession
            player.stopAttackable();

            // Update target health
            player.updateHealth(this.attackValue);

            // Make target attackable and alter attack flag after .6 seconds
            this.scene.time.delayedCall(
                600,
                () => {
                    player.startAttackable();
                    this.isAttacking = false;
                },
                [],
                this
            );

        }
    }

    // Method alters flag that determines whether this object is a valid target
    stopAttackable() {
        this.canBeAttacked = false;
    }

    // Method alters flag that determines whether this object is a valid target
    startAttackable() {
        this.canBeAttacked = true;
    }

    // Method updates monster health value when attacked
    updateHealth(damage) {
        this.health -= damage;
        console.log(`Monster: ${this.name} has been damaged`);
    }

    // Method handles monster death
    checkDeath() {
        if (this.health <= 0) {
            // Alter death flag, stop movement, alter movement flag, and alter attackable flag
            this.isDead = true;
            this.body.setVelocity(0);
            this.isMoving = false;
            this.canBeAttacked = false;
            // this.health = this.maxHealth;
        }
    }

    // Method determines monster movement parameters
    checkMovement() {
        // When monster has moved the assigned random amount of steps, alter processing flag
        if (this.stepCount < 0) this.reduceStepCount = false;

        // Reduce stepCount until flag is altered
        if (this.reduceStepCount) {
            this.stepCount--;
        } else {
            // Assign a new random movement action for a random amount of steps
            let option = Math.floor(Math.random() * 5);
            this.movement(option);
            this.stepCount = Math.floor(Math.random() * this.maxStepCount);
        }
    }

    // Method assigns movement option based on random number received
    movement(movementOption) {
        // Check given option then assign velocity and direction, alter movement and processing flags
        if (movementOption === 0) {
            this.body.setVelocityX(-moveSpeed);
            this.body.setVelocityY(0);
            this.direction = 3;
            this.isMoving = true;
            this.reduceStepCount = true;
        } else if (movementOption === 1) {
            this.body.setVelocityX(moveSpeed);
            this.body.setVelocityY(0);
            this.direction = 4;
            this.isMoving = true;
            this.reduceStepCount = true;
        } else if (movementOption === 2) {
            this.body.setVelocityY(-moveSpeed);
            this.body.setVelocityX(0);
            this.direction = 2;
            this.isMoving = true;
            this.reduceStepCount = true;
        } else if (movementOption === 3) {
            this.body.setVelocityY(moveSpeed);
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
        let location = spawnLocations[index];
        return location;
    }

    // Method returns health value
    getHealth() {
        return this.health;
    }
}