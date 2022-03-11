class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, images, id) {
        super(scene, x, y, images);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.images = images;
        this.playerId = id;

        // Directions: down = 1, up = 2, left = 3, right = 4
        this.direction = 1;

        // isMoving tracks player movement
        this.isMoving = false;

        // Enable physics
        this.scene.physics.world.enable(this);

        // Setup physics body
        this.body.setSize(32, 32);

        // Create player walk animations
        this.createWalkAnimations();

        // Set the default animation frame
        this.setFrame(18);

        // Add player to scene
        this.scene.add.existing(this);
    }

    update() {
        // Check for player lack of movement
        this.checkIfPlayerIsStill();

        // Check for player movement
        this.checkIfPlayerIsMoving();
    }

    // Method generates movement frames for player walking animations
    createWalkAnimations() {
        let rateOfFrames = 15;
        let repeatValue = 0;

        this.anims.create({
            key: "walkUp",
            frames: this.anims.generateFrameNumbers("playerWalk", {
                start: 0,
                end: 8,
            }),
            frameRate: rateOfFrames,
            repeat: repeatValue,
        });

        this.anims.create({
            key: "walkLeft",
            frames: this.anims.generateFrameNumbers("playerWalk", {
                start: 9,
                end: 17,
            }),
            frameRate: rateOfFrames,
            repeat: repeatValue,
        });

        this.anims.create({
            key: "walkDown",
            frames: this.anims.generateFrameNumbers("playerWalk", {
                start: 18,
                end: 26,
            }),
            frameRate: rateOfFrames,
            repeat: repeatValue,
        });

        this.anims.create({
            key: "walkRight",
            frames: this.anims.generateFrameNumbers("playerWalk", {
                start: 27,
                end: 35,
            }),
            frameRate: rateOfFrames,
            repeat: repeatValue,
        });
    }

    // Method checks if player is not moving or attacking and sets animation frame
    checkIfPlayerIsStill() {
        // If none of the cursors are being pressed, and the player is not attacking
        if (this.isMoving == false) {
            // Stop animations
            this.anims.stop();

            // Check which direction player is facing and set animation frame accordingly
            if (this.direction === 1) {
                this.anims.play("walkDown", true);
                this.anims.stop();
                this.setFrame(18);
            } else if (this.direction === 2) {
                this.anims.play("walkUp", true);
                this.anims.stop();
                this.setFrame(0);
            } else if (this.direction === 3) {
                this.anims.play("walkLeft", true);
                this.anims.stop();
                this.setFrame(9);
            } else if (this.direction === 4) {
                this.anims.play("walkRight", true);
                this.anims.stop();
                this.setFrame(27);
            }
        }
    }

    // Method checks if player moving and plays corresponding animation
    checkIfPlayerIsMoving() {
        if (this.scene.cursors.left.isDown) {
            this.anims.play("walkLeft", true);
        } else if (this.scene.cursors.right.isDown) {
            this.anims.play("walkRight", true);
        } else if (this.scene.cursors.up.isDown) {
            this.anims.play("walkUp", true);
        } else if (this.scene.cursors.down.isDown) {
            this.anims.play("walkDown", true);
        }
    }
}