
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
        iosBackgroundColor: '#1A80BB',
        materialBackgroundColor: '#1A80BB'
    },
    on: {
        pageInit(page) {
            console.log(page)
            if (page.route.path != "/done/" && page.route.path != "/failed/") {
                var query = page.route.query;
                console.log(query);
                getPaymentState(query.paymentId);
            }
            
        }
    }
});
var $$ = Dom7;
var barionMarket = new BarionMarket();
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
});



$(document).ready(function () {
    $(document).on('click', "#exitButton", barionMarket.closePlugin);

    $(document).on('click', ".navbar, .statusbar", function (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    });
    
});

function getPaymentState(paymentId){
    if (paymentId != "undefined") {
        $.ajax({
        method: "GET",
        url: "/getpaymentstate?paymentId="+paymentId,
        error: function (xhr, status, error) {
            alert("ERROR: " + error + "\r\nStatus: " + status);
        },
        success: function (data, status, xhr) {
            console.log(data);
            if (data.status == "Succeeded") {
                mainView.router.navigate('/done/', { animate: false });
            } else {
                mainView.router.navigate('/failed/', { animate: false });
            }
        },
        complete: function () {
            $("#payWithBarionButton").removeClass('disabled').removeAttr('disabled');
        }
    });
    }
    
}