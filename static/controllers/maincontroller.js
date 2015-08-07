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

        $rootScope.brandCodeSelected = "zz";
        $rootScope.serverTypeSelected = "test"
        // $scope.controlList.localCopy.source = $scope.controlList.listVersions.data[$scope.brandCodeSelected].data[$scope.serverTypeSelected].flat[0]
        $scope.adminTab = 'active';
        $scope.developerTab = '';
        $scope.adminActions = true;
        $scope.developerActions = false;

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
                console.log(data)
            }).error(function() {

            });
        }

        $scope.init = function() {
            $scope.expandTask($scope.currentTab);
        };
    }
]);