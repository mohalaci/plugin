var app = new Framework7({
    root: '#app',
    name: 'My App',
    id: 'com.myapp.test',
    panel: {
        swipe: 'left',
    },
    routes: [
        {
            path: '/done.html',
            url: 'done.html'
        },
        {
            path: '/failed.html',
            url: 'failed.html'
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
var ptr = app.ptr.create('.ptr-content');

var ptrContent = $$('.ptr-content');
ptrContent.on('ptr:refresh', function (e) {
    app.ptr.done();
});

app.statusbar.setIosTextColor('white');
app.statusbar.setBackgroundColor('#1A80BB');

app.on('init', function(){
    if ($('html.ios').length > 0) {
        $('body').scrollTop(20);
        $('.view').scrollTop(20);
    } else {
        app.statusbar.hide();
    }
});

$(document).ready(function () {
    $(document).on('click', "#payWithBarionButton", generatePaymentId);
    $(document).on('click', "#resultButton", closePlugin);
    $(document).on('click', "#backButton", closePlugin);
});

function postToBarionHandler(message) {
    var handler = null;
    if (typeof barionPluginHandler != "undefined") {
        handler = barionPluginHandler;
    } else {
        handler = (typeof window.webkit != "undefined" 
                && typeof window.webkit.messageHandlers != "undefined" 
                && typeof window.webkit.messageHandlers.barionPluginHandler != "undefined") ? window.webkit.messageHandlers.barionPluginHandler : null;
    }
    if (typeof handler != "undefined" && handler != null) {
        handler.postMessage(JSON.stringify(messageToPost));
    } else {
        alert("Handler is not attached.\r\nJSON: " + message);
    }
}

function generatePaymentId() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
          var myObject = JSON.parse(this.responseText);
          var messageToPost = {
              'action': 'Pay', 
              'paymentId': myObject.paymentId
          };
          postToBarionHandler(JSON.stringify(messageToPost));
      }
    };
    xhttp.open("GET", "https://plugin.mobileappdev.org/genpayment", true);
    xhttp.send();
}

function successfulPaymentCallback(data) {
    window.location.href = "/done.html";
}

function unSuccessfulPaymentCallback(data) {
    window.location.href = "/failed.html";
}

function closePlugin() {
    var messageToPost = {'action':'close'};
    postToBarionHandler(JSON.stringify(messageToPost));
}