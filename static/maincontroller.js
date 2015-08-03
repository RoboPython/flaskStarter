angular.module('mainApp').controller('mainController',[
	'$scope',
	'sharedProps',
	'config',
	'$http', 
	'$sce', 
	function($scope, sharedProps, config, $http, $sce) {
 	$scope.filetree = sharedProps.filetreeData;
	$scope.brandCodeSelected ='zz';
	$scope.serverTypeSelected = 'test'
	$scope.tick = "http://i.imgur.com/ATfTAaB.png" ;
	$scope.cross = "http://i.imgur.com/PZvHtcx.png";
	$scope.version = {"live":"","test":""};            
    $scope.activeTab = 'listVersions';	
	$scope.controlList ={'listVersions':{
										 'loading':false,
										 'loaded':false, 
										 'brandCode':null,
										 'path':'/var/www',
										 'data':$scope.filetree,
										 'parsedData': ''
										 },

 						'pushFix':{'loading':false,
								   'loaded':false, 
						           },

 						'switchTestingLatest':{
										 'loading':false,
										 'loaded':false,
						                 },

 						'releaseApproved':{
										 'loading':false,
										 'loaded':false,
										 },

 						'rollBack':{
						   			'loading':false,
								    'loaded':false,	     
								    },

 						'localCopy':{
										 'loading':false,
										 'loaded':false,
										 'local':'/var/tmp',
										 'withdb':false
										  },

 						'updateCopy':{
										 'loading':false,
										 'loaded':false,
										 
									 },

 						'freshenRemote':{
										 'loading':false,
										 'loaded':false,
										 
										},
	};
	
	$scope.controlList.localCopy.source = $scope.controlList.listVersions.data[$scope.brandCodeSelected].data[$scope.serverTypeSelected].flat[0]

	$scope.adminTab = 'active';
	$scope.developerTab = '';
	$scope.adminActions = true;
	$scope.developerActions = false;
	$scope.switchTabs = function(tab){
		if (tab == 'developer'){
			$scope.adminTab ='';
			$scope.developerTab = 'active';
			$scope.adminActions = false;
			$scope.developerActions = true;
		};

		if (tab == 'admin'){
			$scope.adminTab ='active';
			$scope.developerTab = '';
			$scope.adminActions = true;
			$scope.developerActions = false;
		};
	};

	$scope.expandTask = function(task){
		$scope.activeTab = task;
	};


	$scope.getFiletree = function(brand_code){
		$http.get('/getFiletree?code='+brand_code).
			success(function(data,status,headers,config){
				$scope.filetree = data;
				$scope.generateFileTree(data);
				console.log('success');
			}).
			error(function(data,status,headers,config){
				console.log('we messed up');
			});
	};

	$scope.generateFileTree = function(filetreeData) {
		$scope.filetree = filetreeData;
		unjsonify(filetreeData, { jump: false }, ["meta"], function(parsedFiletreeData){
            $scope.controlList.listVersions.parsedData = parsedFiletreeData;
    	});

	};

	$scope.outputHtml = function(html) {
		return $sce.trustAsHtml(html);
	};

	$scope.init = function() {
		$scope.generateFileTree($scope.filetree);
	};

	$scope.expandChild = function(e) {
		jQuery(e.target).parent().children('div').toggle();
	};

	$scope.localCopy  = function(brand_code, local, source,server_type, withdb){

		if (server_type != 'all'){
			$scope.controlList.localCopy.loading = true;
			$scope.controlList.localCopy.loaded = false;
			console.log(brand_code);
			console.log(local);
			console.log(source);
			console.log(withdb);
			$http.get('/localCopy?code='+brand_code+'&local='+local+'&source='+source+'&serverType='+server_type+'&withdb='+withdb).
				success(function(data,status,headers,config){
					console.log('success');
					console.log(data);
					$scope.controlList.localCopy.loading = false;
					$scope.controlList.localCopy.loaded = true;
					$scope.controlList.localCopy.data = data;
				}).
				error(function(data,status,headers,config){
					console.log('failure')
				});
		};
	};

	$scope.printer = function(arg){
		console.log(arg)
	};


}]).directive('compile', ['$compile', function ($compile) {
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
}]);