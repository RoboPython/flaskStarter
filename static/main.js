angular.module('mainApp').controller('mainController', function($scope,$rootScope) {


	//$rootScope.cheese = 'cheddar';	
	console.log($rootScope.cheese);
	$scope.brandCodeSelected ='zz';
	$scope.tick = "http://i.imgur.com/ATfTAaB.png" ;
	$scope.cross = "http://i.imgur.com/PZvHtcx.png";
	$scope.version = {"live":"","test":""};            
    $scope.activeTab = 'listVersions';	
	$scope.controlList ={'listVersions':{
										 'loading':false,
										 'loaded':false, 
										 'brandCode':null,
										 'path':'/var/www',
										 'results':null
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

	$scope.server_data ={
		'br':{},
		'ch':{},
		'ly':{},
		'fbm':{},
		'wl':{},
		'zz':{}
	}


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
				$scope.server_data[brand_code].filetree = data.data;
			}).
			error(function(data,status,headers,config){
				console.log('we messed up');
			});
	};


	$scope.listVersions = function(brand_code,path){
		$scope.controlList.listVersions.loading =true;
		$scope.controlList.listVersions.loaded = false;
		$http.get('/getVersion?code='+brand_code+'&path='+path).
			success(function(data,status,headers,config){
				$scope.controlList.listVersions.loading =false;
				$scope.controlList.listVersions.loaded = true;
				$scope.controlList.listVersions.results = data;
			}).
		    error(function(data,status,headers,config){
		    });
	};
});
