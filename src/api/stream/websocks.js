const nill = () => null
export default class {
  constructor (url, {
    onclose = nill,
    timeout = 1e3,
    maxAttempts = 3, // Infinity,
    onmessage = nill,
    onopen = nill,
    onerror = nill,
    onreconnect = nill
  } = {}) {
    this._url = url
    this._timeout = timeout
    this._maxAttempts = maxAttempts
    this._onclose = onclose
    this._onopen = onopen
    this._onmessage = onmessage
    this._onerror = onerror
    this._open()
  }

  _open () {
    const ws = new WebSocket(this._url)
    this.status = 'opening'
    ws.onmessage = this._onmessage
    ws.onopen = m => {
      this.status = 'open'
      console.info('Websock open', m)
      this.ws = ws
      this._retry = 0
      this._onopen(m)
    }
    ws.onclose = m => {
      this.status = 'close'
      console.info('Websock close', m)
      this.ws = undefined
      this._onclose(m)
    }
    ws.onerror = e => {
      this.status = 'error'
      console.warn('websock error', e)
      return (e && e.code === 'ECONNREFUSED') ? this._reconnect(e) : this._onerror(e)
    }
  }

  _reconnect (e) {
    console.warn('Retry connect', this._url)
    if (this._retry++ < this._maxAttempts) {
      setTimeout(() => {
        this._open()
        this._onreconnect(e)
      }, this._timeout)
    } else this._onerror(e)
  }

  close (reason) {
    if (this.ws) this.ws.close(1000, reason)
  }

  send (data) {
    if (this.ws) this.ws.send(data)
  }

  ws () { return this.ws }
}
