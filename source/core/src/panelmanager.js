/* main */

//
if (typeof Minx === "undefined") {
    Minx = {};
}

// an event wrapper linking the panel with the event e and the function to call
// by setting upp this little wrapper with the trigger function - i can explicitly call the panel callback - so this is correct in the panael callback
Minx.Event = function(panel, callback) {
        this.trigger = function (e) {
                panel[callback](e);
        }
}

// the event 'queue'
Minx.Events = function(){
        // any global list?

        //panel a reference - ev the event we want, callback = the name of the 
        this.subscribe = function(panel, node, ev, callback) {
            if (typeof callback == "undefined") {
                callback = 'eventFired';
            }
            
            var mEv = new Minx.Event(panel, callback);

            // now add it back to the object that subscribed


            if(node == null) {
                node = panel.getNode();
            }

            if (typeof panel.addEvent !== "undefined") {
                panel.addEvent({node: node, ev: ev, mEv: mEv});
            }

            node.addEventListener(ev, mEv.trigger, true);   // let it bubble around
        }
};

// new event queue
Minx.eq = new Minx.Events();


// maintains a sigle hash of all panels
// adds a new panel
// removes panels
// gives the ability to set z-order
Minx.PanelManager = function() {
    var _panels = {};           // hash of all panels by id
    var _idCounter = 0;         // internal id counter
    var _pref = 'pn';           // panel id prefix - e.g. pn1, pn2...
    var _root_node;             // our root node - document.body by default
    var _types = {};
    
    // set up the root node and optionally add a single panel that resizes with the browser resizing
    this.init = function(auto) {
        //and our root panel representation of document.body
        _root_node = new Minx.Panel(null, "root");

        var main = null;

        // auto generate a main and set it to rezize on window resize
        if(auto) {
            main = Minx.pm.add(_root_node, 'simple');
            main.addClass('main-panel');
            var w = document.documentElement.clientWidth;
            var h = document.documentElement.clientHeight
            main.setSize(w, h);

            // this pretty much deals with any orientation change
            window.addEventListener('resize', function(){
                var nw = document.documentElement.clientWidth;
                var nh = document.documentElement.clientHeight
                main.setSize(nw, nh);

                // this redraws all kidies if thier geometry has changed
                main.render();

            }, true);
        }

        this._main = main;
        return this._main;
    };

    this.agent = function(){
        return {
            iphone : /iphone/i.test(navigator.userAgent),
            ipad : /ipad/i.test(navigator.userAgent),
            ipod : /ipod/i.test(navigator.userAgent),
            android : /android/i.test(navigator.userAgent),
            webos : /weblos/i.test(navigator.userAgent),
            blackberry : /blackberry/i.test(navigator.userAgent),
            online :  navigator.onLine,
            standalone : navigator.standalone
        };
    };

    this.isTouch = function() {
        var t = this.agent();
        var touch = t.iphone || t.ipad || t.ipad || t.android || t.blackberry;

        //DEV - simulate touch
        return true;

        return touch;
    }

    // add a panel type to my map to look up
    this.register = function(key, type) {
        _types[key] = type;
    }
    
    // default add is a pinned panel - all popups pass in the string 'main' to attach to the auto generated main
    this.add = function(parent, type){
        // default is a pinned panel
        if (typeof type == "undefined") {
            type = 'pinned';
        }

        // check if the new panel specifically wants wants main as its parent
        if (typeof parent == "string") {
            if(parent == 'main') {
                parent = this._main;
            }
            else {
                throw 'Not a recognised parent panel: - ' +  parent;
            }
        }

        // if no parent then attach it to the root node - normally will only happen once - with the main panel
        if(parent == null) {
            parent = _root_node;
        }

        return this._addType(parent, type);
    }

    // add a new panel - to a parent or root, create a managed id, add to our flat managed list of all panels
    // and return it - so client can mess with it
    this._addType = function(parent, type){
        // generate a managed id
        var id = _pref + (_idCounter++);

        // id counter could be used to increment z-index
        
        // make and create a new panel
        if(!(type in _types)) {
            throw 'panelmanager._addType(): Cant create panel of type: "' + type + '. Did you forget to add the script? ';
        }else {
            var tPan = new _types[type](parent, id);
        }
        
        // add to panels hash
        _panels[id] = tPan;

        return _panels[id];
    };


    // remove a panel and all children from our dom and managed lists
    this.remove = function(panel) {
        // if pnel is an id - find it in our managed list of _panels
        if(typeof panel == 'string') {
            panel = _panels[panel];
        }   

        // got one? cool, remove myself - (which will remove all children)
        if(panel) {

            // fade it out first
            panel.hide();
            
            // then remove from the dom .3 seconds later
            setTimeout(function() {
                var list = panel.removeMe();

                // delete al the removed panels from our managed list
                for(key in list) {
                    delete _panels[list[key]];
                }    

            },300);
        }
    };

    // need to stip these out with preprocessor or something
    this.log = function() {
        for(pan in _panels) {
            console.log(pan);
            console.log(_panels[pan]);
        }
    };
};

// singleton panel manager - instantiating 2 or more of these will get us multiples of the same element id's
Minx.pm = new Minx.PanelManager();

