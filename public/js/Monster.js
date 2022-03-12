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

        // Create monster walk animations
        this.createWalkAnimations()

        // Set the default animation frame
        this.setFrame(7);

        // Add the monster to the scene
        this.scene.add.existing(this);
    }

    update() {
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
}