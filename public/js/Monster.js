class Monster extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, images, id) {
        super(scene, x, y, images);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.images = images;
        this.monsterId = id;

        // Directions: down = 1, up = 2, left = 3, right = 4
        this.direction = 1;

        // Track movement status
        this.isMoving = false;

        // Track attack status
        this.isAttacking = false;

        // Enable physics
        this.scene.physics.world.enable(this);

        // Config the physics body
        this.body.setSize(32, 32);
        this.body.setOffset(16, 22);

        // Track health and death status
        this.health = 3;
        this.maxHealth = 3;
        this.isDead = false;

        // Create monster animations
        this.createWalkAnimations();
        this.createAttackAnimations();

        // Create health bar
        this.createHealthBar();

        // Set the default animation frame
        this.setFrame(18);

        // Add the monster to the scene
        this.scene.add.existing(this);
    }

    update() {
        // Check if monster has died
        this.checkDeath();

        // Handle movement animations & update health bar if monster is alive
        if (this.isDead === false) {
            this.checkAttack();
            this.checkStill();
            this.checkMovement();
            this.updateHealthBar();
        } else {
            // Stop all animations on death
            this.anims.stop();
        }
    }

    // Handle movement animations
    checkMovement() {
        if (this.isMoving && this.isAttacking === false) {
            if (this.direction === 1) {
                this.anims.play("down", true);
            } else if (this.direction === 2) {
                this.anims.play("up", true);
            } else if (this.direction === 3) {
                this.anims.play("left", true);
            } else if (this.direction === 4) {
                this.anims.play("right", true);
            }
        }
    }

    // Method checks if monster is not moving or attacking and sets animation frame
    checkStill() {
        // If none of the cursors are being pressed, and the monster is not attacking
        if (this.isMoving === false && this.isAttacking === false) {
            // Stop animations
            this.anims.stop();

            // Check which direction monster is facing and set animation frame accordingly
            if (this.direction === 1) {
                this.anims.play("down", true);
                this.anims.stop();
                this.setFrame(18);
            } else if (this.direction === 2) {
                this.anims.play("up", true);
                this.anims.stop();
                this.setFrame(0);
            } else if (this.direction === 3) {
                this.anims.play("left", true);
                this.anims.stop();
                this.setFrame(9);
            } else if (this.direction === 4) {
                this.anims.play("right", true);
                this.anims.stop();
                this.setFrame(27);
            }
        }
    }

    // Handle attack animations
    checkAttack() {
        if (this.isAttacking) {
            // Check direction; play animation
            if (this.direction === 1) {
                this.anims.play("attackDown", true);
            } else if (this.direction === 2) {
                this.anims.play("attackUp", true);
            } else if (this.direction === 3) {
                this.anims.play("attackLeft", true);
            } else if (this.direction === 4) {
                this.anims.play("attackRight", true);
            }
        }
    }

    // Method generates movement frames for monster walking animations
    createWalkAnimations() {
        let rateOfFrames = 15;
        let repeatValue = 0;

        this.anims.create({
            key: "up",
            frames: this.anims.generateFrameNumbers("monsterWalk", {
                start: 0,
                end: 8,
            }),
            frameRate: rateOfFrames,
            repeat: repeatValue,
        });

        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("monsterWalk", {
                start: 9,
                end: 17,
            }),
            frameRate: rateOfFrames,
            repeat: repeatValue,
        });

        this.anims.create({
            key: "down",
            frames: this.anims.generateFrameNumbers("monsterWalk", {
                start: 18,
                end: 26,
            }),
            frameRate: rateOfFrames,
            repeat: repeatValue,
        });

        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("monsterWalk", {
                start: 27,
                end: 35,
            }),
            frameRate: rateOfFrames,
            repeat: repeatValue,
        });
    }

    // Method generates striking frames for monster attacking animations
    createAttackAnimations() {
        let rateOfFrames = 20;
        let repeatValue = 0;

        this.anims.create({
            key: "attackUp",
            frames: this.anims.generateFrameNumbers("monsterAttack", {
                start: 0,
                end: 5,
            }),
            frameRate: rateOfFrames,
            yoyo: true,
            repeat: repeatValue,
        });

        this.anims.create({
            key: "attackLeft",
            frames: this.anims.generateFrameNumbers("monsterAttack", {
                start: 6,
                end: 11,
            }),
            frameRate: rateOfFrames,
            yoyo: true,
            repeat: repeatValue,
        });

        this.anims.create({
            key: "attackDown",
            frames: this.anims.generateFrameNumbers("monsterAttack", {
                start: 12,
                end: 17,
            }),
            frameRate: rateOfFrames,
            yoyo: true,
            repeat: repeatValue,
        });

        this.anims.create({
            key: "attackRight",
            frames: this.anims.generateFrameNumbers("monsterAttack", {
                start: 18,
                end: 23,
            }),
            frameRate: rateOfFrames,
            yoyo: true,
            repeat: repeatValue,
        });
    }

    // Method creates the monster health bar
    createHealthBar() {
        this.healthBar = this.scene.add.graphics();
        this.updateHealthBar();
    }

    // Method updates the location and fullness of monster health bar
    updateHealthBar() {
        this.healthBar.clear();
        this.healthBar.fillStyle(0xffffff, 1);
        this.healthBar.fillRect(this.x - 24, this.y - 36, 48, 5);
        this.healthBar.fillGradientStyle(0x00ff00, 0x00ff00, 4);
        this.healthBar.fillRect(
            this.x - 24,
            this.y - 36,
            (48 * this.health) / this.maxHealth,
            5
        );
    }

    // Cheif monster has died, change opacity accordingly
    checkDeath() {
        if (this.isDead === true) {
            this.alpha = 0.5;
            this.healthBar.clear();
            this.healthBar.fillStyle(0xff0000, 1);
            this.healthBar.fillRect(this.x - 24, this.y - 36, 48, 5);
        } else if (this.alpha !== 1) {
            this.alpha = 1;
        }
    }
}