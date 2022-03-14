class ScoreScene extends Phaser.Scene {
    constructor() {
        super("Score");
    }

    init() {
        // Create a reference to the game scene
        this.gameScene = this.scene.get("Game");
    }

    preload() { }

    create() {
        // Setup methods
        this.setupUiElements();
        this.setupEvents();
    }

    // Method creates the counter text and icon
    setupUiElements() {
        // Create kills text
        this.killsText = this.add.text(250, 9, "Kills: 0", {
            fontSize: "24px",
            fontStyle: "bold",
            fill: "#fff",
        });

        // Create deaths text
        this.deathsText = this.add.text(450, 9, "Deaths: 0", {
            fontSize: "24px",
            fontStyle: "bold",
            fill: "#fff",
        });

        // Create kills icon
        this.killsIcon = this.add.image(230, 20, "killsIcon");

        // Create deaths icon
        this.deathsIcon = this.add.image(430, 20, "deathsIcon");
    }

    // Method creates the event listener for counter updates
    setupEvents() {
        this.gameScene.events.on("updateScore", (kills, deaths) => {
            // Update fields
            this.killsText.setText(`Kills: ${kills}`);
            this.deathsText.setText(`Deaths: ${deaths}`);
        });
    }
}