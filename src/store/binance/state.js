const oneminute = 1 * 60 * 1000
const fourhours = 240 * oneminute
const twohours = 120 * oneminute
const onehour = 60 * oneminute
const halfhour = 30 * oneminute
const quarterhour = 15 * oneminute
const fiveminutes = 5 * oneminute
const threeminutes = 3 * oneminute

export default function () {
  return {
    pairs: [],
    monitPairs: [],
    bstream: null,
    cache: {},
    max: {},
    min: {},
    lastprices: {},
    periods: [
      fourhours,
      twohours,
      onehour,
      halfhour,
      quarterhour,
      fiveminutes,
      threeminutes,
      oneminute
    ],
    intervals: {
      fourhours,
      twohours,
      onehour,
      halfhour,
      quarterhour,
      fiveminutes,
      threeminutes,
      oneminute
    },
    deephist: fiveminutes, // Store a history of 5 minutes of values
    symbols: {},
    watching: []
  }
}
