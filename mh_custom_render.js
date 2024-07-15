var sas = sas || {};
sas.cmd = sas.cmd || [];
sas.cmd.push(function() {
    sas.setup({ networkid: 9999, domain: "https://adapi.smartadserver.com", async: true, renderMode: 2 });
});
sas.cmd.push(function() {
    sas.call("onecall", {
        siteId: 12000,
        pageId: 67000,
        formats: [
            { id: 34000, tagId: "megabanner_format" }
            ,{ id: 35000, tagId: "lat_format_right"  }
            ,{ id: 36000, tagId: "lat_format_left"  }
        ],
        target: ''
    },{
        onAd: function(data){
            if (data.tagId == "megabanner_format") {
                sas.render("lat_format_right");
                sas.render("lat_format_left");
            }
        },
        onNoad: function(data){                
            if(data.tagId == 'megabanner_format') {
                // Check if a given bidder is not the winner (e.g. appnexus)
                if(
                    pbjsEqtv.getHighestCpmBids("12000/publisherdomain.com/" + data.formatId)[0] === undefined ||
                    pbjsEqtv.getHighestCpmBids("12000/publisherdomain.com/" + data.formatId)[0].bidderCode != "appnexus"
                ) {
                    sas.render('lat_format_right');
                    sas.render('lat_format_left');
                }
                else {
                    // Lateral formats will not be rendered
                    console.log('appnexus is the winner');
                    
                }
            }
        }
    });
});
