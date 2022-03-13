class ServerPlayer extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, image, id) {
        super(scene, x, y, image);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.image = image;
        this.playerId = id;

        // Directions: down = 1, up = 2, left = 3, right = 4
        this.direction = 1;

        // Set default random spawning location
        this.spawnLocation = this.getNewSpawn();
        this.x = this.spawnLocation[0];
        this.y = this.spawnLocation[1];

        // Track movement status
        this.isMoving = false;

        // Input tracking object
        this.input = {
            left: false,
            right: false,
            up: false,
            down: false,
            space: false,
        };

        // Enable physics
        this.scene.physics.world.enable(this);

        // Config player
        this.configPlayerAttack();
        this.configPlayerDamage();

        // Add player to scene
        this.scene.add.existing(this);
    }

    update() {
        // Check if player has died
        this.checkDeath();

        // console.log(`Player X position = ${this.x}`);
        // console.log(`Player Y position = ${this.y}`);

        // If player is alive, update normally
        if (this.isDead === false) {
            this.checkAttacking();
            this.body.stop();
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

    // Method handles player input based on input data sent from client
    checkMovement() {
        if (this.input.left) {
            this.body.setVelocityX(-moveSpeed);
            this.body.setVelocityY(0);
            this.isMoving = true;
            this.direction = 3;
        } else if (this.input.right) {
            this.body.setVelocityX(moveSpeed);
            this.body.setVelocityY(0);
            this.isMoving = true;
            this.direction = 4;
        } else if (this.input.up) {
            this.body.setVelocityY(-moveSpeed);
            this.body.setVelocityX(0);
            this.isMoving = true;
            this.direction = 2;
        } else if (this.input.down) {
            this.body.setVelocityY(moveSpeed);
            this.body.setVelocityX(0);
            this.isMoving = true;
            this.direction = 1;
        } else {
            this.setVelocityX(0);
            this.setVelocityY(0);
            this.isMoving = false;
        }
    }

    // Method configs player damage taking fields
    configPlayerDamage() {
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
        this.health = 5;
        this.maxHealth = 5;
    }

    // Method configs defaults for player attacks
    configPlayerAttack() {
        // Player hitbox location tracking object
        this.hitboxLocation = {
            x: 0,
            y: 0,
        };

        // Attack power value
        this.attackValue = 1;

        // Track attack status
        this.isAttacking = false;

        // Create player hitbox physics body
        this.hitbox = this.scene.add.image(this.x, this.y, "attackBox", 0);
        this.scene.physics.world.enable(this.hitbox);

        // Deactivate default hitbox
        this.makeHitboxInactive();

        // Player hitbox vs other players overlap method call
        this.scene.physics.add.overlap(
            this.hitbox,
            this.scene.players,
            this.handleEnemyAttacked,
            undefined,
            this
        );

        // Player hitbox vs monsters for overlap method call
        this.scene.physics.add.overlap(
            this.hitbox,
            this.scene.monsters,
            this.handleMonsterAttacked,
            undefined,
            this
        )
    }

    // Method handles player attack hiting other player
    handleEnemyAttacked(hitbox, enemy) {
        if (this.isAttacking && enemy.canBeAttacked === true && enemy.playerId !== this.playerId) {
            // Make enemy unattackable to prevent multiple hits in quick succession
            enemy.stopAttackable();

            // Update enemy health
            enemy.updateHealth(this.attackValue);

            // Enable player attack repetition after .6 seconds
            this.scene.time.delayedCall(
                600,
                () => {
                    enemy.startAttackable();
                },
                [],
                this
            );
        }
    }

    // Method handles player attacking hiting monster
    handleMonsterAttacked(hitbox, enemy) {
        if (this.isAttacking && enemy.canBeAttacked === true) {
            // Prevent multiple hits in quick succession
            enemy.stopAttackable();

            // Update enemy health
            enemy.updateHealth(this.attackValue);

            // Enable player attack repitition on this target after .6 seconds
            this.scene.time.delayedCall(
                600,
                () => {
                    enemy.startAttackable();
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

    // Method updates the player health value when attacked
    updateHealth(damage) {
        this.health -= damage;
        console.log(`Player: ${this.playerId} has been damaged`);
    }

    // Method makes hitbox active for monster overlap checking
    makeHitboxActive() {
        // Set hitbox to active
        this.hitbox.setActive(true);

        // Activate hitbox overlap checking
        this.hitbox.body.onOverlap = true;
    }

    // Method makes hitbox inactive to prevent monster overlap checking
    makeHitboxInactive() {
        // Set hitbox to inactive
        this.hitbox.setActive(false);

        // Deactivate hitbox overlap checking
        this.hitbox.body.onOverlap = false;
    }

    // Method checks if player has pressing attack key and handles hitboxing
    checkAttacking() {
        // If space key input is passed and player is not already attacking
        if (this.input.space && this.isAttacking === false) {
            // Stop movement, alter attacking flag
            this.body.setVelocity(0);
            this.isAttacking = true;

            // Check direction & assign hitbox coord values
            if (this.direction === 1) {
                this.hitboxLocation.x = this.x;
                this.hitboxLocation.y = this.y + 24;
            } else if (this.direction === 2) {
                this.hitboxLocation.x = this.x;
                this.hitboxLocation.y = this.y - 16;
            } else if (this.direction === 3) {
                this.hitboxLocation.x = this.x - 16;
                this.hitboxLocation.y = this.y + 6;
            } else if (this.direction === 4) {
                this.hitboxLocation.x = this.x + 16;
                this.hitboxLocation.y = this.y + 6;
            }

            // Update location of hitbox
            this.hitbox.setPosition(
                this.hitboxLocation.x,
                this.hitboxLocation.y
            );

            // Activate hitbox for attack detection
            this.makeHitboxActive();

            // Delay player attack repetition by .3 seconds
            this.scene.time.delayedCall(
                300,
                () => {
                    this.makeHitboxInactive();
                    this.isAttacking = false;
                },
                [],
                this
            );
        }
    }

    // Method handles player death
    checkDeath() {
        if (this.health <= 0) {
            this.isDead = true;
            this.body.setVelocity(0);
            this.isMoving = false;
            this.canBeAttacked = false;
        }
    }

    // Method simulates potion use
    usePotion() {
        this.health = this.maxHealth;
        console.log(`Player: ${this.playerId} has used a Potion`);
    }

    // Method returns new spawn location array
    getNewSpawn() {
        let index = Math.floor(Math.random() * 10);
        let location = spawnLocations[index];
        return location;
    }
}