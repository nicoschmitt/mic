(function(){
    var moment  = require("moment")
    var Data    = require("./data.model");
    var sendgrid = require('sendgrid')(process.env.SENDGRID_APIKEY);
    
    function GetDataForser(user, cb) {
        var today = moment().utc().startOf('day').toDate();
        Data.find({ user: user, fiscal: process.env.CURRENT_FISCAL }, { user:0, fiscal:0, _id: 0, __v: 0 }).lean().exec(function(err, data) {
            data.forEach(d => {
                d.current = (d.date.getTime() == today.getTime()) ? "1" : "0";
            });
           cb(data);
        });
    }
  
    function SendMail(msg) {
        var payload   = {
            to      : 'nicolass@microsoft.com',
            from    : 'nicolas.schmitt@outlook.fr',
            subject : 'myMIC',
            html    : msg
        };
        
        sendgrid.send(payload, function(err, json) {
            if (err) { console.error(err); }
        });
    }
  
    module.exports.getcurrentdata = function(req, res) {
        var email = req.user.preferred_username;
        if (!email.endsWith(process.env.USER_EMAIL_DOMAIN)) res.json({});
        var user = email.substr(0, email.indexOf("@"));

        GetDataForser(user, function(data) {
            res.json(data);
        });
    }
  
    module.exports.getdata = function(req, res) {
        console.log(req.originalUrl);
        var user = req.params.user;

        GetDataForser(user, function(data) {
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
                res.json({});
            } else {
                
                Data.findOne({ user: user, fiscal: req.body.fiscal, quarter: req.body.quarter }).sort("-date").exec(function(err, doc) {
                    if (doc) {
                        var changed = false;
                        var msg = "Something has changed for " + req.body.quarter + ".<br />\r\n";
                        Object.keys(req.body).forEach(k => {
                            if (k.toLowerCase().indexOf("target") >= 0) {
                                if (doc[k] != req.body[k]) {
                                    changed = true;
                                    msg += k + " is now " + req.body[k] + ". It was " + doc[k] + ".<br />\r\n";
                                }
                            }
                        });
                        if (changed) {
                            console.log(msg);
                            SendMail(msg);
                        }
                    }
                   
                    var data = new Data({ user: user });
                    Object.keys(req.body).forEach(k => {
                        data[k] = req.body[k];
                    });
                    
                    data.save(function(){
                        res.json({}); 
                    }); 
                });
            }
        });
    };
}());
