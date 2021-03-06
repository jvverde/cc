import { stream } from 'src/config'
import WS from './websocks'
import Bottleneck from 'bottleneck'

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 250
})

let endpoint
let status = ''
let pResolve
let pReject
let connectedPromise

const putInWait = () => {
  connectedPromise = new Promise((resolve, reject) => {
    pResolve = resolve
    pReject = reject
  })
}

putInWait()

const handlersbystream = {}
const handlersbyid = {}

function dispatcher (answer) {
  if (answer && answer.stream && answer.stream in handlersbystream) {
    handlersbystream[answer.stream].forEach(e => {
      try {
        e.handler(answer.data)
      } catch (err) {
        console.error('Error while call handler', err)
      }
    })
  } else if (answer && answer.id && answer.id in handlersbyid) {
    try {
      handlersbyid[answer.id](answer.result)
      delete handlersbyid[answer.id]
    } catch (err) {
      console.error('Error while call handler for answer', answer, err)
    }
  } else {
    console.warn('Unexpected data', answer)
  }
}

function onreconnect () {
  console.info('Socket reconnected')
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
    console.error('Error on connect', err)
    pReject(err)
  }
  const onclose = m => {
    putInWait()
    if (status === 'closing') {
      status = 'closed'
    } else { // reconnect
      endpoint = new WS(`${stream}`, { onmessage, onopen: onreconnect, onerror, onclose })
    }
  }
  const onopen = () => {
    status = 'connected'
    pResolve(endpoint)
  }
  endpoint = new WS(`${stream}`, { onmessage, onopen, onerror, onclose })
  return connectedPromise
}

export function disconnect (reason = 'byuser') {
  status = 'closing'
  endpoint.close(reason)
}

export async function send (data) {
  await connectedPromise
  return limiter.schedule(() => {
    console.log('Send data', data)
    endpoint.send(JSON.stringify(data))
  })
}

function _request (request) {
  return new Promise((resolve, reject) => {
    try {
      const id = new Date().getTime()
      handlersbyid[id] = resolve
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
  const current = await list()
  const streams = names.filter(name => !current.includes(name))
  if (streams.length === 0) return Promise.resolve(0)
  return _request({
    method: 'SUBSCRIBE',
    params: streams
  })
}

export async function unsubscribe (...names) {
  const current = await list()
  const streams = names.filter(name => current.includes(name))
  if (streams.length === 0) return Promise.resolve(0)
  return _request({
    method: 'UNSUBSCRIBE',
    params: streams
  })
}

function addHandler (stream, handler) {
  const id = new Date().getTime() + '_' + Math.random()
  if (!handlersbystream[stream]) {
    handlersbystream[stream] = [{ id, handler }]
    console.log('Installed first handler for stream', stream)
  } else handlersbystream[stream].push({ id, handler })
  return id
}

function rmHandler (id) {
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

export async function listen (handler, ...streams) {
  const ids = streams.flat(Infinity).map(s => addHandler(s, handler))
  await subscribe(...streams)
  return ids
}

export function dismiss (...ids) {
  const streams = ids.flat(Infinity).map(id => rmHandler(id)).filter(s => s)
  return unsubscribe(...streams)
}
