const {Cc,Ci,Cu} = require("chrome");
const url = require("url");

var loginManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);

function getLoginsTable() {
    var logins = loginManager.getAllLogins();
    var loginsTable = {};
    for (var login in logins) {
        var loginInfo = logins[login];
        if (!loginsTable[loginInfo.password])
            loginsTable[loginInfo.password] = [];
        var loginSite = {
            hostname: loginInfo.hostname
        };
        
        try {
             loginSite.host = url.URL(loginInfo.hostname).host;   
        }
        catch (e) {
            // These might not all be valid URLs, e.g. chrome://...
            // So if the URL class throws an error, just use the hostname again.
            loginSite.host = loginInfo.hostname;
        }
        
        loginsTable[loginInfo.password].push(loginSite);
    }
    return loginsTable;
}

exports['getLoginsTable'] = getLoginsTable;