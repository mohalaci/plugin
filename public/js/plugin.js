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
    "countryCode": "HU",
    "door": "5",
    "companyName": "Test Inc."
};

var $cListTemplate;
var $cDetailsTemplate;
var $cSummaryTemplate;

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
                    var content = $cListTemplate({ books: books });
                    $$(".list-template").html(content);
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
                        var content = $cDetailsTemplate(bookData);
                        $$(".book-template").html(content);
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
                        var content = $cSummaryTemplate(summaryData);
                        $$(".summary-template").html(content);
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
        },
        {
            path: '/redirect',
            url: '/redirect.html',
            on: {
                pageInit: function (e, page) {
                    var query = page.route.query;
                    getPaymentState(query.paymentId);
                }
            }
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

var barionMarket = new BarionMarket();
var mainView = app.views.create('.view-main');
mainView.router.allowPageChange = true;

app.statusbar.setIosTextColor('white');
app.statusbar.setBackgroundColor('#1A80BB');

app.on('init', function () {
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
//pre-complie templates
var bookListTemplate = $$('script#listTemplate').html();
$cListTemplate = Template7.compile(bookListTemplate);

var bookDetailsTemplate = $$('script#detailsTemplate').html();
$cDetailsTemplate = Template7.compile(bookDetailsTemplate);

var summaryTemplate = $$('script#summaryTemplate').html();
$cSummaryTemplate = Template7.compile(summaryTemplate);

var content = $cListTemplate({ books: books });
$$(".list-template").html(content);

if ($$('html.device-ios').length > 0) {
    $$('body').scrollTop(20);
    $$('.view').scrollTop(20);
} else {
    app.statusbar.hide();
    $$('body').scrollTop(20);
    $$('.view').scrollTop(20);
}

$$(document).on('click', "#payWithBarionButton", getPaymentId);
    $$(document).on('click', "#setShippingButton", barionMarket.getShippingAddress);
    $$(document).on('click', "#resultButton", barionMarket.closePlugin);
    $$(document).on('click', "#exitButton", barionMarket.closePlugin);
    $$(document).on('click', "#changeAddressButton", barionMarket.selectAddress);

    $$(document).on('click', ".book-list-item", function () {
        var $card = $$(this).find('.card');
        $card.addClass('touched');
        $selectedBook = $$(this).attr("data-book-id");
        mainView.router.navigate("/bookdetails/");
    });

    $$(document).on('click', ".backToList-link", function (e) {
        e.preventDefault();
        e.stopPropagation();
        mainView.router.back('/booklist/', { force: true });
    });

    $$(document).on('click', ".backToDetails-link", function (e) {
        e.preventDefault();
        e.stopPropagation();
        mainView.router.back('/bookdetails/', { force: true });
    });

    $$(document).on('click', ".book-link", function () {
        $selectedBook = $$(this).attr("data-book-id");
    });

    $$(document).on('click', ".navbar, .statusbar", function (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    });

});




function getPaymentState(paymentId){
    app.request
    ({
        method: "GET",
        url: "/getpaymentstate?paymentId="+paymentId,
        error: function (xhr, status, error) {
            alert("ERROR: " + error + "\r\nStatus: " + status);
        },
        success: function (data, status, xhr) {
            if (data.status == "Succeeded") {
                mainView.router.load('done.html');
            } else {
                mainView.router.load('failed.html');
            }
        },
        complete: function () {
            $$("#payWithBarionButton").removeClass('disabled').removeAttr('disabled');
        }
    });
}

function getPaymentId() {
    $$("#payWithBarionButton").addClass('disabled').attr('disabled', 'disabled');
    var book = books[$selectedBook - 1];
    app.request({
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
            if (status == 200) {
                $$(".page-content").fadeOut(100);
                redirectToBarionPaymentGateway(data.paymentId);
            } else {
                alert("Request finished with status code '" + status + "', could not process response.");
            }
        },
        complete: function () {
            $$("#payWithBarionButton").removeClass('disabled').removeAttr('disabled');
        }
    });
}

function redirectToBarionPaymentGateway(paymentId){
    window.location.href = "https://test.barion.com/pay?id="+paymentId;
}

function clearShippingAddress() {
    $shippingAddress = null;
    mainView.router.back('/bookdetails/', { force: true });
}

function setShippingAddress(shippingData) {
    if (typeof shippingData != "undefined" && shippingData != null) {
        console.log(shippingData);
        var s = JSON.parse(shippingData);
        $shippingAddress = {
            countryCode: s.address.countryCode,
            city: s.address.city,
            street: s.address.street,
            streetNumber: s.address.streetNumber,
            postalCode: s.address.postalCode,
            firstName: s.name.firstName,
            lastName: s.name.lastName,
            companyName: s.name.companyName
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
        var content = $cSummaryTemplate(summaryData);
        $$(".summary-template").html(content);
    }
}

function successfulPaymentCallback(data) {
    window.location.href = "/done.html";
}

function unSuccessfulPaymentCallback(data) {
    window.location.href = "/failed.html";
}