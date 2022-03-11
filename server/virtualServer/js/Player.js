class Player extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, image, id) {
        super(scene, x, y, image);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.image = image;
        this.playerId = id;

        // Directions: down = 1, up = 2, left = 3, right = 4
        this.direction = 1;

        // isMoving tracks player movement
        this.isMoving = false;

        // Input tracking fields
        this.input = {
            left: false,
            right: false,
            up: false,
            down: false,
        };

        // Enable physics
        this.scene.physics.world.enable(this);

        // Setup physics body
        this.body.setSize(32, 32);

        // Add player to scene
        this.scene.add.existing(this);
    }

    update() {
        this.body.stop();
        this.checkInput();
    }

    checkInput() {
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
}