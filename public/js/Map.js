class Map {
    constructor(
        scene,
        key,
        tileSetName,
        groundLayerName,
        blockedLayerName,
        deco1LayerName
    ) {
        this.scene = scene; // The scene this map belongs to
        this.key = key; // Tiled JSON file key name
        this.tileSetName = tileSetName; // Tiled tile set image key name
        this.groundLayerName = groundLayerName; // Bottom layer
        this.blockedLayerName = blockedLayerName; // Blocked layer
        this.deco1LayerName = deco1LayerName; // Decorative layer
        this.createMap();
    }

    createMap() {
        // Make the tile map
        this.map = this.scene.make.tilemap({ key: this.key });

        // Store the tile set
        this.tiles = this.map.addTilesetImage(this.tileSetName);

        // Store the background layer
        this.groundLayer = this.map.createLayer(
            this.groundLayerName,
            this.tiles,
            0,
            0
        );

        // Store the blocked layer
        this.blockedLayer = this.map.createLayer(
            this.blockedLayerName,
            this.tiles,
            0,
            0
        );

        // Store the deco1 layer
        this.deco1Layer = this.map.createLayer(
            this.deco1LayerName,
            this.tiles,
            0,
            0
        );

        // Set the world collision bounds
        this.scene.physics.world.bounds.width = this.map.widthInPixels;
        this.scene.physics.world.bounds.height = this.map.heightInPixels;

        // Restrain game camera from leaving map bounds
        this.scene.cameras.main.setBounds(
            0,
            0,
            this.map.widthInPixels,
            this.map.heightInPixels
        );
    }
}