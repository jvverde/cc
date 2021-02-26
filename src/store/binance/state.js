const oneminute = 1 * 60 * 1000

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
      240 * oneminute,
      120 * oneminute,
      60 * oneminute,
      30 * oneminute,
      15 * oneminute,
      5 * oneminute,
      3 * oneminute,
      1 * oneminute
    ]
  }
}
