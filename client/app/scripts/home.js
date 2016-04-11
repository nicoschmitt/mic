(function() {
    
    var app = angular.module('myApp');
  
    app.controller('homeCtrl', ['$http', "$location", "adalAuthenticationService",
        function ($http, $location, adal) {
            var vm = this;
            
            vm.isAuthenticated = function() { return adal.userInfo.isAuthenticated }
            
            vm.loading = true;
            vm.message = "";
            vm.quarters = [];
            
            var handleError = function(resp) {
                vm.loading = false;
                vm.message = resp.data;
                console.log(resp.data);
            };
            
            var view = function() {
                $http.get("/api/data").then(function(resp) {
                    vm.loading = false;
                    
                    var latest = resp.data.filter(d => d.current == 1);
                    var notQ4 = latest.filter(d => d.quarter != "Q4");

                    if (notQ4.length > 0) {
                        var currentQuarter = notQ4[0];
                        console.log(currentQuarter);
                        vm.quarters.push(currentQuarter);
                    }
                    
                    vm.quarters.push(latest.filter(d => d.quarter == "Q4")[0]);
                    
                    console.log(vm.quarters);
                });   
            };
            
            if (vm.isAuthenticated()) view();
        }
    ]);
  
}());