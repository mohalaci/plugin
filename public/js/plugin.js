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
    
    var payButton = document.getElementById("payWithBarionButton");
    if (payButton != null) {
        payButton.addEventListener("click", function() {
            genPaymentId();
            }, false
        );
    }
    var closeButton = document.getElementById("resultButton");
    if (closeButton != null) {
        closeButton.addEventListener("click", function(){
          closePlugin();
        }, false);
    }
    
    var backButton = document.getElementById("backButton");
    if (backButton != null) {
        backButton.addEventListener("click", function(){
          closePlugin();
        }, false);
    }
});

function genPaymentId() {
    $("#payWithBarionButton").attr('disabled', 'disabled');
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      $("#payWithBarionButton").removeAttr('disabled');
      if (this.readyState == 4 && this.status == 200) {
          var myObject = JSON.parse(this.responseText);
          var messageToPost = {
          'action':'Pay', 'paymentId':myObject.paymentId
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

function postToBarionHandler(message) {
    var handler = (window.webkit && window.webkit.messageHandlers) ? window.webkit.messageHandlers.barionPluginHandler : barionPluginHandler;
    if (handler != null && typeof handler != "undefined") {
        handler.postMessage(JSON.stringify(messageToPost));
    } else {
        alert("Handler is not attached.\r\nJSON: " + message);
    }
}

function closePlugin() {
    var messageToPost = {'action':'close'};
    if (window.webkit && window.webkit.messageHandlers){
        window.webkit.messageHandlers.barionPluginHandler.postMessage(JSON.stringify(messageToPost));      
    } else {
        barionPluginHandler.postMessage(JSON.stringify(messageToPost));
    }  
}
