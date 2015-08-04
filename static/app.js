var mainApp = angular.module('mainApp', ['controllers'])
    .directive('compile', ['$compile',
        function($compile) {
            //A directive which allows us to include html and compile it using angular (replaces the deprecated ng-bind-html-unsafe)
            return function(scope, element, attrs) {
                scope.$watch(
                    function(scope) {
                        return scope.$eval(attrs.compile);
                    },
                    function(value) {
                        element.html(value);
                        $compile(element.contents())(scope);
                    }
                );
            };
        }
    ]);

mainApp.run(function($rootScope) {
    console.log("Angular app successfully started.");
});