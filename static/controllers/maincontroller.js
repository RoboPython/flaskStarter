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
        $rootScope.playbooks = sharedProps.playbookData;
        $scope.currentTab = "localCopy";
        $scope.site = {
            playbooks: parsePlaybooks.parse($rootScope.playbooks),
            currentBook: null
        };


        // $scope.controlList.localCopy.source = $scope.controlList.listVersions.data[$scope.brandCodeSelected].data[$scope.serverTypeSelected].flat[0]
        $scope.adminTab = 'active';
        $scope.developerTab = '';
        $scope.adminActions = true;
        $scope.developerActions = false;

        $scope.expandTask = function(task) {
            $scope.currentTab = task;
            $scope.site.currentBook = $scope.site.playbooks[$scope.currentTab]; 
        };

        $scope.init = function() {
            $scope.expandTask($scope.currentTab);
        };
    }
]);