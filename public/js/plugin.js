var $selectedBook = 0;

var app = new Framework7({
    root: '#app',
    name: 'My App',
    id: 'com.myapp.test',
    panel: {
        swipe: 'left',
    },
    routes: [
        {
            name: 'bookdetails',
            path: '/bookdetails/',
            url: 'bookdetails.html',
            on: {
                pageInit: function (e, page) {
                    if ($selectedBook > 0) {
                        var bookData = books[$selectedBook - 1];
                        var bookDetailsTemplate = $$('script#detailsTemplate').html();
                        var compiledTemplate = Template7.compile(bookDetailsTemplate);
                        var content = compiledTemplate(bookData);
                        $(".book-template").html(content);
                    }
                }
            },
            pushState: true
        },
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
    var bookListTemplate = $$('script#listTemplate').html();
    var compiledTemplate = Template7.compile(bookListTemplate);
    var content = compiledTemplate({ books: books });
    $(".list-template").html(content);
    
    $(document).on('click', "#payWithBarionButton", generatePaymentId);
    $(document).on('click', "#resultButton", closePlugin);
    $(document).on('click', "#exitButton", closePlugin);
    $(document).on('click', ".back-link", function () {
        mainView.router.back();
    });
    $(document).on('click', ".book-link", function () {
        $selectedBook = $(this).attr("data-book-id");
    });
    
    $(document).on('click', ".navbar, .statusbar", function(e) {
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

function generatePaymentId() {
    $("#payWithBarionButton").addClass('disabled').attr('disabled', 'disabled');
    var book = books[$selectedBook - 1];
    $.ajax({
        method: "POST",
        url: "/genpayment",
        data: {
            bookAuthor: book.bookAuthor,
            bookTitle: book.bookTitle,
            bookISBN: book.bookISBN,
            bookPublisher: book.bookPublisher,
            bookPrice: book.bookPrice
        },
        dataType: "json",
        error: function(xhr, status, error) {
            alert("ERROR: " + error + "\r\nStatus: " + status);
        },
        success: function(data, status, xhr) {
            if (status == "success") {
                var messageObj = {
                    'action': 'Pay', 
                    'paymentId': data.paymentId
                };
                postToBarionHandler(messageObj);
            } else {
                alert("Request finished with status code '" + status + "', could not process response.");
            }
        },
        complete: function() {
            $("#payWithBarionButton").removeClass('disabled').removeAttr('disabled');
        }
    });
}

function successfulPaymentCallback(data) {
    window.location.href = "/done.html";
}

function unSuccessfulPaymentCallback(data) {
    window.location.href = "/failed.html";
}

function closePlugin() {
    var closeObj = {'action':'close'};
    postToBarionHandler(closeObj);
}
