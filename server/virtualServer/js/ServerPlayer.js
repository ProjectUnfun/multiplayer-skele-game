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

        // Track when player is moving
        this.isMoving = false;

        // Track when player is attacking
        this.isAttacking = false;

        // Track when player has been killed
        this.isDead = false;

        // Track if player respawn call has happened
        this.respawnCalled = false;

        // Input tracking fields
        this.input = {
            left: false,
            right: false,
            up: false,
            down: false,
            space: false,
        };

        // Enable physics
        this.scene.physics.world.enable(this);

        // Config attack
        this.configPlayerAttack();

        // Config damages
        this.configPlayerDamage();

        // Add player to scene
        this.scene.add.existing(this);
    }

    update() {
        // Check if player has died
        this.checkDeath();

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
                    this.x = Math.floor(Math.random() * 700) + 50;
                    this.y = Math.floor(Math.random() * 500) + 50;
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

    checkMovement() {
        // Calculate player position based on player input passed from client
        if (this.input.left) {
            this.body.setVelocityX(-playerVelocity);
            this.body.setVelocityY(0);
            this.isMoving = true;
            this.direction = 3;
        } else if (this.input.right) {
            this.body.setVelocityX(playerVelocity);
            this.body.setVelocityY(0);
            this.isMoving = true;
            this.direction = 4;
        } else if (this.input.up) {
            this.body.setVelocityY(-playerVelocity);
            this.body.setVelocityX(0);
            this.isMoving = true;
            this.direction = 2;
        } else if (this.input.down) {
            this.body.setVelocityY(playerVelocity);
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
        this.body.setSize(32, 32);
        this.canBeAttacked = true;

        // Player hitpoints tracking fields
        this.health = 4;
        this.maxHealth = 4;
    }

    // Method make hitbox active for monster overlap checking
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

    // Method configs defaults for player attacks
    configPlayerAttack() {
        // Player hitbox location tracking object
        this.hitboxLocation = {
            x: 0,
            y: 0,
        };

        // Player attack power value
        this.attackValue = 1;

        // Create player hitbox physics body
        this.hitbox = this.scene.add.image(this.x, this.y, "attackBox", 0);
        this.scene.physics.world.enable(this.hitbox);

        // Deactivate default hitbox
        this.makeHitboxInactive();

        // Player hitbox vs monsters overlap method call
        this.scene.physics.add.overlap(
            this.hitbox,
            this.scene.players,
            this.handleEnemyAttacked,
            undefined,
            this
        );
    }

    // Method handles player attack hiting monster
    handleEnemyAttacked(hitbox, enemy) {
        if (this.isAttacking && enemy.canBeAttacked === true) {
            // Make enemy unattackable to prevent multiple hits in quick succession
            enemy.stopAttackable();

            // Update enemy health
            enemy.updateHealth(this.attackValue);

            // Delay player attack repetition by .3 seconds
            this.scene.time.delayedCall(
                300,
                () => {
                    enemy.startAttackable();
                },
                [],
                this
            );
        }
    }

    stopAttackable() {
        this.canBeAttacked = false;
    }

    startAttackable() {
        this.canBeAttacked = true;
    }

    // Method updates the player health value when attacked
    updateHealth(damage) {
        this.health -= damage;
        console.log(`Player: ${this.playerId} has been damaged`);
    }

    // Method checks is player is pressing attack key and handles hitboxing
    checkAttacking() {
        // If the space key is pressed and the player is not already attacking
        if (this.input.space && this.isAttacking === false) {
            // Stop movement, alter attacking flag
            this.body.setVelocity(0);
            this.isAttacking = true;

            // Check direction & assign hitbox coord values
            if (this.direction === 1) {
                this.hitboxLocation.x = this.x;
                this.hitboxLocation.y = this.y + 33;
            } else if (this.direction === 2) {
                this.hitboxLocation.x = this.x;
                this.hitboxLocation.y = this.y - 33;
            } else if (this.direction === 3) {
                this.hitboxLocation.x = this.x - 33;
                this.hitboxLocation.y = this.y + 6;
            } else if (this.direction === 4) {
                this.hitboxLocation.x = this.x + 33;
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
                    // Reset flag & deactivate hitbox
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
        }
    }
}