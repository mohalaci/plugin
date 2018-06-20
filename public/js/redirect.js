
var app = new Framework7({
    root: '#app',
    name: 'My App',
    id: 'com.myapp.test',
    routes: [
        {
            path: '/done/',
            url: '/done.html'
        },
        {
            path: '/failed/',
            url: '/failed.html'
        }
    ],
    navbar: {
        hideOnPageScroll: false,
        iosCenterTitle: true
    },
    statusbar: {
        enabled: true,
        overlay: true,
        iosOverlaysWebView: false,
        iosBackgroundColor: '#0097DB',
        materialBackgroundColor: '#0097DB'
    },
    on: {
        pageInit(page) {
            if (page.route.path != "/done/" && page.route.path != "/failed/") {
                var query = page.route.query;
                var _t = setTimeout(function() {
                    getPaymentState(query.paymentId);
                }, 2000);
            }
            
        }
    }
});
var $$ = Dom7;
var barionMarket = new BarionMarket();
var mainView = app.views.create('.view-main');

app.statusbar.setIosTextColor('white');
app.statusbar.setBackgroundColor('#0097DB');

app.on('init', function() {
    if ($$('html.device-ios').length > 0) {
        $$('body').scrollTop(20);
        $$('.view').scrollTop(20);
    } else {
        app.statusbar.hide();
        $$('body').scrollTop(20);
        $$('.view').scrollTop(20);
    }
});

$$(document).on('DOMContentLoaded', function(){
    $$(document).on('click', "#exitButton", barionMarket.closePlugin);

    $$(document).on('click', ".navbar, .statusbar", function (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    });

    if ($$('html.device-ios').length > 0) {
        $$('body').scrollTop(20);
        $$('.view').scrollTop(20);
    } else {
        app.statusbar.hide();
        $$('body').scrollTop(20);
        $$('.view').scrollTop(20);
    }
    
    $(".page-content").addClass('fading-out');
    setTimeout(function() { $(".page-content").removeClass('fading-out').addClass('fading-in'); }, 1000);
    setTimeout(function() { $(".page-content").removeClass('fading-in'); }, 2000);
});



function getPaymentState(paymentId){
    if (paymentId != "undefined") {
        app.request({
        method: "GET",
        url: "/getpaymentstate?paymentId="+paymentId,
        error: function (xhr, status, error) {
            alert("ERROR: " + error + "\r\nStatus: " + status);
        },
        success: function (data, status, xhr) {
            if (JSON.parse(data).status == "Succeeded") {
                mainView.router.navigate('/done/', { animate: false });
            } else {
                mainView.router.navigate('/failed/', { animate: false });
            }
        },
        complete: function () {
            $$("#payWithBarionButton").removeClass('disabled').removeAttr('disabled');
        }
    });
    }
    
}