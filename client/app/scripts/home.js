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
                tooltips: {
                    callbacks: {
                        label: function(o, context) { 
                            var value = "$" + (o.yLabel * 1000).toFixed(0).replace(/(\d)(?=(\d{3})+$)/g, "$1 ");
                            return context.datasets[o.datasetIndex].label + ": " + value; 
                        }  
                    }
                },
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
                            callback: function(value) { return (value / 1000).toFixed(1).replace(/(\d)(?=(\d{3})+$)/g, "$1 ") + "M$"; }
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
                    series: [ 
                        "Target PG2", 
                        "Actuals PG2", 
                        "Target PG1", 
                        "Actuals PG1"
                    ],
                    data: [
                       all.map(d => { return d.PG2Target/1000; }),
                       all.map(d => { return d.PG2Actuals/1000; }),
                       all.map(d => { return d.PG1Target/1000; }),
                       all.map(d => { return d.PG1Actuals/1000; })
                    ]   
                };
            }
            
            var view = function() {
                $http.get("/api/data").then(function(resp) {
                    vm.loading = false;
                    
                    vm.updated = moment(resp.data.lastupdated).fromNow();
                    var data = resp.data.data;
                    
                    var latest = data.filter(d => d.current == 1);
                    var notQ4 = latest.filter(d => d.quarter != "Q4");
                    
                    if (notQ4.length > 0) {
                        var currentQuarter = notQ4[0];
                        var all = data.filter(d => d.quarter == currentQuarter.quarter);
                        vm.quarters.push({
                            name: currentQuarter.quarter,
                            current: currentQuarter,
                            hist: GetChartData(data, currentQuarter.quarter)
                        });
                    }
                    
                    var q4 = latest.filter(d => d.quarter == "Q4")[0];
                    var q4All = data.filter(d => d.quarter == currentQuarter);
                    vm.quarters.push({
                        name: "Q4",
                        current: q4,
                        hist: GetChartData(data, "Q4")
                    });
                });   
            };
            
            if (vm.isAuthenticated()) view();
        }
    ]);
  
}());