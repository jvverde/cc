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
    ws.onmessage = this._onmessage
    ws.onopen = m => {
      console.info('websock open', m)
      this.ws = ws
      this._retry = 0
      this._onopen(m)
    }
    ws.onclose = m => {
      console.info('Websock close', m)
      this.ws = undefined
      this._onclose(m)
    }
    ws.onerror = e => {
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

  close () {
    if (this.ws) this.ws.close()
  }

  send (data) {
    if (this.ws) this.ws.send(data)
  }
}
