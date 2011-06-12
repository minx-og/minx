// all templates 
if (typeof Mtk.Templates === "undefined") {
    Mtk.Templates = {};
} 

// use {{}} for templates
_.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
};


function formatamount(val, type) {
            var v_class = 'debi';
            if (type == 'positive') {
                v_class = 'cred';
            }

            var valstring = '&pound;' + val.toFixed(2);

            return '<h1 class="left ' + v_class + '">' + valstring + '</h1>'; // TODO - investigate un - embedding this view
        }

        function formatrightblock(maxViewed, maxXcount, recentXacts) {
            var html = '<div class="right star"><img src="';

            if ((maxViewed < maxXcount) || (recentXacts > 0)) {
                html += 'img/ic_new_star.png';
            }
            else {
                html += 'img/ic_no_new_star.png';
            }

            html += '"></img></div>';

            return html;
        }

        function formatdateblock(syncdate) {
            var html = '';

            if (syncdate) {
                html += '<p class="middle">Updated' + syncdate.format("dddd, mmmm dS") + '</p>';
            }
            else {
                html += '<p class="middle">Not updating</p>';
            }

            return html;
        }


Mtk.Templates.prettyAccount = function(model) {

      
            var val = model.synchbalpounds;
            var type = model.synchbalwhich;

            var maxViewed = model.maxviewed;
            var maxXcount = model.xcount;
            var recentXacts = model.recentcount;

            // iOs or mobile webkit hacking
            var syncdate = null;
            if(model.synchdate) {
              var arr = model.synchdate.split(/[- :T]/);
              syncdate = new Date(arr[0], arr[1]-1, arr[2], arr[3], arr[4], arr[5]);
            }

            pretty = {};
            var v_class = 'debi';
            if (type == 'positive') {
                pretty.v_class = 'cred';
            }

            var valstring = '&pound;' + val.toFixed(2);

            if ((maxViewed < maxXcount) || (recentXacts > 0)) {
                pretty.star_img = 'img/ic_new_star.png';
            }
            else {
                pretty.star_img = 'img/ic_no_new_star.png';
            }

            if (syncdate) {
                pretty.date = syncdate.format("dddd, mmmm dS");
            }
            else {
                pretty.date = 'Not updating';
            }

            return pretty;
}


Mtk.Templates.navAccount = _.template('\
        <div class="left">\
            <img class="bank" src="img/lloyds-embos-small.png"></img>\
        </div>\
            <h1 class="left">{{raw.display}}</h1>\
            <div class="right">\
                <div class="right star"><img src="{{pretty.star_img}}"></img></div>\
            </div>\
            <div class="clear-r"></div>\
            <div class="midbot">\
                <h1 class="left {{pretty.v_class}}"> {{pretty.valstring}}</h1>\
            </div>\
            <div class="right dblk">\
              <p class="middle">{{pretty.date}}</p>\
            </div>\
        </div>'
);

/*
{{starblock}}\
{{dateblock}}\
*/