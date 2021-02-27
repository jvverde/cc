export const highest = (state) => (stream, period) => {
  console.log(stream, state.max)
  return state.max[stream].filter(m => m.period === period)
}
