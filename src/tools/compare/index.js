import { EMA } from 'src/helpers/MovingAverage'
import { totime } from 'src/helpers/Utils'
import numeral from 'numeral'

import { Dialog } from 'quasar'
import Settings from './Settings'

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
const parameters = [
  { name: 'startAlert', value: 3, label: 'Initial alert after rising/falling values', min: 1, max: 100, step: 1 },
  { name: 'risingAlert', value: 30, label: 'Assumed a change trend after', min: 10, max: 1000, step: 1 },
  { name: 'durationFactorAlert', value: 2, label: 'Alert if rising/failling for more than N bouncing periods', min: 2, max: 1000, step: 1 },
  { name: 'emaSize', value: 20, label: 'Exponencial Moving Average Size', min: 5, max: 1000, step: 5 },
  { name: 'suspendFactor', value: 0, label: 'Suspend bouncing alerts for N periods', min: 0, max: 100, step: 1 },
  { name: 'magnitudeAlert', value: 5e-3, label: 'Change magnitude (realtive) alert', min: 1e-4, max: 1e-1, step: 1e-5 },
  { name: 'rateAlert', value: 1e-4, label: 'Rate of change (realtive) per sencond alert', min: 1e-5, max: 1e-1, step: 1e-6 }
]

const array2obj = (x, obj = {}) => {
  return x.reduce((obj, e) => {
    obj[e.name] = e.value
    return obj
  }, obj)
}

const options = array2obj(parameters)

let currentParams = parameters.map(e => ({ ...e })) // copy every object of array

export function settings () {
  Dialog.create({
    // See https://quasar.dev/quasar-plugins/dialog#invoking-custom-component
    component: Settings,
    question: 'Tunning compare parameters',
    parameters: currentParams
  }).onOk(params => {
    array2obj(params, options)
    currentParams = params
  }).onCancel(() => {
    console.log('Cancel')
  }).onDismiss(() => {
    console.log('Called on OK or Cancel')
  })
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

    let { lRideCnt, lRideMag, lRideRate, lRideDuration } = (remember[key] || {})

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
      lRideCnt = remember[key].direction
      lRideMag = remember[key].magnitude
      lRideRate = remember[key].rate
      lRideDuration = remember[key].duration
      deltamag = magnitudeAlert
      deltarate = rateAlert
    } else if (direction === -1 && key in remember && remember[key].direction > 0) {
      lRideCnt = remember[key].direction
      lRideMag = remember[key].magnitude
      lRideRate = remember[key].rate
      lRideDuration = remember[key].duration
      deltamag = magnitudeAlert
      deltarate = rateAlert
    }

    const lRide = lRideCnt
      ? `size: ${Math.abs(lRideCnt)}, magnitude: ${permil(lRideMag)}, rate: ${permil(lRideRate)}/s, duration: ${hms(lRideDuration)}`
      : 'no last ride'

    const [n, m, r, d, c] = [i.name, permil(magnitude), permil(rate), hms(duration), direction]
    const israising = src => {
      say(`EMA(${n}) of ${s} is raising ${m} at rate ${r}/s over ${d} and ${c} periods [${src}]. Last ride: ${lRide}`)
    }
    const isfalling = src => {
      say(`EMA(${n}) of ${s} is falling ${m} at rate ${r}/s over ${d} and ${-c} periods [${src}]. Last ride: ${lRide}`)
    }

    if (direction === startAlert) {
      israising('Start Rising')
    } else if (direction === -startAlert) {
      isfalling('Start falling')
    } else if (direction === risingAlert) {
      israising('Is rising')
      averageTimeBouncing[key] = initEMA()
      lasttime = undefined
    } else if (direction === -risingAlert) {
      isfalling('Is falling')
      averageTimeBouncing[key] = initEMA()
      lasttime = undefined
    }

    if (direction > 1 && average && duration > durationFactorAlert * average) {
      israising(`Rising for more than ${durationFactorAlert} bouncing average cycle (=${hms(average)})`)
      averageTimeBouncing[key] = initEMA()
      lasttime = undefined
    } else if (direction < -1 && average && duration > durationFactorAlert * average) {
      isfalling(`Falling for more than ${durationFactorAlert} bouncing average cycle (=${hms(average)})`)
      averageTimeBouncing[key] = initEMA()
      lasttime = undefined
    }

    if (direction > 1 && magnitude > deltamag) {
      israising('Great rising in magnitude')
      averageTimeBouncing[key] = initEMA()
      deltamag += magnitudeAlert
    } else if (direction < -1 && magnitude < -deltamag) {
      isfalling('Great falling in magnitude')
      averageTimeBouncing[key] = initEMA()
      deltamag -= magnitudeAlert
    }

    if (direction > 1 && rate > deltarate) {
      israising('Great rising rate')
      averageTimeBouncing[key] = initEMA()
      deltarate *= 1.05
    } else if (direction < -1 && rate < -deltarate) {
      isfalling('Great falling rate')
      averageTimeBouncing[key] = initEMA()
      deltarate *= 1.05
    }

    remember[key] = { direction, lasttime, duration, magnitude, rate, deltamag, deltarate, lRideCnt, lRideMag, lRideRate, lRideDuration }
  }
}
