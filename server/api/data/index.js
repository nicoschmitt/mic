(function(){
    
    var express = require('express');
    var router = express.Router();

    var controller = require('./data.controller');
    var simpleauth = require("./simple.auth");
  
    router.get('/:user', simpleauth, controller.getdata);
    router.put('/:user', simpleauth, controller.putdata);

    module.exports = router;
    
}());