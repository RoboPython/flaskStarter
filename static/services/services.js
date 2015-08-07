mainApp.factory('ajaxOperations', [
    '$http',
    function($http) {
        var AjaxOperations = {};

        AjaxOperations.getFiletree = function(brand_code) {
            return $http.get('/filetree?code=' + brand_code);
        };

        // AjaxOperations.localCopy = function(brand_code, local, source, server_type, withdb) {
        //     return $http.get('/localCopy?code=' + brand_code + '&local=' + local + '&source=' + source + '&serverType=' + server_type + '&withdb=' + withdb);
        // }

        return AjaxOperations;
    }
]);

mainApp.factory('eventSource', [

    function() {
        var eventSource = {
            init: function(path) {
                this.context = new EventSource(path);

                this.messageHandlers = [];
                this.errorHandlers = [];
                this.statusHandlers = [];

                this.state = this.context.readyState;

                this.context.onerror = this.onError.bind(this);
                this.context.onmessage = this.onMessage.bind(this);
                this.context.onopen = this.onOpen.bind(this);

                this.parseData = true;

                return this;
            },
            close: function() {
                console.log("Closing connection.");
                this.context.close();
            },
            onError: function(error) {
                for (var i = 0; i < this.errorHandlers.length; i++) {
                    this.errorHandlers[i].call(this, error);
                };
            },
            onMessage: function(message) {
                (this.parseData) ? message = JSON.parse(message.data) : null;
                for (var i = 0; i < this.messageHandlers.length; i++) {
                    this.messageHandlers[i].call(this, message);
                };
            },
            onOpen: function(message) {
                for (var i = 0; i < this.statusHandlers.length; i++) {
                    this.statusHandlers[i].call(this, message);
                };
            },
            registerHandler: function(type, handler) {
                switch (type) {
                    case 'err':
                        this.errorHandlers.push(handler);
                        console.log("New error handler added.")
                        break;
                    case 'msg':
                        this.messageHandlers.push(handler);
                        console.log("New mesage handler added.")
                        break;
                    case 'status':
                        this.statusHandlers.push(handler);
                        console.log("New status handler added.")
                        break;
                };
            }
        };

        return eventSource;
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
                if (!parsedData) {
                    def.reject("Failed to parse JSON.");
                };

                def.resolve(parsedData);
            });
            return def.promise;
        }
    }
]);

//TODO: MAKE FACTORY TO PARSE URLS THINGS
//mainApp.factory('')

mainApp.service('parsePlaybooks', [
    '$rootScope',
    '$http',
    '$q',
    function($rootScope, $http, $q) {

        this.parse = function(playbooks) {
            var books = {};

            for (var playbook in playbooks["playbooks"]) {
                var tmp_playbook = playbooks["playbooks"][playbook];
                var play = {
                    name: tmp_playbook.name,
                    shortcode: tmp_playbook.shortname,
                    fields: this.generateElements(tmp_playbook.fields),
                };
                books[play.shortcode] = play;
            }
            return books;
        };


        this.getRemoteValue = function(path) {            
            var def = $q.defer();
            $http.get(path).then(function(res) {
                def.resolve(res);
            }, function(res) {
                def.reject(res);
            });
            return def.promise;
        };

        this.generateElements = function(fields) {
            var new_fields = {};
            for (var field in fields) {
                var tmp_field = fields[field];

                //Get element based off of type
                var element = $rootScope.typeConversions[tmp_field.type];
                tmp_field.element = element;

                var binding = {
                    model_bind: tmp_field.placeholder,
                    model_required: tmp_field.required || "required",
                    model_options: null
                };

                //Check if external data required here
                var remote = tmp_field["remoteValues"];
                var prom = null;

                if (remote !== undefined) {
                    var valluu = this.getRemoteValue(remote.path);
                    var right_binding = binding;
                    valluu.then(function(res) {
                        //TODO: DO PROPER LIKE
                        right_binding.model_bind = res.data[0];
                        right_binding.model_options = res.data;
                    });
                }

                new_fields[tmp_field.name] = tmp_field;
                new_fields[tmp_field.name].bindingData = binding;
            }

            return new_fields;

        };
    }
]);