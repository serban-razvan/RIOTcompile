var express = require('express')
var app = express()
var _ = require("lodash");
var path = require("path");
var unzip = require("unzip");
var fs = require("fs");
var rmdir = require("rimraf");
var execSync = require('child_process').execSync;


app.configure(function() {
    app.use(express.methodOverride());
    //app.use(express.multipart());
    app.use(express.bodyParser({
        keepExtensions: true,
        uploadDir: path.join(__dirname, '/files')
    }));

});


app.post('/', function(req, res) {
    var zipSource = req.files.file.path;
    var RIOT = path.join(__dirname, 'RIOT', 'examples', 'wyliodrin_project');
    var zipDest = path.join(__dirname,"results",path.basename(zipSource));
    rmdir.sync(RIOT);
    fs.mkdirSync(RIOT);
    /*fs.createReadStream(zipSource).pipe(unzip.Extract({
        path: RIOT
    }));*/
    
    var cmd0 = 'unzip ' + zipSource + " -d " + RIOT;
    console.log(cmd0);
    var code0 = execSync(cmd0);

    var cmd1 = 'cd ' + RIOT + " && make";
    console.log(cmd1);
    var code = execSync(cmd1);
    
    var cmd12 = "find " + RIOT + " -type f ! \\(  -name \"*.elf\" -or -name \"*.bin\" -or -name \"*.map\" -or -name \"Makefile\" \\) -delete";
    console.log(cmd1);
    var code = execSync(cmd12);
    
    var cmd2 = 'cd ' + RIOT + ' && zip -r archive.zip * && cp archive.zip ' + zipDest;
    console.log(cmd2);
    var code2 = execSync(cmd2);
    
    
    res.send(path.basename(req.files.file.path,".zip"));
})

app.get('/getResult/:zipID', function(req, res) {
    var p = path.join(__dirname,"results",req.params.zipID);
    p += ".zip"
    console.log(p);
    console.log("mai sus e calea ceruta de client");
    while(!fs.existsSync(p)){
    }
    res.sendfile(p);
    console.log("trimis");
})

app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
    console.log('Example app listening on port 3000!')
})
