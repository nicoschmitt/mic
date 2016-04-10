(function(){
    
    var register = function(app) {
        app.use('/api/config', require('./api/config'));
        app.use('/api/data', require('./api/data'));
    };

    module.exports.register = register;

}());
