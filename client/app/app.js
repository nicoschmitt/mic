/* global angular */
(function() {
    var app = angular.module('myApp', [ 'ngRoute', "AdalAngular", "ngMaterial" ]);
  
    app.config(["adalAppId", "o365tenant", '$routeProvider', '$httpProvider', "adalAuthenticationServiceProvider",
        function (adalAppId, o365tenant, $routeProvider, $httpProvider, adalProvider) {
   
            $routeProvider.when("/Home", {
                templateUrl: "/app/views/home.html",
                controller: "homeCtrl",
                controllerAs: "vm"

            }).when("/Me", {
                templateUrl: "/app/views/me.html",
                controller: "meCtrl",
                controllerAs: "vm",
                
            }).otherwise({ redirectTo: "/Home" });
            
            adalProvider.init({
                tenant: o365tenant + '.onmicrosoft.com',
                clientId: adalAppId
            }, $httpProvider );
            
    }]);
   
    fetchData().then(launchApplication);

    function fetchData() {
        var initInjector = angular.injector(["ng"]);
        var $http = initInjector.get("$http");
        return $http.get("/api/config").then(function(resp){
            app.constant("adalAppId", resp.data.adalAppId);
            app.constant("o365tenant", resp.data.o365tenant);
        });
    };

    function launchApplication() {
        angular.element(document).ready(function() {
            angular.bootstrap(document, ["myApp"]);
        });
    };
  
}());