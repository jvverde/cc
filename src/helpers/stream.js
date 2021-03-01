import { stream } from 'src/config'
import WS from './websocks'
import Bottleneck from 'bottleneck'

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 250
})

export default class Stream {
  static endpoint = undefined
  static handler = () => null
  static status = ''

  static connect (handler, { onreconnect = () => null } = {}) {
    this.handler = handler
    this.status = 'connecting'
    const onmessage = m => {
      this.handler(JSON.parse(m.data))
    }
    const onclose = m => {
      console.log(m)
      if (this.status === 'closing') return
      const onopen = () => {
        console.log('Socket reconnected')
        this.status = 'connected'
        onreconnect()
      }
      const onerror = err => {
        this.status = 'error'
        console.error('Error on reconnect', err)
      }
      this.endpoint = new WS(`${stream}`, { onmessage, onopen, onerror, onclose })
    }
    return new Promise((resolve, reject) => {
      const onopen = () => {
        this.status = 'connected'
        resolve(stream)
      }
      const onerror = err => {
        this.status = 'error'
        reject(err)
      }
      this.endpoint = new WS(`${stream}`, { onmessage, onopen, onerror, onclose })
    })
  }

  static disconnect (reason = 'byuser') {
    this.status = 'closing'
    this.endpoint.close(reason)
  }

  send (data) {
    return limiter.schedule(() => {
      console.log('Send data', data)
      Stream.endpoint.send(JSON.stringify(data))
    })
  }

  _request (request) {
    return new Promise((resolve, reject) => {
      try {
        const id = new Date().getTime()
        const oldhandler = Stream.handler
        Stream.handler = data => {
          if (data && data.id === id) {
            Stream.handler = oldhandler
            resolve(data.result)
          } else {
            oldhandler(data)
          }
        }
        this.send({ ...request, id })
      } catch (err) {
        reject(err)
      }
    })
  }

  subscribe (...names) {
    return this._request({
      method: 'SUBSCRIBE',
      params: names
    })
  }

  unsubscribe (...names) {
    return this._request({
      method: 'UNSUBSCRIBE',
      params: names
    })
  }

  list () {
    return this._request({
      method: 'LIST_SUBSCRIPTIONS'
    })
  }
}
