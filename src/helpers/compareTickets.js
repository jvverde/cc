import { EMA } from './MovingAverage'
import { totime } from 'src/helpers/Utils'
import numeral from 'numeral'

const zeros = n => {
  if (n > 0 && Math.abs(n) !== Infinity) {
    let s = '0.'
    while (n--) s = `${s}0`
    return s
  }
  return '0'
}
const pdigit = (v, size = 0) => numeral(v).format('+' + zeros(size))
const p1digit = (v) => {
  const n = v ? 1 - Math.floor(Math.log10(Math.abs(v))) : 0
  return pdigit(v, n)
}

const permil = v => `${p1digit(1000 * v)}‰`

const remember = {}
const averageTimeBouncing = {}
const bounceCounter = {}
// const start = Date.now()

const disable = {}
let options = {
  startAlert: 3,
  risingAlert: 30,
  durationFactorAlert: 2,
  emaSize: 20,
  suspendFactor: 0,
  magnitudeAlert: 5e-3,
  rateAlert: 5e-5
}

export function init (o = {}) {
  options = { ...options, ...o }
}

const initEMA = () => new EMA(options.emaSize)
const hms = t => `${totime(t / 1000)}`
const hmsms = t => `${hms(t)}${0 | t % 1000}ms`

export default function compare (ticket, intervales = []) {
  const { startAlert, risingAlert, durationFactorAlert, suspendFactor, magnitudeAlert, rateAlert } = options
  const time = Date.now()
  const now = new Date(time).toLocaleTimeString()
  const say = arg => console.log(`${now}: ${arg}`)
  // const say = arg => now
  const s = ticket.symbol

  for (const i of intervales.filter(i => i.val > 30)) {
    const key = `ticket[${s}].emaTrends[${i.pos}].direction`
    const direction = ticket.emaTrends[i.pos].direction
    const duration = ticket.emaTrends[i.pos].duration
    const magnitude = ticket.emaTrends[i.pos].magnitude
    const rate = ticket.emaTrends[i.pos].rate
    let lasttime = (remember[key] || {}).lasttime
    averageTimeBouncing[key] = averageTimeBouncing[key] || initEMA()
    const average = averageTimeBouncing[key].value
    bounceCounter[key] = bounceCounter[key] || 0
    let deltamag = (remember[key] || {}).deltamag
    let deltarate = (remember[key] || {}).deltarate

    if (direction === 1 && key in remember && remember[key].direction < 0) {
      if (lasttime) { // Don't count the first event
        bounceCounter[key]++
        const delta = time - remember[key].lasttime
        averageTimeBouncing[key].update(delta)
        const average = averageTimeBouncing[key].value
        if (!(disable[key] > time)) {
          say(`EMA(${i.name}) of ${s} is bouncing every ${hmsms(average)}. This is the ${bounceCounter[key]}nth time`)
          disable[key] = time + suspendFactor * average
        }
      }
      lasttime = time
      deltamag = magnitudeAlert
      deltarate = rateAlert
    } else if (direction === startAlert) {
      say(`EMA(${i.name}) of ${s} start raising`)
    } else if (direction === -startAlert) {
      say(`EMA(${i.name}) of ${s} start falling`)
    } else if (direction === risingAlert) {
      say(`EMA(${i.name}) of ${s} is raising (${permil(magnitude)}) over ${risingAlert} periods at rate of ${permil(rate)}/s`)
      averageTimeBouncing[key] = initEMA()
      lasttime = undefined
    } else if (direction === -risingAlert) {
      say(`EMA(${i.name}) of ${s} is falling (${permil(magnitude)}) for ${risingAlert} periods at rate of ${permil(rate)}/s`)
      averageTimeBouncing[key] = initEMA()
      lasttime = undefined
    } else if (direction > 1 && average && duration > durationFactorAlert * average) {
      say(`EMA(${i.name}) of ${s} is raising (${permil(magnitude)}) over ${hms(duration)} at rate of ${permil(rate)}/s`)
      averageTimeBouncing[key] = initEMA()
      lasttime = undefined
    } else if (direction < -1 && average && duration > durationFactorAlert * average) {
      say(`EMA(${i.name}) of ${s} is falling (${permil(magnitude)}) for more than ${hms(duration)} at rate of ${permil(rate)}/s`)
      averageTimeBouncing[key] = initEMA()
      lasttime = undefined
    }
    if (magnitude > deltamag) {
      say(`EMA(${i.name}) of ${s} is raising (${permil(magnitude)}) more than ${permil(deltamag)} over ${hms(duration)} and ${direction} periods at rate of ${permil(rate)}/s`)
      averageTimeBouncing[key] = initEMA()
      deltamag += magnitudeAlert
    }
    if (rate > deltarate) {
      say(`EMA(${i.name}) of ${s} is raising (${permil(magnitude)}) at rate ${permil(rate)}/s over ${hms(duration)} and ${direction} periods`)
      averageTimeBouncing[key] = initEMA()
      deltarate *= 1.05
    }
    remember[key] = { direction, lasttime, duration, deltamag, deltarate }
  }
}
