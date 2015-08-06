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
            $scope.code = "";
            $scope.running = false;
            $scope.tasks = {};
        };

        $scope.messageHandler = function(msg) {
            //Close connection when finished event recieved.
            console.log(msg);
            $scope.tasks[$scope.code].tasks.push(msg);
            $scope.$apply()

            if (msg.event == "finished") {
                $scope.running = false;
                this.close();
            };
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

        $scope.showDetails = function(e) {

            jQuery(e.target).parent().children('div.details').toggle();

        };

        $scope.go = function() {
            var currentPage = $scope.site.currentBook;
            var params = {};

            params.shortCode = currentPage.shortcode;
            params.serverType = $scope.serverTypeSelected;
            params.serverCode = $scope.brandCodeSelected;

            var requestString = "/run_playbook?shortname=" + params.shortCode + "&code=" + params.serverCode + "&serverType=" + params.serverType;

            for(var field in currentPage.fields) {
                var bindData = currentPage.fields[field].bindingData["model_bind"];
                requestString += '&' + field + '=' + bindData;
            };

            if (!$scope.running) {
                var events = eventSource.init(requestString);
                $scope.code = currentPage.shortcode;
                $scope.running = true;
                $scope.tasks[$scope.code] = {
                    status: "ok",
                    name: $scope.code,
                    tasks: []
                };
                events.registerHandler('msg', $scope.messageHandler);
                events.registerHandler('err', $scope.errorHandler);
                events.registerHandler('status', $scope.statusHandler);
            }
        };
    }
]);