var $selectedBook = 0;
var $shippingAddress = null;
var $defaultShipping = {
    "stairway": "A",
    "lastName": "Doe",
    "prefix": "Dr.",
    "firstName": "John",
    "street": "Teszt utca",
    "type": "Private",
    "comment": "",
    "city": "Budapest",
    "postalCode": "1234",
    "streetNumber": "32.",
    "floor": "2",
    "taxNumber": "10203040",
    "country": "Hungary",
    "door": "5",
    "companyName": "Test Inc."
};

var app = new Framework7({
    root: '#app',
    name: 'My App',
    id: 'com.myapp.test',
    panel: {
        swipe: 'left',
    },
    routes: [
        {
            name: 'booklist',
            path: '/booklist/',
            page: 'booklist',
            url: '/',
            on: {
                pageInit: function (e, page) {
                    var bookListTemplate = $$('script#listTemplate').html();
                    var compiledTemplate = Template7.compile(bookListTemplate);
                    var content = compiledTemplate({ books: books });
                    $(".list-template").html(content);
                }
            }
        },
        {
            name: 'bookdetails',
            path: '/bookdetails/',
            url: '/bookdetails.html',
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
            }
        },
        {
            name: 'summary',
            path: '/summary/',
            url: '/summary.html',
            on: {
                pageInit: function (e, page) {
                    if ($selectedBook > 0 && $shippingAddress != null) {
                        var bookData = books[$selectedBook - 1];
                        var summaryData = {
                            book: bookData,
                            shipping: $shippingAddress
                        };
                        var summaryTemplate = $$('script#summaryTemplate').html();
                        var compiledTemplate = Template7.compile(summaryTemplate);
                        var content = compiledTemplate(summaryData);
                        $(".summary-template").html(content);
                    }
                }
            }
        },
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
mainView.router.allowPageChange = true;

app.statusbar.setIosTextColor('white');
app.statusbar.setBackgroundColor('#1A80BB');

app.on('init', function () {
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

    $(document).on('click', "#payWithBarionButton", getPaymentId);
    $(document).on('click', "#setShippingButton", getShippingAddress);
    $(document).on('click', "#resultButton", closePlugin);
    $(document).on('click', "#exitButton", closePlugin);

    $(document).on('click', ".book-list-item", function () {
        var $card = $(this).find('.card');
        $card.addClass('touched');
        $selectedBook = $(this).attr("data-book-id");
        mainView.router.navigate("/bookdetails/");
    });

    $(document).on('click', ".backToList-link", function (e) {
        e.preventDefault();
        e.stopPropagation();
        mainView.router.back('/booklist/', { force: true });
    });

    $(document).on('click', ".backToDetails-link", function (e) {
        e.preventDefault();
        e.stopPropagation();
        mainView.router.back('/bookdetails/', { force: true });
    });

    $(document).on('click', ".book-link", function () {
        $selectedBook = $(this).attr("data-book-id");
    });

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

function getPaymentId() {
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
        error: function (xhr, status, error) {
            alert("ERROR: " + error + "\r\nStatus: " + status);
        },
        success: function (data, status, xhr) {
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
        complete: function () {
            $("#payWithBarionButton").removeClass('disabled').removeAttr('disabled');
        }
    });
}

function getShippingAddress() {
    var shippingObj = { 'action': 'setshipping' };
    postToBarionHandler(shippingObj);
    mainView.router.navigate('/summary/', { animate: false });
}

function setShippingAddress(shippingData) {
    if (typeof shippingData != "undefined" && shippingData != null) {
        var s = JSON.parse(shippingData);
        $shippingAddress = {
            country: s.country,
            city: s.city,
            street: s.street,
            streetNumber: s.streetNumber,
            zip: s.postalCode,
            firstName: s.firstName,
            lastName: s.lastName,
            companyName: s.companyName
        };
    } else {
        $shippingAddress = $defaultShipping;
    }
    if ($selectedBook > 0 && $shippingAddress != null) {
        var bookData = books[$selectedBook - 1];
        var summaryData = {
            book: bookData,
            shipping: $shippingAddress
        };
        var summaryTemplate = $$('script#summaryTemplate').html();
        var compiledTemplate = Template7.compile(summaryTemplate);
        var content = compiledTemplate(summaryData);
        $(".summary-template").html(content);
    }
}

function successfulPaymentCallback(data) {
    window.location.href = "/done.html";
}

function unSuccessfulPaymentCallback(data) {
    window.location.href = "/failed.html";
}

function closePlugin() {
    var closeObj = { 'action': 'close' };
    postToBarionHandler(closeObj);
}