import { stream } from 'src/config'
import WS from './websocks'
import Bottleneck from 'bottleneck'

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 250
})

export default class Stream {
  static endpoint = undefined
  static status = ''
  static handlersbystream = {}
  static pResolve
  static pReject
  static connected = new Promise((resolve, reject) => {
    Stream.pResolve = resolve
    Stream.pReject = reject
  })

  static install (stream, handler) {
    const handlersbystream = this.handlersbystream
    const id = new Date().getTime() + '_' + Math.random()
    if (!handlersbystream[stream]) {
      handlersbystream[stream] = [{ id, handler }]
      console.log('Installed first handler for stream', stream)
    } else handlersbystream[stream].push({ id, handler })
    return id
  }

  static uninstall (id) {
    for (const [stream, handlers] of Object.entries(this.handlersbystream)) {
      const index = handlers.findIndex(e => e.id === id)
      if (index >= 0) {
        if (handlers.length === 1) delete this.handlersbystream[stream]
        else handlers.splice(index, 1)
        return stream
      }
    }
    return false
  }

  static dispatcher = (answer) => {
    if (answer && answer.stream && answer.stream in this.handlersbystream) {
      this.handlersbystream[answer.stream].forEach(e => {
        e.handler(answer.data)
      })
    } else {
      console.warn('Unexpected data', answer)
    }
  }

  static onreconnect () {
    console.log('Socket reconnected')
    this.status = 'connected'
    this.pResolve(true)
    const streams = Object.keys(this.handlersbystream)
    this.subscribe(...streams)
  }

  static connect () {
    this.status = 'connecting'
    const onmessage = m => {
      this.dispatcher(JSON.parse(m.data))
    }
    const onerror = err => {
      this.status = 'error'
      console.error('Error on reconnect', err)
      Stream.pReject(false)
    }
    const onclose = m => {
      this.connected = new Promise((resolve, reject) => {
        Stream.pResolve = resolve
        Stream.pReject = reject
      })
      console.log(m)
      if (this.status === 'closing') {
        this.status = 'closed'
      } else { // reconnect
        this.endpoint = new WS(`${stream}`, { onmessage, onopen: this.onreconnect, onerror, onclose })
      }
    }
    return new Promise((resolve, reject) => {
      const onopen = () => {
        this.status = 'connected'
        Stream.pResolve(true)
        resolve(this.endpoint)
      }
      const onerror = err => {
        this.status = 'error'
        Stream.pReject(false)
        reject(err)
      }
      this.endpoint = new WS(`${stream}`, { onmessage, onopen, onerror, onclose })
    })
  }

  static disconnect (reason = 'byuser') {
    this.status = 'closing'
    this.endpoint.close(reason)
  }

  static async send (data) {
    await this.connected
    return limiter.schedule(() => {
      console.log('Send data', data)
      this.endpoint.send(JSON.stringify(data))
    })
  }

  static _request (request) {
    return new Promise((resolve, reject) => {
      try {
        const id = new Date().getTime()
        const oldhandler = Stream.dispatcher
        Stream.dispatcher = data => {
          if (data && data.id === id) {
            Stream.dispatcher = oldhandler
            resolve(data.result)
          } else {
            oldhandler(data)
          }
        }
        Stream.send({ ...request, id })
      } catch (err) {
        reject(err)
      }
    })
  }

  static list () {
    return this._request({
      method: 'LIST_SUBSCRIPTIONS'
    })
  }

  static async subscribe (...names) {
    const subscribed = await this.list()
    const streams = names.filter(n => !subscribed.includes[n])
    return this._request({
      method: 'SUBSCRIBE',
      params: streams
    })
  }

  static async unsubscribe (...names) {
    const subscribed = await this.list()
    const streams = names.filter(n => subscribed.includes[n])
    return this._request({
      method: 'UNSUBSCRIBE',
      params: streams
    })
  }

  static async listen (handler, ...streams) {
    const ids = streams.map(s => this.install(s, handler))
    await this.subscribe(...streams)
    return ids
  }

  static dismiss (...ids) {
    const streams = ids.map(id => this.uninstall(id)).filter(s => s)
    return this.unsubscribe(...streams)
  }
}
