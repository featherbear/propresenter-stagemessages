// C:\Program Files (x86)\Renewed Vision\ProPresenter 6\ProPresenter.UI.Plugin.dll
// ProPresenter.UI.Plugin.ProNetwork.RVProRemoteWebSocketServiceHandler

window.PP_SDM_CLASS = class {
  constructor (options) {
    this.options = { ...options }
    this._socket = null
  }

  _err (s) {
    DEBUG && console.error(`Error: ${s}`)
    return false
  }

  _checkSocket () {
    if (!this._socket) return this._err('SOCKET NOT CONNECTED')
    if (this._socket.readyState !== 1) return this._err('SOCKET NOT READY')
    return true
  }

  connect () {
    const { HOST, PORT } = this.options
    DEBUG && console.log(`Connecting to ws://${HOST}:${PORT}/remote`)
    this._socket = new WebSocket(`ws://${HOST}:${PORT}/remote`)

    if (typeof this.options.connectFail === 'function') {
      this._socket.onclose = this._socket.onerror = this.options.connectFail
    }

    this._socket.onopen = () => {
      this.options.connectSuccess && this.options.connectSuccess()

      this._listen()

      DEBUG && console.log('Connection success, authenticating...')
      this._emit({
        action: 'authenticate',
        protocol: '600',
        password: this.options.PASSWORD
      })
    }
  }

  close () {
    this._socket.close()
  }

  _listen () {
    this._socket.onmessage = event => {
      const msg = JSON.parse(event.data)

      switch (msg.action) {
        case 'authenticate':
          DEBUG && console.log('Authentication ' + (msg.authenticated ? 'success' : 'failed'))
          msg.authenticated
            ? (this.options.authSuccess && this.options.authSuccess())
            : (this.options.authFail && this.options.authFail())
          break
        default:
          console.log(msg)
          break
      }
    }
  }

  send (msg) {
    this._emit({
      action: 'stageDisplaySendMessage',
      stageDisplayMessage: msg
    })
  }

  hide () {
    this._emit({
      action: 'stageDisplayHideMessage'
    })
  }

  _emit (obj) {
    const json = JSON.stringify(obj)
    if (this._checkSocket()) this._socket.send(json)
    else return this._err('SOCKET EMIT FAILED')
  }
}
