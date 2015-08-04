var controllers = angular.module('controllers', []);

//Controller for versions page;
controllers.controller('versions', [
    '$rootScope',
    '$scope',
    'ajaxOperations',
    'parseJson',
    function($rootScope, $scope, ajaxOperations, parseJson) {
        $scope.expandChild = function(e) {
            jQuery(e.target).parent().children('div').toggle();
        };

        $scope.init = function() {
            $scope.parseFileTree($rootScope.filetree);
        };

        $scope.getFiletree = function(brand_code) {
            ajaxOperations.getFiletree(brand_code).
            success(function(data, status, headers) {
                $rootScope.filetree = data;
                $scope.parseFileTree(data);
                console.log('success - filetree transferred');
            }).
            error(function(data, status, headers) {
                console.log('failure - err in filetree transfer.');
            });
        };

        $scope.parseFileTree = function(filetreeData) {
            parseJson.unjsonify($rootScope.filetree, ["meta"]).then(function(data) {
                $scope.controlList.listVersions.parsedData = data;
            }, function(err) {
                console.log("Fail:" + err);
            });
        };
    }
]);

controllers.controller('pullcopylocal', [
    '$rootScope',
    '$scope',
    'ajaxOperations',
    function($rootScope, $scope, ajaxOperations) {
        $scope.init = function() {

        };

        $scope.localCopy = function(brand_code, local, source, server_type, withdb) {
            if (server_type != 'all') {
                $scope.controlList.localCopy.loading = true;
                $scope.controlList.localCopy.loaded = false;
                ajaxOperations.localCopy(brand_code, local, source, server_type, withdb).
                success(function(data, status, headers) {
                    $scope.controlList.localCopy.loading = false;
                    $scope.controlList.localCopy.loaded = true;
                    $scope.controlList.localCopy.data = data;
                }).
                error(function(data, status, headers) {
                    console.log('failure')
                });
            };
        };
    }
]);