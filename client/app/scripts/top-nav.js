(function() {
    
    var app = angular.module('myApp');
  
    app.controller('topNavCtrl', ["$rootScope", "$location", 'adalAuthenticationService', "$http", "$window",
        function ($rootScope, $location, adal, $http, $window) {
            var vm = this;
            
            m.isAuthenticated = function() { return adal.userInfo.isAuthenticated }
            
            vm.goToProfile = function() {
                $location.path("/Me");
            }
            
            vm.login = function() {
                adal.login();
            };
            
            vm.logout = function() {
                adal.logOut();
            };
            
           vm.getUsername = function() {
                var auth = adal.userInfo.isAuthenticated;
                return (auth && adal.userInfo.profile.name) || "";
            };
            
            vm.isActive = function(viewLocation) { 
                return viewLocation === $location.path();
            };
        }
    ]);
  
    app.directive("topNav", function () {
        return {
            restrict: 'E',
            templateUrl: "/app/views/top-nav.html",
            controller: "topNavCtrl",
            controllerAs: "vm"
        };
    });
  
}());
