import { stream } from 'src/config'
import WS from './websocks'
import Bottleneck from 'bottleneck'

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 250
})

class Stream {
  constructor (handler, onopen, onerror) {
    this.handler = handler
    const onmessage = m => {
      this.handler(JSON.parse(m.data))
    }
    this.endpoint = new WS(`${stream}`, { onmessage, onopen, onerror })
  }

  send (data) {
    return limiter.schedule(() => {
      console.log('Send data', data)
      this.endpoint.send(JSON.stringify(data))
    })
  }

  subscribe (...streams) {
    const id = new Date().getTime()
    this.send({
      method: 'SUBSCRIBE',
      params: streams,
      id
    })
    return id
  }

  unsubscribe (...streams) {
    const id = new Date().getTime()
    this.send({
      method: 'UNSUBSCRIBE',
      params: streams,
      id
    })
    return id
  }

  list () {
    return new Promise((resolve, reject) => {
      try {
        const id = new Date().getTime()
        const oldhandler = this.handler
        this.handler = data => {
          if (data && data.id === id) {
            this.handler = oldhandler
            resolve(data.result)
          } else {
            oldhandler(data)
          }
        }
        this.send({
          method: 'LIST_SUBSCRIPTIONS',
          id
        })
      } catch (err) {
        reject(err)
      }
    })
  }
}

export default function (handler) {
  return new Promise((resolve, reject) => {
    const onopen = () => resolve(stream)
    const onerror = err => reject(err)
    const stream = new Stream(handler, onopen, onerror)
  })
}
