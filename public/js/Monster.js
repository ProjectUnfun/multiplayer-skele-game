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

        // isMoving tracks player movement
        this.isMoving = false;

        // Enable physics
        this.scene.physics.world.enable(this);

        // Config the physics body
        this.body.setSize(32, 32);
        this.body.setOffset(8, 28);

        // Config health fields
        this.health = 3;
        this.maxHealth = 3;
        this.isDead = false;

        // Create monster walk animations
        this.createWalkAnimations()

        // Create health bar
        this.createHealthBar();

        // Set the default animation frame
        this.setFrame(7);

        // Add the monster to the scene
        this.scene.add.existing(this);
    }

    update() {
        this.checkDeath();

        if (this.isDead === false) {
            // Check which direction player is facing and set animation frame accordingly
            if (this.isMoving == true) {
                if (this.direction === 1) {
                    this.anims.play("down", true);
                } else if (this.direction === 2) {
                    this.anims.play("up", true);
                } else if (this.direction === 3) {
                    this.anims.play("left", true);
                } else if (this.direction === 4) {
                    this.anims.play("right", true);
                }
            } else {
                this.anims.stop();
                if (this.direction === 1) {
                    this.setFrame(7);
                } else if (this.direction === 2) {
                    this.setFrame(1);
                } else if (this.direction === 3) {
                    this.setFrame(10);
                } else if (this.direction === 4) {
                    this.setFrame(4);
                }
            }

            this.updateHealthBar();
        } else {
            this.anims.stop();
            if (this.direction === 1) {
                this.setFrame(7);
            } else if (this.direction === 2) {
                this.setFrame(1);
            } else if (this.direction === 3) {
                this.setFrame(10);
            } else if (this.direction === 4) {
                this.setFrame(4);
            }
        }
    }

    // Method generates movement frames for monster walking animations
    createWalkAnimations() {
        this.anims.create({
            key: "up",
            frames: this.anims.generateFrameNumbers("monsterWalk", {
                start: 0,
                end: 2,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("monsterWalk", {
                start: 3,
                end: 5,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "down",
            frames: this.anims.generateFrameNumbers("monsterWalk", {
                start: 6,
                end: 8,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("monsterWalk", {
                start: 9,
                end: 11,
            }),
            frameRate: 10,
            repeat: -1,
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

    checkDeath() {
        if (this.isDead === true) {
            this.alpha = 0.5;
            this.healthBar.clear();
            this.healthBar.fillStyle(0xff0000, 1);
            this.healthBar.fillRect(this.x - 24, this.y - 36, 48, 5);
        } else {
            this.alpha = 1;
        }
    }
}