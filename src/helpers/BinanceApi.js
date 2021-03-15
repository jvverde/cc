import axios from 'axios'
import { apiv3 } from 'src/config'

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 250
})

export function loadAggTrades (symbol) {
  return new Promise((resolve, reject) => {
    const limit = 1000
    const endTime = Date.now()
    const hourago = endTime - 60e3
    const startTime = hourago
    axios.get(`${apiv3}/aggTrades`, {
      params: {
        symbol,
        startTime,
        endTime,
        limit
      }
    })
      .then(answer => {
        console.log(answer)
        resolve(answer.data)
      })
      .catch(err => {
        console.warn('Error on get api', err)
        reject(err)
      })
  })
}
