(function() {
    
    var app = angular.module('myApp');
  
    app.controller('homeCtrl', ['$http', "$location", "adalAuthenticationService",
        function ($http, $location, adal) {
            var vm = this;
            
            vm.isAuthenticated = function() { return adal.userInfo.isAuthenticated }
            
            vm.loading = true;
            vm.message = "";
            vm.quarters = [];
            vm.updated = "";
            vm.chartoptions = {
                scales: {
                    xAxes: [{
                        type: "time",
                        time: {
                            format: "MM/DD/YYYY",
                            round: 'day',
                            tooltipFormat: 'll'
                        }
                    }],
                    yAxes: [{
                        type: "linear",
                        ticks: {
                            min: 0,
                            callback: function(value) { return (value / 1000).toFixed(1).replace(/(\d)(?=(\d{3})+$)/g, "$1 ") + "M"; }
                        }
                    }]
                }
            };
            
            var handleError = function(resp) {
                vm.loading = false;
                vm.message = resp.data;
                console.log(resp.data);
            };
            
            function GetChartData(data, quarter) {
                var all = data.filter(d => d.quarter == quarter);
                return {
                    labels: all.map(d => { return moment(d.date).toDate(); }),
                    series: [ "Target PG2", "Target PG1" ],
                    data: [
                       all.map(d => { return d.PG2Target/1000; }),
                       all.map(d => { return d.PG1Target/1000; })
                    ]   
                };
            }
            
            var view = function() {
                $http.get("/api/data").then(function(resp) {
                    vm.loading = false;
                    
                    var latest = resp.data.filter(d => d.current == 1);
                    var notQ4 = latest.filter(d => d.quarter != "Q4");
                    
                    if (notQ4.length > 0) {
                        var currentQuarter = notQ4[0];
                        var all = resp.data.filter(d => d.quarter == currentQuarter.quarter);
                        vm.quarters.push({
                            name: currentQuarter.quarter,
                            current: currentQuarter,
                            hist: GetChartData(resp.data, currentQuarter.quarter)
                        });
                    }
                    
                    var q4 = latest.filter(d => d.quarter == "Q4")[0];
                    var q4All = resp.data.filter(d => d.quarter == currentQuarter);
                    vm.quarters.push({
                        name: "Q4",
                        current: q4,
                        hist: GetChartData(resp.data, "Q4")
                    });
                    
                    var now = moment();
                    var then = moment(q4.date);
                    if (now.diff(then, "days") < 1) {
                        vm.updated = "today";
                    } else {
                        vm.updated = "about " + moment(q4.date).fromNow();
                    }
                    
                    console.log(vm.quarters);
                });   
            };
            
            if (vm.isAuthenticated()) view();
        }
    ]);
  
}());