// load client.js first!

const DEBUG = false

;(function () {
  const defaultHost = 'localhost'
  const defaultPort = '50001'
  const defaultPass = 'control'

  const elem = id => document.getElementById(id)
  const statusElem = elem('status')
  const messageElem = elem('currentMessage')

  function setStatus (status) {
    switch (status) {
      case 'disconnected':
        statusElem.className = 'disconnected'
        statusElem.innerText = 'Disconnected'
        break
      case 'badAuth':
        statusElem.className = 'disconnected'
        statusElem.innerText = 'Bad password... retrying in 3 seconds'
        break
      case 'badPerm':
        statusElem.className = 'disconnected'
        statusElem.innerText = 'Controller access not enabled... Please configure ProPresenter'
        break
      case 'connecting':
        statusElem.className = 'connecting'
        statusElem.innerText = 'Connecting'
        break
      case 'connected':
        statusElem.className = 'connected'
        statusElem.innerText = 'Connected'
        break
    }
  }

  let reconnectTimer

  function connectFail () {
    clearTimeout(reconnectTimer)
    reconnectTimer = setTimeout(function () {
      setStatus('connecting')
      Client.connect()
    }, 3000)
  }

  const callbacks = {
    connectFail () {
      setStatus('disconnected')
      connectFail()
    },
    authFail () {
      setStatus('badAuth')
      connectFail()
    },
    permFail () {
      setStatus('badPerm')
      connectFail()
    },
    authSuccess () {
      clearTimeout(reconnectTimer)
      setStatus('connected')
    }
  }

  let Client
  function init () {
    clearTimeout(reconnectTimer)
    Client && Client.close()
    Client = new PP_SDM_CLASS({
      ...callbacks,
      HOST: localStorage.getItem('host'),
      PORT: localStorage.getItem('port'),
      PASS: localStorage.getItem('pass')
    })
    setStatus('connecting')
    Client.connect()
  }

  elem('message').addEventListener('keyup', event => {
    event.preventDefault()

    switch (event.keyCode) {
      case 13:
        elem('message').value.trim() && elem('send').click()

      // es-lint: allow fall through
      case 27:
        elem('message').value = ''
        break
    }
  })

  let shakeLoop
  function doShake (duration = 200) {
    clearTimeout(shakeLoop)
    elem('send').className = 'shake'
    shakeLoop = setTimeout(() => (elem('send').className = ''), duration)
  }

  elem('send').addEventListener('click', () => {
    const message = elem('message').value.trim()
    if (!message) return false
    Client.send(message)
    doShake()

    messageElem.innerText = message
    messageElem.className = 'blink'
  })

  elem('clear').addEventListener('click', () => {
    Client.hide()
    messageElem.innerText = ' '
    messageElem.className = ''
  })

  elem('pref_open').addEventListener('click', () => {
    elem('preferences').showModal()
  })

  elem('preferences').showModal = function (allowClose = true, defaultFallback = false) {
    elem('pref_addr').value = localStorage.getItem('host') || (defaultFallback ? defaultHost : '')
    elem('pref_port').value = localStorage.getItem('port') || (defaultFallback ? defaultPort : '')
    elem('pref_pass').value = localStorage.getItem('pass') || (defaultFallback ? defaultPass : '')

    allowClose && document.querySelector('.dialogBackground')
      .addEventListener('click', elem('preferences').closeModal)

    this.setAttribute('open', true)
  }
  elem('preferences').closeModal = function () {
    document.querySelector('.dialogBackground').removeEventListener('click', elem('preferences').closeModal)
    elem('preferences').removeAttribute('open')
    elem('pref_addr').value = ''
    elem('pref_port').value = ''
    elem('pref_pass').value = ''
  }

  elem('pref_save').addEventListener('click', function () {
    localStorage.setItem('host', elem('pref_addr').value)
    localStorage.setItem('port', elem('pref_port').value)
    localStorage.setItem('pass', elem('pref_pass').value)
    elem('preferences').closeModal()
    Client && Client.close()
    setStatus('disconnecting')
    init()
  })

  if (localStorage.getItem('host') && localStorage.getItem('port')) {
    init()
  } else {
    elem('preferences').showModal(false, true)
  }
})()
