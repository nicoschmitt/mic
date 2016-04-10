(function(){
    var moment  = require("moment")
    var Data    = require("./data.model");
  
    module.exports.getdata = function(req, res) {
        console.log(req.originalUrl);
        var user = req.params.user;

        var today = moment().utc().startOf('day').toDate();
        console.log(today);
        Data.find({ user: user, fiscal: process.env.CURRENT_FISCAL }, { user:0, fiscal:0, _id: 0, __v: 0 }).lean().exec(function(err, data) {
            data.forEach(d => {
                d.current = (d.date.getTime() == today.getTime()) ? "1" : "0";
            });
            res.json(data);
        });
    };
    
    module.exports.putdata = function(req, res) {
        var user = req.params.user;
        
        console.log("record data for user " + user);

        req.body.date = moment.utc(req.body.date, "DD/MM/YYYY").toDate();
        
        Data.findOne({ user: user, fiscal: req.body.fiscal, quarter: req.body.quarter, date: req.body.date }, function(err, doc) {
            if (doc) {
                console.log("already exists");
                console.log(req.body);
                res.json({});
            } else {
                var data = new Data({ user: user });
                Object.keys(req.body).forEach(k => {
                    data[k] = req.body[k];
                });
                
                data.save(function(){
                    res.json({}); 
                });
            }
        });
    };
}());
