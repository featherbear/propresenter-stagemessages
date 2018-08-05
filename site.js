// load client.js first!
elem = id => document.getElementById(id);

(status_disconnected = () => elem("status").className = (elem("status").innerText = "Disconnected").toLowerCase())();
status_badAuth = () => (elem("status").className = "disconnected") && (elem("status").innerText = "Bad password... retrying in 3 seconds");
status_connecting = () => elem("status").className = (elem("status").innerText = "Connecting").toLowerCase();
status_connected = () => elem("status").className = (elem("status").innerText = "Connected").toLowerCase();

let authLoop;

function authSuccess() {
    clearTimeout(authLoop);
    status_connected();
}

function authFailed() {
    status_badAuth();
    clearTimeout(authLoop);
    authLoop = setTimeout(function() {
        status_connecting();
        connect(authSuccess, authFailed);
    }, 3000);
}

elem("message").addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        elem("message").value && elem("send").click();
        elem("message").value = "";
    }
});
elem("send").addEventListener("click", function() {
    let message = elem("message").value.trim();
    stageMessageSend(message);
    elem("currentMessage").value = message;
})
elem("clear").addEventListener("click", function() {
    stageMessageHide();
    elem("currentMessage").value = "";
})

function showPreferences() {
    elem("preferences").showModal();
    elem("pref_addr").value = localStorage.getItem("host") || default_host;
    elem("pref_port").value = localStorage.getItem("port") || default_port;
    elem("pref_pass").value = localStorage.getItem("pass") || default_pass;
}
elem("pref_open").addEventListener("click", showPreferences);

elem("pref_close").addEventListener("click", function() {
    localStorage.setItem("host", elem("pref_addr").value || default_host);
    localStorage.setItem("port", elem("pref_port").value || default_port);
    localStorage.setItem("pass", elem("pref_pass").value || default_pass);
    socket.close()
    status_disconnected();
    connect(authSuccess, authFailed);
    status_connecting();
    elem("preferences").close();
})

connect(authSuccess, authFailed);