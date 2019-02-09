const express = require('express');
const App = express();
const Path = require('path');
const Db = require('./db');
const Config = require('./configuration.json');

/* Controllers*/
const Upload = require('./controllers/upload');


/* Middlewares */
App.use(express.static(Path.join(__dirname, 'public')));
App.use('/' , Upload);

/* Defalut App starting Path */
App.get('/', function (req, res) {
  res.sendFile(Path.join(__dirname, 'views/index.html'));
});

/* MongoDb Connection */
Db.connect(Config.mongoCmsUrl, function(err) {
   if (err) {
      console.log('Unable to connect to Mongo.');
      process.exit(1);
    } else {
      App.listen(3000, function () {
        console.log('Server listening on port 3000');
      });
    }
});



