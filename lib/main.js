const dataDir = require("self").data;
const pagemod = require("page-mod");
const passwordManager = require('passwordManager');
const util = require("util");
const tabs = require("tabs");
const widgets = require("widget");

function openPasswordVisualizer() {
    tabs.open(dataDir.url("view_passwords.html"));
}

pagemod.PageMod({
  include: dataDir.url("view_passwords.html"),
  contentScriptFile: [dataDir.url("js/util.js"),dataDir.url("js/view_passwords_content_script.js")],
  onAttach: function(worker) {
      worker.port.on('get_logins_table', function() {
          worker.port.emit('logins_table', getLoginsJSON());
      });
  }
});

var widget = widgets.Widget({
  id: "privacy-watchdog-link",
  label: "Privacy Watchdog",
  contentURL: dataDir.url("lock_blue.png"),
  onClick: function() {
    openPasswordVisualizer();
  }
});

function getLoginsJSON() {
    var nodes = [];
    var links = [];
    var loginsTable = passwordManager.getLoginsTable();
    var passwordsDict = {};
    for (var password in loginsTable) {
        nodes.push({
                name: password,
                group: 0
        });
        var passwordIdx = nodes.length-1;
        passwordsDict[password] = passwordIdx;
        for (var site in loginsTable[password]) {
            nodes.push({
                name: loginsTable[password][site].host,
                group: 1
            });
            links.push({
                source: passwordIdx,
                target: nodes.length-1,
                value: 1
            });
        }
    }
    // Add warning edges between similar passwords
    var similarPasswordPairs = detectSimilarPasswords(loginsTable);
    for (var pairX in similarPasswordPairs) {
        var pair = similarPasswordPairs[pairX];
        nodes.push({
            name: 'These passwords are really similar!',
            group: 2
        });
        var warningNodeIdx = nodes.length-1;
        links.push({
            source: passwordsDict[pair[0]],
            target: warningNodeIdx,
            value: 2
        });
        links.push({
            source: passwordsDict[pair[1]],
            target: warningNodeIdx,
            value: 2
        });
    }
    return {
        nodes: nodes,
        links: links
    };
}

function detectSimilarPasswords(loginsTable) {
    var passwordsChecked = {};
    var similarPasswordPairs = [];
    
    for (var password1 in loginsTable) {
        for (var password2 in loginsTable) {
            if (password1 == password2)
                continue;
            if (passwordsChecked[password2])
                continue;
            
            if (passwordSimilarityCheck(password1,password2))
                similarPasswordPairs.push([password1,password2]);
        }
        passwordsChecked[password1] = true;
    }
    return similarPasswordPairs;
}

function passwordSimilarityCheck(password1,password2) {
    return util.levenshtein(password1,password2) < Math.max(password1.length,password2.length)/2;
}
