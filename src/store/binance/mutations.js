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
