import axios from 'axios'
import { apiv3 } from 'src/config'
import Bottleneck from 'bottleneck'

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 60 // 1000 per minute
})

const enqueue = job => limiter.schedule(job) // enqueued a job in limiter schedule

const enqvoid = n => { // enqueued n void requests
  while (n-- > 0) enqueue(() => true)
}

const _get = (url, options) => axios.get(url, options)
  .then(answer => answer.data)
  .catch(err => {
    console.error(err.response)
    console.warn(err.response.status)
    throw err
  })

export const get = (endpoint, params = {}) => enqueue(() => _get(`${apiv3}/${endpoint}`, { params }))
export const getWeight = (endpoint, w, params = {}) => get(endpoint, params).finally(() => enqvoid(w))

export const exchangeInfo = () => get('exchangeInfo')
export const allTicker24h = () => getWeight('ticker/24hr', 40)
export const aggTrades = params => get('aggTrades', params)
