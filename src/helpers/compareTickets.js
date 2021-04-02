import { EMA } from './MovingAverage'
import { totime } from 'src/helpers/Utils'

const remember = {}
const repeat = {}
// const start = Date.now()

const disable = {}

export default function compare (ticket, intervales = []) {
  const time = Date.now()
  const now = new Date(time).toLocaleTimeString()
  const say = arg => console.log(`${now}: ${arg}`)
  const s = ticket.symbol

  intervales.filter(i => i.val > 30).forEach(i => {
    const key = `ticket[${s}].emaTrends[${i.pos}].direction`
    const direction = ticket.emaTrends[i.pos].direction
    const duration = ticket.emaTrends[i.pos].duration
    let lasttime = (remember[key] || {}).lasttime

    if (direction === 1 && key in remember && remember[key].direction < 0) {
      if (lasttime) {
        const delta = time - remember[key].lasttime
        repeat[key] = repeat[key] || new EMA(20)
        repeat[key].update(delta)
        const average = repeat[key].value
        if (!(disable[key] > time)) {
          const ms = 0 | (average % 1000)
          say(`EMA(${i.name}) of ${s} is bouncing every ${totime(average / 1000)}${ms}ms`)
          disable[key] = time + 0 * average
        }
      }
      lasttime = time
    } else if (direction === 3) {
      say(`EMA(${i.name}) of ${s} start raising`)
    } else if (direction === 30) {
      // reset
      say(`EMA(${i.name}) of ${s} is raising`)
      repeat[key] = new EMA(20)
      lasttime = undefined
    }
    remember[key] = { direction, lasttime, duration }
  })
}
