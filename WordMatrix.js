/*/
/// WordMatrix
/// Version: 2.2
/// Written by: Sam Mulqueen <sammulqueen.nz@gmail.com>
/*/
function WordMatrix($SETTER$, $GETTER$, $AFTERSET$, $SEPARATE$, $UNSAFE$, $REVERSE$){
    if(typeof $SETTER$ != "function"){
        $REVERSE$ = $UNSAFE$;
        $UNSAFE$ = $SEPARATE$;
        $SEPARATE$ = $GETTER$;
        $GETTER$ = $SETTER$;
        $SETTER$ = function(value){ return value; };
    }
    if(typeof $GETTER$ != "function"){
        $REVERSE$ = $UNSAFE$;
        $UNSAFE$ = $SEPARATE$;
        $SEPARATE$ = $AFTERSET$;
        $AFTERSET$ = $GETTER$;
        $GETTER$ = function(value){ return value; };
    }
    if(typeof $AFTERSET$ != "function"){
        $REVERSE$ = $UNSAFE$;
        $UNSAFE$ = $SEPARATE$;
        $SEPARATE$ = $AFTERSET$;
        $AFTERSET$ = function(value){ return value; };
    }
    if(!type($SEPARATE$, "string")){
        if(!type($UNSAFE$, "undefined")){
            $REVERSE$ = $UNSAFE$;
            $UNSAFE$ = $SEPARATE$;
        }
        $SEPARATE$ = '\ ';
    }
    
    if(!$UNSAFE$ || !type($UNSAFE$, "string")) $UNSAFE$ = "";
    function Matrix(search, save){
        if(type(search, 'string') && !save){
            var path,
                sep = $SEPARATE$,
                seperator = new RegExp('['+sep+']+'),
                strip_chars = new RegExp($UNSAFE$.length ? '['+$UNSAFE$+']+':'[^A-Za-z0-9_'+$SEPARATE$+'\$]+'),
                step, 
                cursor = Matrix,
                path = search.split(seperator);

            if($UNSAFE$.length){
                search = search.split(strip_chars).join('');
            }

            if($REVERSE$){
                path = path.reverse();
            }
            while(path.length){
                step = path.shift();
                if(step === '') continue;
                if(['undefined', 'function'].indexOf(type(cursor[step]))<0){
                    cursor[step] = WordMatrix.call(cursor, $SETTER$, $GETTER$, $AFTERSET$, $SEPARATE$, $UNSAFE$, $REVERSE$);
                    cursor[step](cursor[step], true);
                }
                if(!type(cursor[step], "function")){
                    cursor[step] = WordMatrix.call(cursor, $SETTER$, $GETTER$, $AFTERSET$, $SEPARATE$, $UNSAFE$, $REVERSE$);
                    cursor[step](undefined, true);
                }
                if(step!=='__'){
                    cursor[step].__ = cursor;
                }
                cursor = cursor[step];
                if(cursor[" "]!=sep && path.length){
                    cursor = cursor(path.shift());
                }
            }
            return cursor;
        }else if(save){
            $VALUE$ = $SETTER$.call(Matrix, search);
            $AFTERSET$.call(Matrix);
            return Matrix;
        }else{
            return $GETTER$.call(Matrix, $VALUE$);
        }
    };
    Matrix.__ = type(this, "function") ? this : Matrix;
    Matrix[" "] = $SEPARATE$;

    var $VALUE$ = $SETTER$.call(Matrix, undefined);
    return Matrix;
}

WordMatrix.getName = function(matrix){
    if(typeof matrix == "function"){
        function recurse(key, child){
            var parent = child.__;
            for(var name in parent){
                if(name != '__' && typeof parent[name] == "function" && parent[name] == child){
                    return recurse(key==""?name:name+parent[" "]+key, parent);
                }
            }
            return key;
        }
        return recurse('', matrix);
    }
    return null;
};

WordMatrix.hasPhrase = function(matrix, phrase){
    if(typeof phrase !== "string") throw "Second argument must be a string";
    function search(matrix, phrase){
        var sep = matrix[" "]||"\ ";
        var keys = phrase.split(new RegExp("["+sep+"]+","g"));
        var cursor = matrix;
        for(var i=0; i<keys.length; i++){
            key = keys[i];
            cursor = cursor[key];
            if(typeof cursor != "function"){
                return null;
            }else if(sep != cursor[" "]){
                i++;
                cursor = search(cursor, keys[i]);
                if(!cursor) return null;
            }    
        }
        return cursor;
    }
    return search(matrix, phrase);
};

WordMatrix.getBase = function(matrix){
    if(typeof matrix == "function"){
        function recurse(child){
            var parent = child.__;
            if(typeof parent == 'undefined' || typeof parent != "function" || child == parent) return child;
            else return recurse(parent);
        }
        return recurse(matrix);
    }
    return null;
}

WordMatrix.toObject = function(matrix){
    var obj = {};
    if(typeof matrix != 'function') return matrix;
    Object.keys(matrix).forEach(function(key){
        obj[key] = matrix[key];
    });
    return obj;
}

WordMatrix.getPhrases = function(matrix, full){
    var phrases = [];
    if(full){
        if(!type(matrix.__, 'function')){
            var previous = matrix;
            var cursor = previous.__;
            while(cursor != previous){
                if(!type(cursor.__, 'function')) break;
                previous = cursor;
                cursor = previous.__;
            }
            return WordMatrix.getPhrases(cursor);
        }
        return WordMatrix.getPhrases(matrix);
    }else{
        var sep = matrix[" "] || " ";
        var keys = Object.keys(matrix);
        if(!keys.length){
            return phrases;
        }
        keys.forEach(function(key){
            if(key == "__") return;
            if(key == " ") return;
            phrases.push(key);
            if(typeof matrix[key] == 'function'){
                var subkeys = WordMatrix.getPhrases(matrix[key]);
                if(!subkeys.length){
                    return;
                }
                subkeys.forEach(function(subkey){
                    phrases.push(key+sep+subkey);
                });
            }
        });
    }
    return phrases;
}

/*/
/// `type` function
/// Returns the type of a value or checks if the value is a specific type
/// Written by Sam Mulqueen.
/*/
var type;
type = typeof type == "function" ? type : function(value, type){
    return typeof type == "string" ? typeof value == type : typeof value;
};

/// Add to module.exports so it can be imported with the require function
var module;
if(type(module, 'object')){
    module.exports = WordMatrix;
}


/*/
/// Usage Example:

/// Create a new WordMatrix with the string `Alpha` stored at the root node
var Alpha = WordMatrix('Alpha');

/// Log the value stored at the root
console.log(Alpha()); // outputs> Alpha

/// * No arguments are passed to the WordMatrix to show you want to GET the value at that node. *

/// Set the value stored at the root node to the string `Snoopy`
Alpha('Snoopy', true);

/// * The second value is true to show you are choosing to SET the value. *

/// Log to check if it's changed
console.log(Alpha()); // outputs> Snoopy

/// Navigate to the path Alpha.has.the.name by using the search string `has the name`
/// Then set the value there to the string `Alpha` at that node.
Alpha('has the name')('Alpha', true);

/// * Passing just a string to the WordMatrix function shows you are navigating to a child node *

/// The method above creates the new nodes along the path of the input string, and returns the last node in the path.
/// Then by calling it and passing true after the value, you can set the value there to something.

/// So now you can access it using a few different ways...
/// To show an example of this check out the following code: 

Alpha('says')(function(message){
  console.log(message);
}, true);

/// This stores a function at the node `Alpha.says` which logs a message
/// You can now use the following ways to log some messages

Alpha.says()('Dot notation');
Alpha['says']()('Square brackets notation');
Alpha('says')()('WordMatrix search notation');

/// Notice the () in each example, that is where you GET the value of the node at `Alphi.says`, which in this case is a function that logs a message.

Alpha('says')()('My name is ' + Alpha.has.the.name()); // outputs> My name is Alpha

/// Only characters allowed in variable names in javascript are allowed by default
/// All other characters are stripped from the search strings
Alpha('YELLS!!!')('something', true);

Alpha.YELLS(); //> 'something'

/// To use more characters pass a true value to the second argument of the constructor
/// For example:

var an_object = {'because object keys can have characters like this!#@$^&': "so pass true as second argument to allow the WordMatrix keys to have more characters"};
var $BLING$ = WordMatrix(an_object, true);

/// * Passing true as the second argument when creating a WordMatrix shows you want to allow more characters *

/// Now you can do this

$BLING$('$$$ MONEY B@BY')(3.50, true); // Pass true here to set the value 

/// You can now get it using:
console.log("Can I get: $" + $BLING$['$$$'].MONEY['B@BY']() );

/// This mode is called unsafe mode.
/// When using the default mode however, you can be sure that you will always be able to use dot notation when accessing a node in the WordMatrix, and you won't ever need to use ['key'] notation.

/*/