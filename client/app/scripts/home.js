(function() {
    
    var app = angular.module('myApp');
  
    app.controller('homeCtrl', ['$http', "$location", "adalAuthenticationService",
        function ($http, $location, adal) {
            var vm = this;
            
            vm.isAuthenticated = function() { return adal.userInfo.isAuthenticated }
            
            vm.loading = true;
            vm.message = "";
            
            var handleError = function(resp) {
                vm.loading = false;
                vm.message = resp.data;
                console.log(resp.data);
            };
            
            var view = function() {
                $http.get("/api/data").then(function(resp) {
                    vm.loading = false;
                    console.log(resp.data);
                });   
            };
            
            if (vm.isAuthenticated()) view();
        }
    ]);
  
}());