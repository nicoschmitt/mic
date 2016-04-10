(function(){

    module.exports = function(req, res, next) {
        var key = req.query.key;
        if (key != process.env.SECRET_KEY) {
            return res.status(401).send("unauthorized");
        }
        
        next();
    }

}());
