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
        
        $scope.site = {
            playbooks: parsePlaybooks.parse($rootScope.playbooks),
            tabs: {
                titles: ""
            }
        };
        //console.log($scope.site.tabs.titles());
        // $scope.controlList.localCopy.source = $scope.controlList.listVersions.data[$scope.brandCodeSelected].data[$scope.serverTypeSelected].flat[0]
        $scope.adminTab = 'active';
        $scope.developerTab = '';
        $scope.adminActions = true;
        $scope.developerActions = false;

        $scope.expandTask = function(task) {
            $scope.activeTab = task;
        };

        $scope.init = function() {

        };
    }
]);