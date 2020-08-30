// load client.js first!
const elem = id => document.getElementById(id);

(status_disconnected = () => elem('status').className = (elem('status').innerText = 'Disconnected').toLowerCase())()
status_badAuth = () => (elem('status').className = 'disconnected') && (elem('status').innerText = 'Bad password... retrying in 3 seconds')
status_connecting = () => elem('status').className = (elem('status').innerText = 'Connecting').toLowerCase()
status_connected = () => elem('status').className = (elem('status').innerText = 'Connected').toLowerCase()

const cb = {
  connectFail: function () {
    status_disconnected()
    connectFail()
  },
  authSuccess: function () {
    clearTimeout(connectLoop)
    status_connected()
  },
  authFail: function () {
    status_badAuth()
    connectFail()
  }
}

let connectLoop
let shakeLoop

function connectFail () {
  clearTimeout(connectLoop)
  connectLoop = setTimeout(function () {
    status_connecting()
    connect(cb)
  }, 3000)
}

elem('message').addEventListener('keyup', function (event) {
  event.preventDefault()
  switch (event.keyCode) {
    case 13:
      elem('message').value.trim() && elem('send').click()
    case 27:
      elem('message').value = ''
      break
  }
})
elem('send').addEventListener('click', function () {
  let message
  if (!(message = elem('message').value.trim())) return false
  stageMessageSend(message)

  clearTimeout(shakeLoop)
  elem('send').className = 'shake'
  shakeLoop = setTimeout(() => elem('send').className = '', 200)

  var oldMessage = elem('currentMessage')
  var newMessage = oldMessage.cloneNode(true)
  newMessage.innerText = message
  newMessage.className = 'blink'
  oldMessage.parentNode.replaceChild(newMessage, oldMessage)
})
elem('clear').addEventListener('click', function () {
  stageMessageHide()
  elem('currentMessage').innerText = ' '
  elem('currentMessage').className = ''
})

function showPreferences () {
  elem('preferences').showModal()
  elem('pref_addr').value = localStorage.getItem('host') || default_host
  elem('pref_port').value = localStorage.getItem('port') || default_port
  elem('pref_pass').value = localStorage.getItem('pass') || default_pass
}
elem('pref_open').addEventListener('click', showPreferences)

if (typeof elem('preferences').showModal !== 'function') {
  elem('preferences').showModal = function () {
    this.setAttribute('open', true)
  }
}

if (typeof elem('preferences').close !== 'function') {
  elem('preferences').close = function () {
    this.removeAttribute('open')
  }
}

document.querySelector('.dialogBackground').addEventListener('click', () => {
  elem('preferences').close()
})

elem('pref_save').addEventListener('click', function () {
  localStorage.setItem('host', elem('pref_addr').value || default_host)
  localStorage.setItem('port', elem('pref_port').value || default_port)
  localStorage.setItem('pass', elem('pref_pass').value || default_pass)
  socket.close()
  status_disconnected()
  connect(cb)
  status_connecting()
  elem('preferences').close()
})

status_connecting()
connect(cb)
