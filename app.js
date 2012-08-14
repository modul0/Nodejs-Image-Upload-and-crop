
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var gm = require('gm')
  , resizeX = 150
  , resizeY = 150

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.register('html', require('ejs'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.helpers({
  renderScriptsTags: function (all) {
    if (all != undefined) {
      return all.map(function(script) {
        return '<script src="' + script + '"></script>';
      }).join('\n ');
    }else {
      return '';
    }
  },
  renderCssTags: function (all) {
    if (all != undefined) {
      return all.map(function(cssFile) {
        return '<link href="' + cssFile + '" rel="stylesheet" type="text/css" />';
      }).join('\n ');
    }else {
      return '';
    }
  }
});


app.dynamicHelpers({
  scripts: function(req, res) {
    return [];
  },
  cssFiles: function(req, res){
    return [];
  }
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

app.post('/api/photos', function(req, res){
  //console.log(JSON.stringify(req.files));
  var serverPath = '/images/' + req.files.userPhoto.name;
  var pathToServer = 'C:/public';

  require('fs').rename(
    //userPhoto is the input name
    req.files.userPhoto.path,
    pathToServer + serverPath,
    function(error){
      if(error){
        console.log(error)
        res.send({
          error: 'File uploaded cancelled, error.'
        });
        return;
      }

      res.send({
        path: serverPath
      });
    }
  )

})



app.post('/api/crop', function(req, res){
  var src = req.body.src;
  var name = req.body.name;
  var coords = req.body.data;
  var pathToServer = 'C:/public/';

  gm(pathToServer + src).crop(coords.w, coords.h, coords.x, coords.y).resize(resizeX,resizeY).write(pathToServer + 'images/cropped_' + name, function(err){
    if (!err){
      console.log("Image: " + name + " Cropped");
      res.send("success");
    } 
    else
    {
      res.send(err);
    }
  })
})

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
