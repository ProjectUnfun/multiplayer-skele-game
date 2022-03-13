class ServerPotion extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, image, id) {
        super(scene, x, y, image);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.image = image;
        this.potionId = id;

        // Set default random spawning location
        this.spawnLocation = this.getNewSpawn();
        this.x = this.spawnLocation[0];
        this.y = this.spawnLocation[1];

        // Track respawn functionality calls
        this.respawnWasCalled = false;

        // Config potion
        this.configPotionEffects();

        // Enable physics
        this.scene.physics.world.enable(this);

        // Add monster to scene
        this.scene.add.existing(this);
    }

    update() { }

    // Config potion use
    configPotionEffects() {
        // Track active status
        this.isActive = true;

        // When a player and potion overlap, heal player
        this.scene.physics.add.overlap(
            this,
            this.scene.players,
            this.handleOverlap,
            undefined,
            this
        );
    }

    // Method handles player using active potion
    handleOverlap(potion, player) {
        if (potion.isActive === true) {
            player.usePotion();
            potion.isActive = false;

            let respawnTime = Math.floor(Math.random() * 30000);
            if (respawnTime < 10000) respawnTime = 10000;

            // Reactivate potion
            if (this.respawnWasCalled === false) {
                this.scene.time.delayedCall(
                    respawnTime,
                    () => {
                        this.spawnLocation = this.getNewSpawn();
                        this.x = this.spawnLocation[0];
                        this.y = this.spawnLocation[1];
                        potion.isActive = true;
                        this.respawnWasCalled = false;
                    },
                    [],
                    this
                );
                this.respawnWasCalled = true;
            }
        }
    }

    // Method returns new spawn location array
    getNewSpawn() {
        let index = Math.floor(Math.random() * 10);
        let location = potionLocations[index];
        return location;
    }
}