import { tickers } from 'src/helpers/wsbinance'

const compareBySymbol = (a, b) => {
  if (a.symbol < b.symbol) return -1
  if (a.symbol > b.symbol) return 1
  return 0
}

const compare = compareBySymbol
export function addPairs (state, pairs) {
  state.pairs.push(...pairs)
  state.pairs.sort(compare)
}

export function resetPairs (state) {
  state.pairs.length = 0 // reset array
}

export function monitorPairs (state, symbol) {
  if (typeof symbol === 'string') symbol = [symbol]
  console.log('symbols', symbol, typeof symbol)
  stopMonitoring(state)
  state.monitPairs.push(...symbol)
  state.websocket = tickers(...state.monitPairs, (pairs) => {
    console.log('Commit pairs', pairs)
  })
}

export function stopMonitoring (state) {
  if (state.websocket) {
    state.websocket.send(JSON.stringify({
      method: 'SUBSCRIBE',
      params: [
        'btcusdt@ticker',
        'bnbusdt@ticker'
      ],
      id: 1
    }))
    state.websocket.send(JSON.stringify({
      method: 'LIST_SUBSCRIPTIONS',
      id: 33333333
    }))
    // state.websocket.close(1000, 'stop by user')
  }
}
