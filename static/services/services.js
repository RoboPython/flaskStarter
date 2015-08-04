mainApp.factory('ajaxOperations', [
    '$http',
    function($http) {
        var AjaxOperations = {};

        AjaxOperations.getFiletree = function(brand_code) {
            return $http.get('/getFiletree?code=' + brand_code);
        };

        AjaxOperations.localCopy = function(brand_code, local, source, server_type, withdb) {
            return $http.get('/localCopy?code=' + brand_code + '&local=' + local + '&source=' + source + '&serverType=' + server_type + '&withdb=' + withdb);
        }

        return AjaxOperations;
    }
]);

mainApp.service('parseJson', ['$q',
    function($q) {
        this.unjsonify = function(jsonToParse, ignore) {
        	ignore = ignore || [""];

        	var def = $q.defer();
            unjsonify(jsonToParse, {
                jump: false
            }, ignore, function(parsedData) {
            	if(!parsedData) {
            		def.reject("Failed to parse JSON.");
            	};

                def.resolve(parsedData);
            });
            return def.promise;
        }
    }
]);