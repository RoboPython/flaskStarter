var unjsonify = (function() {
/*
*   Variables
*/
var count = 0;
var options = {
    jump: false,
}

/*
*   Constructors
*/
var Node = function(href, node, val, tree, count, ignore) {
    if(ignore.indexOf(node.toLowerCase()) > -1) {
        return "";
    };
    var node = "<li id='" + count + "'><a title='Node' ng-click='expandChild($event)' class='btn btn-primary node expandable' name='"+  ((options.jump == true) ? href.replace('#','') : "")  + "' href='" + href + "'>" + node + "</a>" + "<b id='type' title='type'></b>"; 
    node += "<div class='expandable' id='" + href + "'>" + parseTree(val, ignore) + "</div></li>";
    return node;
}
       
/*
*   Methods
*/
function parseTree(nodes, ignore) {
    var tree = "<ul id='node' class='list-group'>";
    if(count > 0) tree = "<ul id='node-inner' class='list-group inner'>"
    
    if(nodes == null) {
        return tree + "<li class='list-group-item'>Nothing here!</li> </ul>";
    };
	for(var node in nodes) {
    	var val = nodes[node];
        count++;
    	if(typeof val === "object") {
    	    var newNode = Node("#"+genKey(8), node, val, tree, count, ignore);
    	    tree += newNode;           
    	} else {
            tree += "<li id="+count+">" + "<p id='ref' title='Node' class='list-group-item'> " + "<b>" + node.toUpperCase() + ":</b><b>  " + val.toString().toUpperCase() + "</b></p></li>";
    	};    
    }
    return tree + "</ul>"
}

function genKey(s) {
    return Math.random().toString(36).substring(3,s);
}

/*
*   Function
*/
function unjsonify(input, params, ignore, callback) {
    //Reset Count
    count = 0;
    //Set params, if any.
    if (typeof params === "object") options = params;
    //Begin Recursion
        //Support text or javascript object input of json.
    switch(typeof input) {
        case 'object':
            var htmlOut = "<div class='node-list'>"+parseTree(input, ignore)+"</div>";
            break;
        case 'text':
            var htmlOut = "<div class='node-list'>"+parseTree(JSON.parse(input), ignore)+"</div>";
            break;
        default:
            var htmlOut = "<div class='node-list'>"+parseTree(JSON.parse(input), ignore)+"</div>";
            break;
    }
    
  
    //Send user back their lovely html.
    callback(htmlOut);
}


return unjsonify;

})();