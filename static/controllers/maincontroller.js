controllers.controller('mainController', [
    '$rootScope',
    '$scope',
    '$http',
    '$sce',
    'sharedProps',
    'ajaxOperations',
    'parseJson',
    function($rootScope, $scope, $http, $sce, sharedProps, ajaxOperations, parseJson) {
        //Socketio config
        $scope.testSocket = io.connect('http://127.0.0.1:5000/serv');

        //Variables local to page
        $rootScope.filetree = sharedProps.filetreeData;
        $scope.brandCodeSelected = 'zz';
        $scope.serverTypeSelected = 'test'
        $scope.tick = "http://i.imgur.com/ATfTAaB.png";
        $scope.cross = "http://i.imgur.com/PZvHtcx.png";

        $scope.version = {
            "live": "",
            "test": ""
        };

        $scope.activeTab = 'listVersions';

        $scope.controlList = {
            'listVersions': {
                'brandCode': null,
                'path': '/var/www',
                'data': $rootScope.filetree,
                'parsedData': ''
            },
            'pushFix': {},
            'switchTestingLatest': {},
            'releaseApproved': {},
            'rollBack': {},
            'localCopy': {
                'local': '/var/tmp',
                'withdb': false
            },
            'updateCopy': {},
            'freshenRemote': {},
        };

        $scope.controlList.localCopy.source = $scope.controlList.listVersions.data[$scope.brandCodeSelected].data[$scope.serverTypeSelected].flat[0]

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