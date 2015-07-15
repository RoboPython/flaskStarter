angular.module('mainApp').controller('mainController', function($scope, $http) {
	$scope.version = {"live":"","test":""};            
	$scope.tasks ={'listVersions':false,
		           'pushFix':false,
                   'switchTestingLatest':false, 
                   'releaseApproved':false,
                   'rollBack':false,
                   'localCopy':false,
                   'updateCopy':false,
                   'freshenRemote':false
	};

	$scope.loading ={'listVersions':false,
		             'pushFix':false,
                     'switchTestingLatest':false, 
                     'releaseApproved':false,
                     'rollBack':false,
                     'localCopy':false,
                     'updateCopy':false,
                     'freshenRemote':false
	};


	$scope.loaded ={'listVersions':false,
		            'pushFix':false,
		            'switchTestingLatest':false, 
		            'releaseApproved':false,
	 	            'rollBack':false,
		            'localCopy':false,
		            'updateCopy':false,
		            'freshenRemote':false
	};

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
		};
	};

	$scope.expandTask = function(task){
		$scope.tasks[task] = !$scope.tasks[task]
	};


	$scope.listVersions = function(brand_code){
		console.log(brand_code);
		$scope.loading.listVersions = true;
		$http.get('/getVersion?code='+brand_code ).
			success(function(data,status,headers,config){
				$scope.loading.listVersions = false;
				console.log(data)
				$scope.listOfVersions = data;
			$scope.testVersion = data["versionData"]["test"]["stat"]["version"]
				console.log($scope.testVersion = data["versionData"]["test"]["stat"]["version"])
			}).
		error(function(data,status,headers,config){
		});
	};
});
