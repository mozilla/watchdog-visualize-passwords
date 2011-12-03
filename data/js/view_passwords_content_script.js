var loginsCallback;

var logins;

self.port.on('logins_table', function(msg) {
    loginsCallback(msg);
});

unsafeWindow.loadLogins = function(callback) {
    loginsCallback = callback;
    self.port.emit('get_logins_table',{});
};