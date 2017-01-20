var express = require('express')
var app = express()
var _ = require("lodash");
var path = require("path");
var unzip = require("unzip");
var fs = require("fs");
var rmdir = require("rimraf");
var execSync = require('child_process').execSync;
var exec = require('child_process').exec;


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
    var RIOT = path.join(__dirname, 'RIOT', 'examples', path.basename(zipSource,".zip"));
    var zipDest = path.join(__dirname,"results",path.basename(zipSource));
    rmdir.sync(RIOT);
    fs.mkdirSync(RIOT);
    /*fs.createReadStream(zipSource).pipe(unzip.Extract({
        path: RIOT
    }));*/
    
    var cmd0 = 'unzip ' + zipSource + " -d " + RIOT;
    console.log(cmd0);
    exec(cmd0, function(err){
        if (err){
            console.log("Error at unzipping");
        }
        else{
            var cmd1 = 'cd ' + RIOT + " && mv Makefile.compileAway Makefile && make";
            console.log(cmd1);
            exec(cmd1, function(err,stdout,stderr){
                if (err){
                    console.log("Error at compiling");
                    fs.writeFile(zipDest, stderr.substr(0, stderr.indexOf('compilation terminated.')), function(err) {
                        if(err) {
                            console.log("Error at writing error");
                            console.log(err);
                        }
                        else{
                            console.log("The error was saved");
                            res.send("z" + path.basename(req.files.file.path,".zip"));
                        }
                    });
                }
                else{
                    var cmd2 = "find " + RIOT + " -type f ! \\(  -name \"*.elf\" -or -name \"*.bin\" -or -name \"*.map\" -or -name \"Makefile\" \\) -delete";
                    cmd2 += " && find " + RIOT + " -type d -empty -delete";
                    console.log(cmd2);
                    exec(cmd2, function(err){
                        if (err){
                            console.log("Error at removing sources");
                        }
                        else{
                            var cmd4 = 'cd ' + RIOT + ' && zip -r archive.zip * && mv archive.zip ' + zipDest;
                            console.log(cmd4);
                            exec(cmd4, function(err){
                                if (err){
                                    console.log("Error at zipping");
                                }
                                else{
                                    res.send(path.basename(req.files.file.path,".zip"));
                                    rmdir.sync(RIOT);
                                    console.log("Compilation of " + req.files.file.path + " done.");
                                }
                            });
                        }
                    });
                }
            });
        }
    });
    
})

app.get('/getResult/:zipID', function(req, res) {
    var p;
    if (req.params.zipID.startsWith("z")){
        p = path.join(__dirname,"results",req.params.zipID.substring(1));
    }
    else {
        p = path.join(__dirname,"results",req.params.zipID);
    }
    p += ".zip";
    console.log("Client asked for " + p);
    while(!fs.existsSync(p)){
    }
    if (req.params.zipID.startsWith("z")){
        fs.readFile(p, function(err, contents) {
            if (err){
                console.log ("Error at getting the error from file");
            }
            else{
                res.send(contents);
                console.log ("Gave client the error");
            }
        });
    }
    else{
        res.sendfile(p, function(err)
        {
            if (err){
                console.log(err);
                res.status(err.status).end();
            }
            else{
                console.log("Sent " + p + " to client");
                rmdir.sync(p);
                console.log("Deleted " + p);
            }
        });
    }
})

app.listen(process.env.PORT || 80, process.env.IP || "0.0.0.0", function() {
    console.log('App listening on port 80!')
})
