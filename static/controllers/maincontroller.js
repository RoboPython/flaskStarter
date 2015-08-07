controllers.controller('mainController', [
    '$rootScope',
    '$scope',
    '$http',
    '$sce',
    'sharedProps',
    'ajaxOperations',
    'parseJson',
    'parsePlaybooks',
    function($rootScope, $scope, $http, $sce, sharedProps, ajaxOperations, parseJson, parsePlaybooks) {
        //Variables local to page
        $rootScope.serverGroups = ["br", "ch", "zz", "fbm", "wl", "ly"];
        $rootScope.serverTypes = ["all", "test", "live"];

        $rootScope.brandCodeSelected = "zz";
        $rootScope.serverTypeSelected = "test";

        $rootScope.filetree = sharedProps.filetreeData;
        $rootScope.parsedFileTree = null;
        $rootScope.playbooks = sharedProps.playbookData;
        $scope.currentTab = "localCopy";

        $scope.site = {
            playbooks: parsePlaybooks.parse($rootScope.playbooks),
            staticPages: {
                versions: {
                    path: 'versions.html',
                    shortcode: 'versions'
                }
            },
            currentBook: null,
            currentPage: null
        };

        $scope.adminTab = 'active';
        $scope.developerTab = '';
        $scope.adminActions = true;
        $scope.developerActions = false;

        $scope.updateValues = function(e) {
            $rootScope.inputConversions = {
                serverType: $scope.serverTypeSelected.toLowerCase(),
                code: $scope.brandCodeSelected.toLowerCase()
            };
            $scope.site.playbooks = parsePlaybooks.parse($rootScope.playbooks);
        };

        $scope.expandTask = function(task) {
            $scope.currentTab = task;
            var currPlaybook = $scope.site.playbooks[task];
            if (currPlaybook) {
                $scope.site.currentBook = currPlaybook;
                $scope.site.currentPage = null;
            } else {
                $scope.site.currentBook = null;
                $scope.site.currentPage = $scope.site.staticPages[task];
            }
        };

        $scope.loadCache = function(brandCodeSelected) {
            ajaxOperations.getFiletree(brandCodeSelected).success(function(data, status, headers) {
                $scope.filetree = data;
            }).error(function() {

            });
        }

        $scope.init = function() {


            $scope.expandTask($scope.currentTab);
        };
    }
]);