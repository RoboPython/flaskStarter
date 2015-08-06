mainApp.factory('ajaxOperations', [
    '$http',
    function($http) {
        var AjaxOperations = {};

        AjaxOperations.getFiletree = function(brand_code) {
            return $http.get('/getFiletree?code=' + brand_code);
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

mainApp.service('parsePlaybooks', [

    function() {

        this.parse = function(playbooks) {
            var books = {};

            for (var playbook in playbooks["playbooks"]) {
                var tmp_playbook = playbooks["playbooks"][playbook];
                var play = {
                    name: tmp_playbook.name,
                    shortcode: tmp_playbook.shortname,
                    fields: this.generateBindings(tmp_playbook.fields),
                };
                books[play.shortcode] = play;
            }
            return books;
        };

        this.generateBindings = function(fields) {
            for(var field in fields) { 
                var tmp_field = fields[field];

                
                
                var binding = {
                    model_bind: tmp_field.placeholder,
                    model_required: tmp_field.required,
                    model_options: {opt1: "test"}
                };
                tmp_field.bindingData = binding;
            }

            return fields;

        };
    }
]);