(function(){
    
    var register = function(app) {
        app.use("/api*", function(req, res, next) {
            res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            res.header('Expires', '-1');
            res.header('Pragma', 'no-cache');
            next(); 
        });
        
        app.use('/api/config', require('./api/config'));
        app.use('/api/data', require('./api/data'));
    };

    module.exports.register = register;

}());
