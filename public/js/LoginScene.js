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

        this.gameName = this.add.text(395, 125, "Multiplayer\nSkele Game", {
            color: "#00FF00",
            fontSize: 72,
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.message = this.add.text(395, 250, "Enter your name:", {
            color: "#FFFFFF",
            fontSize: 60,
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
    }

    update() {
        // Once name has been entered, start game scene passing the name
        if (this.gotTheName) {
            this.scene.start("Game", { name: this.playerName });
        }
    }
}