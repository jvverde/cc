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

export function watch (state, symbol) {
  if (state.watching.includes(symbol)) return
  state.watching.push(symbol)
}

export function forget (state, symbol) {
  const index = state.watching.indexOf(symbol)
  if (index < 0) return
  state.watching.splice(index, 1)
}

export function queue (state, symbol) {
  if (state.queueing.includes(symbol)) return
  state.queueing.push(symbol)
}

export function unqueue (state, symbol) {
  const index = state.queueing.indexOf(symbol)
  if (index < 0) return
  state.queueing.splice(index, 1)
}

export function setEmacolors (state, colors) {
  state.emacolors = colors
}

export function setMaverages (state, maverages) {
  state.maverages = maverages
}
