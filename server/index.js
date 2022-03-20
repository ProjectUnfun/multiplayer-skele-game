const path = require('path');
const jsdom = require('jsdom');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

const DatauriParser = require("datauri/parser");
const parser = new DatauriParser();

const { JSDOM } = jsdom;

let port = process.env.PORT;
if (port == null || port == "") {
    port = 8081;
}

// Setup static directory to serve client files from
app.use(express.static('public', { root: __dirname + "/../" }));

// Serve client html page
app.get('/', function (req, res) {
    res.sendFile('/public/index.html', { root: __dirname + "/../" });
});

// Setup the virtual server to enable running Phaser on server
function setupVirtualServer() {
    // fromFile returns a promise
    JSDOM.fromFile(path.join(__dirname, 'virtualServer/index.html'), {
        // To run the scripts in the html file
        runScripts: "dangerously",
        // Also load supported external resources
        resources: "usable",
        // So requestAnimationFrame events fire
        pretendToBeVisual: true
    }).then((dom) => {
        dom.window.URL.createObjectURL = (blob) => {
            if (blob) {
                return parser.format(blob.type, blob[Object.getOwnPropertySymbols(blob)[0]]._buffer).content;
            }
        };
        dom.window.URL.revokeObjectURL = (objectURL) => { };
        // When fromFile promise resolves
        dom.window.gameLoaded = () => {
            // Pass the socket io object to the virtual DOM
            dom.window.io = io;
            // Start server
            server.listen(port, function () {
                console.log("Server started...")
                console.log(`Server now listening for connections on port: ${server.address().port}`);
            });
        };
    }).catch((error) => {
        console.log("Error loading virtual DOM in server...");
        console.log(error.message);
    });
}
setupVirtualServer();