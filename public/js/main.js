var config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: { y: 0 }
        }
    },
    dom: {
        createContainer: true
    },
    scene: [
        LoginScene,
        GameScene,
        ScoreScene,
    ],
};

var game = new Phaser.Game(config);