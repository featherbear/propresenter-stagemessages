// C:\Program Files (x86)\Renewed Vision\ProPresenter 6\ProPresenter.UI.Plugin.dll
// ProPresenter.UI.Plugin.ProNetwork.RVProRemoteWebSocketServiceHandler

const debug = false;
const default_host = 'localhost';
const default_port = '50001';
const default_pass = 'control';

let socket;
let cb_connectSuccess;
let cb_connectFail;
let cb_authSuccess;
let cb_authFail;

function err(s) {
    debug && console.error(`Error: ${s}`);
    return false;
}

function check_socket() {
    if (!socket) return err('SOCKET NOT CONNECTED');
    if (socket.readyState != 1) return err('SOCKET NOT READY');
    return true;
}

function connect(obj) {
    obj.connectSuccess && (cb_connectSuccess = obj.connectSuccess);
    obj.connectFail && (cb_connectFail = obj.connectFail);
    obj.authSuccess && (cb_authSuccess = obj.authSuccess);
    obj.authFail && (cb_authFail = obj.authFail);

    var host = localStorage.getItem("host") || default_host;
    var port = localStorage.getItem("port") || default_port;
    debug && console.log(`Connecting to ws://${host}:${port}/remote`);
    socket = new WebSocket(`ws://${host}:${port}/remote`);
    // Above operation is non-blocking. Have to wait for the socket to connect before we authenticate()
    socket.onclose = socket.onerror = cb_connectFail;
    socket.onopen = function() {
        cb_connectSuccess && cb_connectSuccess();
        debug && console.log("Connection success, authenticating...");
        authenticate()
    };
    listen();
}

function authenticate() {
    emit({
        action: 'authenticate',
        protocol: '600',
        password: localStorage.getItem("pass") || default_pass
    })
}

function listen() {
    socket.onmessage = function(event) {
        var msg = JSON.parse(event.data);

        switch (msg.action) {
            case "authenticate":
                debug && console.log("Authentication " + (msg.authenticated ? "success" : "failed"));
                msg.authenticated ? (cb_authSuccess && cb_authSuccess()) : (cb_authFail && cb_authFail());
                break;
            default:
                console.log(msg);
                break;
        }
    }
}

function stageMessageSend(msg) {
    emit({
        action: 'stageDisplaySendMessage',
        stageDisplayMessage: msg
    })
}

function stageMessageHide() {
    emit({
        action: 'stageDisplayHideMessage'
    })
}

function emit(obj) {
    var json = JSON.stringify(obj);
    if (check_socket()) socket.send(json);
    else return err('SOCKET EMIT FAILED');
}