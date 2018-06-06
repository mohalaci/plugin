var BarionMarket = (function(){
    var market = function() {
        if (typeof successfulPaymentCallback != "function"){
            console.error("WARNING!!! You need to implement successfulPaymentCallback() method!");
        }
        if (typeof unSuccessfulPaymentCallback != "function"){
            console.error("WARNING!!! You need to implement unSuccessfulPaymentCallback() method!");
        }
        if (typeof setShippingAddress != "function"){
            console.error("WARNING!!! You need to implement setShippingAddress() method!");
        }
    };
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
    };
    market.prototype.getShippingAddress = function() {
        var shippingObj = { 'action': 'getAddress' };
        postToBarionHandler(shippingObj);
        mainView.router.navigate('/summary/', { animate: false });
    };
    
    market.prototype.closePlugin = function() {
        var closeObj = { 'action': 'close' };
        postToBarionHandler(closeObj);
    };
    market.prototype.selectAddress = function(){
        var closeObj = { 'action': 'changeAddress' };
        postToBarionHandler(closeObj);
    };
    return market;
})();