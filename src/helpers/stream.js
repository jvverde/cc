import { stream } from 'src/config'
import WS from './websocks'
import Bottleneck from 'bottleneck'

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 250
})

// export default class Stream {
let endpoint
let status = ''
let pResolve
let pReject
let connected = new Promise((resolve, reject) => {
  pResolve = resolve
  pReject = reject
})

const handlersbystream = {}

function install (stream, handler) {
  const id = new Date().getTime() + '_' + Math.random()
  if (!handlersbystream[stream]) {
    handlersbystream[stream] = [{ id, handler }]
    console.log('Installed first handler for stream', stream)
  } else handlersbystream[stream].push({ id, handler })
  return id
}

function uninstall (id) {
  for (const [stream, handlers] of Object.entries(handlersbystream)) {
    const index = handlers.findIndex(e => e.id === id)
    if (index >= 0) {
      if (handlers.length === 1) delete handlersbystream[stream]
      else handlers.splice(index, 1)
      return stream
    }
  }
  return false
}

let dispatcher = (answer) => {
  if (answer && answer.stream && answer.stream in handlersbystream) {
    handlersbystream[answer.stream].forEach(e => {
      e.handler(answer.data)
    })
  } else {
    console.warn('Unexpected data', answer)
  }
}

function onreconnect () {
  console.log('Socket reconnected')
  status = 'connected'
  pResolve(true)
  const streams = Object.keys(handlersbystream)
  subscribe(...streams)
}

export function connect () {
  status = 'connecting'
  const onmessage = m => {
    dispatcher(JSON.parse(m.data))
  }
  const onerror = err => {
    status = 'error'
    console.error('Error on reconnect', err)
    pReject(false)
  }
  const onclose = m => {
    connected = new Promise((resolve, reject) => {
      pResolve = resolve
      pReject = reject
    })
    console.log(m)
    if (status === 'closing') {
      status = 'closed'
    } else { // reconnect
      endpoint = new WS(`${stream}`, { onmessage, onopen: onreconnect, onerror, onclose })
    }
  }
  return new Promise((resolve, reject) => {
    const onopen = () => {
      status = 'connected'
      pResolve(true)
      resolve(endpoint)
    }
    const onerror = err => {
      status = 'error'
      pReject(false)
      reject(err)
    }
    endpoint = new WS(`${stream}`, { onmessage, onopen, onerror, onclose })
  })
}

export function disconnect (reason = 'byuser') {
  status = 'closing'
  endpoint.close(reason)
}

export async function send (data) {
  await connected
  return limiter.schedule(() => {
    console.log('Send data', data)
    endpoint.send(JSON.stringify(data))
  })
}

function _request (request) {
  return new Promise((resolve, reject) => {
    try {
      const id = new Date().getTime()
      const oldhandler = dispatcher
      dispatcher = data => {
        if (data && data.id === id) {
          dispatcher = oldhandler
          resolve(data.result)
        } else {
          oldhandler(data)
        }
      }
      send({ ...request, id })
    } catch (err) {
      reject(err)
    }
  })
}

export function list () {
  return _request({
    method: 'LIST_SUBSCRIPTIONS'
  })
}

export async function subscribe (...names) {
  const subscribed = await list()
  const streams = names.filter(n => !subscribed.includes[n])
  return _request({
    method: 'SUBSCRIBE',
    params: streams
  })
}

export async function unsubscribe (...names) {
  const subscribed = await list()
  const streams = names.filter(n => subscribed.includes[n])
  return _request({
    method: 'UNSUBSCRIBE',
    params: streams
  })
}

export async function listen (handler, ...streams) {
  const ids = streams.map(s => install(s, handler))
  await subscribe(...streams)
  return ids
}

export function dismiss (...ids) {
  const streams = ids.map(id => uninstall(id)).filter(s => s)
  return unsubscribe(...streams)
}
// }
