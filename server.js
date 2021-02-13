    // Create a web sockets signaling server
    var express = require('express');
    var bodyParser = require('body-parser');
    var app = express();

    //Allow all requests from all domains & localhost
    app.all('/*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Methods", "POST, GET");
        next();
    });

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));


    let lookup = {}

    const hostname = '0.0.0.0';
    const port = process.env.PORT;


    var Server = require('bittorrent-tracker').Server

    var server = new Server({
        udp: false, // enable udp server? [default=true]
        http: true, // enable http server? [default=true]
        ws: true, // enable websocket server? [default=true]
        stats: true, // enable web-based statistics? [default=true]
    })

    server.on('error', function (err) {
        // fatal server error!
        console.log(err.message)
    })

    server.on('warning', function (err) {
        // client sent bad data. probably not a problem, just a buggy client.
        console.log(err.message)
    })

    server.on('listening', function () {
        // fired when all requested servers are listening
        console.log('Signal server http port:' + server.http.address().port)
        console.log('Signal server ws port:' + server.ws.address().port)
    })

    // start tracker server listening! Use 0 to listen on a random free port.
    server.listen(port, hostname, 'listening')

    // listen for individual tracker messages from peers:
    server.on('start', function (addr) {
        console.log('got start message from ' + addr)
        Object.keys(server.torrents).forEach(hash => {
            lookup[server.torrents[hash].infoHash] = server.torrents[hash].peers.length
            console.log("peers: " + server.torrents[hash].peers.length)
        });
    })

    server.on('complete', function (addr) {})
    server.on('stop', function (addr) {})

    app.get('/peers', function(req, res) {
        res.send(lookup);
    });

    app.listen(3001 || process.env.PORT,function(){
        console.log('Express server port: ' + this.address().port); //Listening on port 8888
    });