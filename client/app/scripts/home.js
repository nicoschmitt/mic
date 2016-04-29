(function() {
    
    var app = angular.module('myApp');
    
    function getCurrentQuarter() {
        var quarter = "Q4";
        var month = moment().month();
        if (month < 3) quarter = "Q3";
        else if (month < 6) quarter = "Q4";
        else if (month < 9) quarter = "Q1";
        else quarter = "Q2";
        
        return quarter;
    }
    
    function getChartOptions() {
        return {
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
    }
  
    app.controller('homeCtrl', ['$http', "$location", "adalAuthenticationService",
        function ($http, $location, adal) {
            var vm = this;
            
            vm.isAuthenticated = function() { return adal.userInfo.isAuthenticated }
            
            vm.loading = true;
            vm.message = "";
            vm.quarters = [];
            vm.updated = "";
            vm.chartoptions = getChartOptions();
            vm.selectedTab = 0;
            
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
                    latest.forEach(quarter => {
                        var all = data.filter(d => d.quarter == quarter.quarter);
                        vm.quarters.push({
                            name: quarter.quarter,
                            current: quarter,
                            hist: GetChartData(data, quarter.quarter)
                        });
                    });
                    
                    var idx = vm.quarters.findIndex(q => q.name == getCurrentQuarter());
                    if (idx >= 0) vm.selectedTab = idx;
                });   
            };
            
            if (vm.isAuthenticated()) view();
        }
    ]);
  
}());