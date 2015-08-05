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
            parseJson.unjsonify($rootScope.filetree, ["meta", "flat"]).then(function(data) {
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
    'eventSource',
    function($rootScope, $scope, ajaxOperations, eventSource) {
        $scope.init = function() {

        };

        $scope.messageHandler = function(msg) {
            //Close connection when finished event recieved.
            if (msg.event == "finished") {
                this.close();
                return;
            };
            console.log("Message: ", msg);
        };

        $scope.errorHandler = function(err) {
            if (err) {
                console.log("Error: ", err);
            }

            return null;
        };

        $scope.statusHandler = function(status) {
            if (status) {
                console.log("Status: ", status);
            }
            return null;
        };

        $scope.localCopy = function(brand_code, local, source, server_type, withdb) {
            var requestString = '/localCopy?code=' + brand_code + '&local=' + local + '&source=' + source + '&serverType=' + server_type + '&withdb=' + withdb;
            var events = eventSource.init(requestString);
            events.registerHandler('msg', $scope.messageHandler);
            events.registerHandler('err', $scope.errorHandler);
            events.registerHandler('status', $scope.statusHandler);


        };
    }
]);