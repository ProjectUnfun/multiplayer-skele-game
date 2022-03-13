class Potion extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, images, id) {
        super(scene, x, y, images);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.images = images;
        this.potionId = id;

        // Track active status
        this.isActive = true;

        // Create animation
        this.createPotionAnimations();

        // Enable physics
        this.scene.physics.world.enable(this);

        // Add the monster to the scene
        this.scene.add.existing(this);
    }

    update() {
        if (this.isActive === true) {
            this.alpha = 1;
            this.anims.play("fillPotion", true);
        } else {
            this.alpha = 0;
            this.anims.stop();
        }
    }

    // Method generates filling frames for potions
    createPotionAnimations() {
        let rateOfFrames = 8;
        let repeatValue = -1;

        this.anims.create({
            key: "fillPotion",
            frames: this.anims.generateFrameNumbers("potion", {
                start: 0,
                end: 11,
            }),
            frameRate: rateOfFrames,
            repeat: repeatValue,
        });
    }
}