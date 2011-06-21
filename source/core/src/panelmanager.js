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

// the event 'queue' - not even a queue but could be if we wanted to manage all events
// for now this creates a simple wrapper function so that when the handler is called on the panel - 'this' is in scope
// it also adds the event to the list of events for the individual panel - so each panel could manage its own event list
Minx.Events = function(){
        // any global list?

        //panel a reference - ev the event we want, callback = the name of the 
        this.subscribe = function(panel, node, ev, callback) {
            if (typeof callback == "undefined") {
                callback = 'eventFired';
            }
            
            // wrapper to call the event on the panel
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


// ipad = 1024 x 610
//      = 768 x 866

// new event queue
Minx.eq = new Minx.Events();


// maintains a sigle hash of all panels
// adds a new panel
// removes panels
// gives the ability to set z-order
Minx.PanelManager = function() {

    this.localMobileTest = false;

    var _panels = {};           // hash of all panels by id
    var _idCounter = 0;         // internal id counter
    var _pref = 'pn';           // panel id prefix - e.g. pn1, pn2...
    var _root_node;             // our root node - document.body by default
    var _types = {};
    
    this.dims = {};              // public object wit device dimensions
    
    this.calcDims = function() {
        
        var nw = document.documentElement.clientWidth;
        var nh = document.documentElement.clientHeight

        // height is sorted automatically
        this.dims.h = nh;
        this.dims.w = nw;

        this.dims.or = 'l';
        if(nw < nh) {
            this.dims.or = 'p';
        }

        // need to detect real evice width because the client width has been fixed to allow smooth repositioning
        // if it is set to auto size then the snap to 0,0 is ugly
        if(this.dims.ipad) {
            
                if(nh > 768) {  // must be portrait
                    this.dims.or = 'p';
                    // TODO - get te ipad2 dimensions!!
                    this.dims.w = 768;
                }
                else {
                    this.dims.or = 'l';
                }
                
        }

        // portrait - 1024, 1155
        // landscape - 1024, 610

    };

    this.calcDevice = function() {
        // check if we are in stand alone mode
        if( ("standalone" in window.navigator) && window.navigator.standalone) {
            this.dims.sa = true;
        }
        else {
            this.dims.sa = false;
        }

        this.dims.iphone       = this.agent().iphone;
        this.dims.ipad         = this.agent().ipad;
        this.dims.ipod         = this.agent().ipod;
        this.dims.android      = this.agent().android; 
        this.dims.webos        = this.agent().webos;
        this.dims.blackberry   = this.agent().blackberry; 

        this.ver = 0;
        
        var nw = document.documentElement.clientWidth;
        var nh = document.documentElement.clientHeight

        // landscape width
        this.dims.lw = nw;

        // 'device-height' in the meta tags will fix this 
        if(this.dims.ipad) {
            if(nw == 1024) { // ipad 1
                this.ver = 1;
                this.dims.pw = 768; // portrait width
            }
            if(nw > 1024) { // ipad 2
                this.ver = 2;
            }
        }
        if(this.dims.iphone) {
            if(nw == 320) { // ipone 3
                this.ver = 3;
                this.dims.pw = 320; // portrait width
            }
            if(nw > 1024) { // iphone 4 retina 
                this.ver = 4;
            }
        }

        this.calcDims();

    };


    // set up the root node and optionally add a single panel that resizes with the browser resizing
    this.init = function(auto) {

        this.calcDevice();

        //and our root panel representation of document.body
        _root_node = new Minx.Panel(null, "root");

        var main = null;

        var me = this;

        // auto generate a main and set it to rezize on window resize
        if(auto) {
            main = Minx.pm.add(_root_node, 'simple');
            main.addClass('main-panel');
            main.setAnimate(false);                                     // TODO - try it both ways

            main.getNode().innerHTML = '<div id="back-top"></div>';

            main.setSize(this.dims.w, this.dims.h);            

            var changing = false;
            function oChange(){

                if(!changing) {
                    changing = true;
                    me.calcDims();

                    console.log("w="+me.dims.w + " h="+ me.dims.h);
                    main.setSize(me.dims.w, me.dims.h);
                    
                    // this constructs main panel geometry and updates kids - redraws all kidies if thier geometry has changed
                    // but doesnt redraw the main panel
                    main.layout();
                    main.drawKids();

                    //main.render();            // rendering the main section can cause flicker
                    changing = false;
                }
            }
        
            if(this.isTouch() && !this.localMobileTest) {
                window.addEventListener('orientationchange', function(){
                    var orientation = window.orientation;

                    console.log(orientation);
                    oChange();

                }, true);
            } else {

                // this pretty much deals with any orientation change
                window.addEventListener('resize', oChange, true);
            }

        }
        else {
            
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
        if(this.localMobileTest){
            return true;
        }

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
    // equivalent to delete 
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
                var list = panel._removeMe();

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

