if (typeof Mtk === "undefined") {
    Mtk = {};
} 



Mtk.AppStart = function() {
    
    // true to create the first main panel and set it to auto size - this attaches to document.body
    var rootPanel = Minx.pm.init(true);

    // the logon view
    Mtk.Logon = function() {
       
    };

    // the main app view
    Mtk.AppView = function() {
        
        // create a tablet split view layout
        var mainLayout = new Minx.Layout.SplitLayout(rootPanel, 400, 400);

        //create a phone layout
        /*var mainLayout = new Minx.Layout.NavMainLayout(rootPanel);*/


        // ****** some direct button hookage 

        // add my specific button to pop something up
        var rbutton = mainLayout.getMainPanel().getTitle().addButton('r', 20, 'Pop');

        rbutton.onClick(function(panel,e){
            popup();
        });

        
// ****** a model driven backbone view where the view recieves the events 

        //------------ get some known panel (navigation) from my splitViewLayout

        // now instantiate my MainMenu Widgetview
        // so ge the menu container from my Split Layout
        var container = mainLayout.getNavPanel().getContentPanel();

        // ----------- wrap in a view and instantiate a widget of known type
        // make my widget wrapper for my widget in this container
        var mainMenu = new BackboneMinxWrap.WidgetWrap(container, 'list-scroll-panel');
        
        // main menu item click
        mainMenu.onViewEvents(function(panel, ev){
            alert("I know you clicked on - " + ev.id);  
        });

        // get my widget and set the row template function - uses seperate underscore template
        mainMenu.getWidget().setRowRenderer(function(parentId, row){
            var div = document.createElement('div');
            
            // compose a new model - with the raw data and soe pretty formatted data
            var model = {};
            model.raw = row;

            // call the account template prettyfier
            model.pretty = Mtk.Templates.prettyAccount(row);
            
            // now call the underscore template
            div.innerHTML = Mtk.Templates.navAccount(model);
            return div;
        })
        
        console.log(Mtk.test_accounts);

        mainMenu.bindCollection(Mtk.test_accounts);



        // and draw everything attached to the root
        rootPanel.show();




/*
        //----- example of using backbones ajax backed model -------

        var person = 'dan';

        Mtk.Accounts = Backbone.Collection.extend({
          url: function() {
            return "http://192.168.1.103:8080/api/person/" + person +'/account';
          }
        });

        Mtk.accounts = new Mtk.Accounts();

        // ----------- bind a backbone model to my view and hence widget
        // attach the data model to our menu
        mainMenu.bindCollection(Mtk.accounts);

        Mtk.accounts.fetch();
*/

    };


    // directly create an input-pop-up outside backbone wrappers

    function popup(){
        
        var pop = Minx.pm.add('main', 'input-pop-up');
        pop.setSize(400, 300);
       
        var cancelBtn = pop.getFootBar().addButton('l', 10, 'Cancel');
        
        cancelBtn.onClick(function(panel,e){
            pop.hide();
        });
        
        var okBtn = pop.getFootBar().addButton('r', 10, 'Logon');
        
        okBtn.onClick(function(panel,e){
            alert('OK');
        });                    

        pop.show();

    }

    // construct all of the above

    var mtkApp = new Mtk.AppView();

};


// some static test data to bind to the backbone view

Mtk.test_accounts = new Backbone.Collection([
  {
    "synchbalpounds": 10.00, 
     
    "parser": "simple", 
    "accountname": "123456789", 
    "balance": 40514, 
    "synchbalpennies": 0, 
    "balancepounds": 405.14, 
    "bankname": null, 
    "xcount": 12, 
    "baltype": "calculated", 
    "hidden": 0, 
    "type": "Cheque", 
    "status": 1, 
    "maxviewed": 0, 
    "which": "positive", 
    "rolled": [], 
    "synchdate": "2011-06-12T11:06:30.594359",  
    "synchbal": 1000, 
    "synched": true, 
    "xacts": [],  
    "balancepennies": 0, 
    "synchbalwhich": "positive", 
    "keyname": "a1",  
    "display": "Maine"
  }, 
  {
    "synchbalpounds": 0.00, 
     
    "parser": "simple", 
    "accountname": "1234567890123456", 
    "balance": 0, 
    "synchbalpennies": 0, 
    "balancepounds": 0.00, 
    "bankname": null, 
    "xcount": 0, 
     
    "baltype": "bad", 
    "hidden": 0, 
    "type": "Ballsac", 
    "status": 1, 
    "maxviewed": 0, 
    "which": "positive", 
    "rolled": [], 
    "synchdate": null, 
     
    "synchbal": 0, 
    "synched": false, 
    "xacts": [], 
     
    "balancepennies": 0, 
    "synchbalwhich": "positive", 
    "keyname": "a2", 
     
    "display": "CreditCard"
  }, 
  {
    "synchbalpounds": 345.05, 
     
    "parser": "simple", 
    "accountname": "1", 
    "balance": 38622, 
    "synchbalpennies": 0, 
    "balancepounds": 386.22, 
    "bankname": "www.mtk_test.com", 
    "xcount": 8, 
     
    "baltype": "calculated", 
    "hidden": 0, 
    "type": "Cheque", 
    "status": 1, 
    "maxviewed": 0, 
    "which": "positive", 
    "rolled": [], 
    "synchdate": "2011-06-12T11:05:52.304879", 
     
    "synchbal": 34505, 
    "synched": true, 
    "xacts": [], 
     
    "balancepennies": 0, 
    "synchbalwhich": "positive", 
    "keyname": "a3", 
     
    "display": "Test Current"
  }, 
  {
    "synchbalpounds": 345.05, 
     
    "parser": "simple", 
    "accountname": "3", 
    "balance": 38622, 
    "synchbalpennies": 0, 
    "balancepounds": 386.22, 
    "bankname": "www.mtk_test.com", 
    "xcount": 8, 
     
    "baltype": "calculated", 
    "hidden": 0, 
    "type": "Cheque", 
    "status": 1, 
    "maxviewed": 0, 
    "which": "positive", 
    "rolled": [], 
    "synchdate": "2011-06-12T11:05:53.027254", 
     
    "synchbal": 34505, 
    "synched": true, 
    "xacts": [], 
     
    "balancepennies": 0, 
    "synchbalwhich": "positive", 
    "keyname": "a4", 
     
    "display": "Test Savings"
  }, 
  {
    "synchbalpounds": 23.40, 
     
    "parser": "synchronised", 
    "accountname": "1001001006", 
    "balance": 6457, 
    "synchbalpennies": 0, 
    "balancepounds": 64.57, 
    "bankname": "www.mtk_proxy_test.com", 
    "xcount": 8, 
     
    "baltype": "calculated", 
    "hidden": 0, 
    "type": "Cheque", 
    "status": 1, 
    "maxviewed": 0, 
    "which": "positive", 
    "rolled": [], 
    "synchdate": "2011-06-12T11:06:01.796046", 
     
    "synchbal": 2340, 
    "synched": true, 
    "xacts": [], 
     
    "balancepennies": 0, 
    "synchbalwhich": "positive", 
    "keyname": "a5", 
     
    "display": "Test Proxy Account"
  }, 
  {
    "synchbalpounds": 23.40, 
     
    "parser": "synchronised", 
    "accountname": "1001001007", 
    "balance": 6457, 
    "synchbalpennies": 0, 
    "balancepounds": 64.57, 
    "bankname": "www.mtk_proxy_test.com", 
    "xcount": 8, 
     
    "baltype": "calculated", 
    "hidden": 0, 
    "type": "Cheque", 
    "status": 1, 
    "maxviewed": 0, 
    "which": "positive", 
    "rolled": [], 
    "synchdate": "2011-06-12T11:06:04.038329", 
     
    "synchbal": 2340, 
    "synched": true, 
    "xacts": [], 
     
    "balancepennies": 0, 
    "synchbalwhich": "positive", 
    "keyname": "a6", 
     
    "display": "Test P Savings"
  }
]);




