
var app = new Framework7({
    root: '#app',
    name: 'My App',
    id: 'com.myapp.test',
    init: false,
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
        iosBackgroundColor: '#1A80BB',
        materialBackgroundColor: '#1A80BB'
    }
});
var $$ = Dom7;
var mainView = app.views.create('.view-main');

app.statusbar.setIosTextColor('white');
app.statusbar.setBackgroundColor('#1A80BB');

app.on('init', function() {
    if ($('html.ios').length > 0) {
        $('body').scrollTop(20);
        $('.view').scrollTop(20);
    } else {
        app.statusbar.hide();
    }
    var query = e.query;
    console.log(query);
});

app.onPageInit('home', function(page){
    var query = page.route.query;
    console.log(query);
    getPaymentState(query.paymentId);
});

$(document).ready(function () {
    $(document).on('click', "#exitButton", closePlugin);

    $(document).on('click', ".navbar, .statusbar", function (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    });
    
});

function postToBarionHandler(obj) {
    var handler = null;
    var message = JSON.stringify(obj);
    if (typeof barionPluginHandler != "undefined") {
        handler = barionPluginHandler;
    } else {
        handler = (typeof window.webkit != "undefined" 
                && typeof window.webkit.messageHandlers != "undefined" 
                && typeof window.webkit.messageHandlers.barionPluginHandler != "undefined") ? window.webkit.messageHandlers.barionPluginHandler : null;
    }
    if (typeof handler != "undefined" && handler != null) {
        handler.postMessage(message);
    } else {
        alert("Handler is not attached.\r\nJSON: " + message);
    }
}

function getPaymentState(paymentId){
    $.ajax({
        method: "GET",
        url: "/getpaymentstate?paymentId="+paymentId,
        error: function (xhr, status, error) {
            alert("ERROR: " + error + "\r\nStatus: " + status);
        },
        success: function (data, status, xhr) {
            console.log(data);
            if (data.status == "Succeeded") {
                mainView.router.load('done.html');
            } else {
                mainView.router.load('failed.html');
            }
        },
        complete: function () {
            $("#payWithBarionButton").removeClass('disabled').removeAttr('disabled');
        }
    });
}

function closePlugin() {
    var closeObj = {'action':'close'};
    postToBarionHandler(closeObj);
}
