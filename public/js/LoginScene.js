class LoginScene extends Phaser.Scene {
    constructor() {
        super("Login");
    }

    preload() {
        this.load.html("form", "form.html");
    }

    create() {
        this.nameInput = this.add.dom(395, 360).createFromCache("form");

        this.playerName = "";

        this.gotTheName = false;

        // Display the background image
        this.backgroundImage = this.add.image(0, 0, "skeleBG");
        this.backgroundImage.setOrigin(0);

        // Display Title Text
        this.gameName = this.add.text(390, 110, "Legio Mortis\n     Online", {
            color: "#DFDFDF",
            fontSize: 96,
            fontFamily: "Lucifer",
        }).setOrigin(0.5);

        // Display instruction text
        this.message = this.add.text(395, 290, "Enter your name:", {
            color: "#DFDFDF",
            fontSize: 48,
            fontFamily: "Lucifer",
        }).setOrigin(0.5);

        // Display credits text
        this.unfun = this.add.text(390, 520, "Credits for art:\nStephen Challener, Johannes Sjölund, David Conway Jr.,\nCarlo Enrico Victoria,bluecarrot16, Michael Whitlock,\nMatthew Krohn, Thane Brimhall, laetissima, Joe White,\nNila122, DarkwallLKE, Tuomo Untinen, Daniel Eddeland,\ngr3yh47, Yamilian, ElizaWy, Dr. Jamgo, Casper Nilsson,\nJohann CHARLOT, Skyler Robert Colladay, Lanea Zimmerman,\nCharles Sanchez, Manuel Riecke, Daniel Armstrong\n\nCredits for music:\nbensound.com", {
            color: "#DFDFDF",
            fontSize: 12,
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.returnKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        this.returnKey.on("down", event => {
            let name = this.nameInput.getChildByName("name");
            if (name.value != "") {
                this.playerName = name.value;
                this.gotTheName = true;
            }
        });

        // Background music
        this.gameMusicAudio = this.sound.add("bgTrack", {
            loop: true,
            volume: 0.1,
        });

        // Play the background music
        this.gameMusicAudio.play();
    }

    update() {
        // Once name has been entered, start game scene passing the name
        if (this.gotTheName) {
            this.scene.start("Game", { name: this.playerName });
        }
    }
}