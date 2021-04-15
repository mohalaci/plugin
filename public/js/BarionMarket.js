var BarionMarket = (function(){
    function BarionMarket(){
        this.callbacks = {
            vehicle: null,
            defaultAddress: null,
            address: null,
            customer: null,
            lastUsedVehicle: null
        };
    }

    /**
     * Testing data
     */
    BarionMarket.prototype.testData = {
        selectAddress: "{\"countryCode\":\"HU\",\"city\":\"Budapest\",\"street\":\"Infopark setany\",\"streetNumber\":\"1\",\"postalCode\":\"1117\",\"firstName\":\"Kovacs\",\"lastName\":\"Istvan\",\"companyName\":null}"
        /*JSON.stringify({
                countryCode: "HU",
                city: "Budapest",
                street: "Infopark setany",
                streetNumber: "1",
                postalCode: "1117",
                firstName: "Kovacs",
                lastName: "Istvan",
                companyName: null
        })*/,
        getDefaultAddress: "{\"countryCode\":\"HU\",\"city\":\"Budapest\",\"street\":\"Infopark setany\",\"streetNumber\":\"1\",\"postalCode\":\"1117\",\"firstName\":\"Kovacs\",\"lastName\":\"Istvan\",\"companyName\":null}"
        /*JSON.stringify({
                countryCode: "HU",
                city: "Budapest",
                street: "Infopark setany",
                streetNumber: "1",
                postalCode: "1117",
                firstName: "Kovacs",
                lastName: "Istvan",
                companyName: null
        })*/,
        selectVehicle: "{\"licensePlate\":\"TEST001\",\"countryCode\":\"HU\",\"category\":\"CAR\"}"
        /*JSON.stringify({
            licensePlate: "TEST001",
            countryCode: "HU",
            category: "CAR"
        })*/,
        getCustomer: "{\"loginName\":\"asd@example.com\",\"language\":\"hu_HU\",\"token\":\"123456\"}"
        /*JSON.stringify({
            loginName: "asd@example.com",
            language: "hu_HU",
            token: "123456"
        })*/,
        getLastUsedVehicle: "{\"licensePlate\":\"TEST001\",\"countryCode\":\"HU\",\"category\":\"CAR\"}"
        /*JSON.stringify({
            licensePlate: "TEST001",
            countryCode: "HU",
            category: "CAR"
        })*/
    }

    /**
     * This method will close your plugin in the Barion app. After this function was called your session will be killed.
     */
    BarionMarket.prototype.closePlugin = function() {
        var action = {
            "action": "close"
        }
        this.postToBarionHandler(action, null);
    };

    /**
     * If you call this method you will get the default address of the user in the callback function.
     */
    BarionMarket.prototype.getDefaultAddress = function(callback) {
        if (!isValid(callback)){
            return;
        }
        var action = {
            "action": "getDefaultAddress"
        }
        this.callbacks.defaultAddress = callback;
        this.postToBarionHandler(action, callback);
    };

    /**
     * If you call this method users can select an address from their saved addresses or create a new one.
     */
    BarionMarket.prototype.selectAddress = function(callback) {
        if (!isValid(callback)){
            return;
        }
        var action = {
            "action": "selectAddress"
        }
        this.callbacks.address = callback;
        this.postToBarionHandler(action, callback);
    };

    /**
     * You can get the user email address and the token in the callback function.
     */
    BarionMarket.prototype.getCustomer = function(callback){
        if (!isValid(callback)){
            return;
        }
        var action = {
            "action" : "getCustomer"
        }
        this.callbacks.customer = callback;
        this.postToBarionHandler(action, callback);
    }

    /**
     * If you call this method users can select a vehicle from their saved vehicles or save a new one in the Barion app and you will get the selected vehicle object in the callback function.
     */
    BarionMarket.prototype.selectVehicle = function(callback) {
        if (!isValid(callback)){
            return;
        }
        var action = {
            "action": "selectVehicle"
        }
        this.callbacks.vehicle = callback;
        this.postToBarionHandler(action, callback);
    }
    
    /**
     * If you call this method you will get the last used vehicle in the callback function.
     */
    BarionMarket.prototype.getLastUsedVehicle = function(callback) {
        if (!isValid(callback)){
            return;
        }
        var action = {
            "action": "getLastUsedVehicle"
        }
        this.callbacks.lastUsedVehicle = callback;
        this.postToBarionHandler(action, callback);
    }

    /**
     * This method send data to android and ios platforms.
     */
    BarionMarket.prototype.postToBarionHandler = function (obj, callback) {
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
            switch (callback) {
                case this.callbacks.vehicle: 
                    callback(this.testData.selectVehicle);
                    break;
                case this.callbacks.address:
                    callback(this.testData.selectAddress);
                    break;
                case this.callbacks.defaultAddress:
                    callback(this.testData.getDefaultAddress);
                    break;
                case this.callbacks.customer:
                    callback(this.testData.getCustomer);
                    break;
                case this.callbacks.lastUsedVehicle:
                    callback(this.testData.getLastUsedVehicle);
                    break;
                default:
                    alert("Plugin closed");
                    break;
            }
        }
    };

    function isValid(callback){
        if (typeof callback == "undefined" || callback == null){
            console.error("callback function is invalid");
            return false;
        } else {
            return true;
        }        
    };

    var instance;
    return {
        getInstance: function(){
            if (instance == null){
                instance = new BarionMarket();
            }
            return instance;
        }
    };
    
})();