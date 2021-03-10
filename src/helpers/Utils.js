export const Line = (x1, y1, x2, y2) => {
  const d = (y2 - y1) / (x2 - x1)
  const y0 = y1 - d * x1
  return x => y0 + d * x
}

export const zigzag = (max, min) => {
  let lM = { ...max }, lm = { ...min }
  while (lM.next) lM = lM.next // find last max = current candle
  while (lm.next) lm = lm.next // find last min = current candle

  const points = []
  let a = { ...max }, b = { ...min }, type
  do {
    if (a.time < b.time) {
      type = 'M'
      points.push({ ...a, type })
      do { a = a.next } while (a && a.time < b.time)
    } else if (b.time < a.time) {
      type = 'm'
      points.push({ ...b, type })
      do { b = b.next } while (b && b.time < a.time)
    } else if (a.time === b.time && typeof a.time === 'number') {
      // console.info('max.time === min.time', type, a, b)
      if (type === 'm') {
        type = 'M'
        points.push({ ...a, type: 'M' })
        type = 'm'
        points.push({ ...b, type: 'm' })
      } else {
        type = 'm'
        points.push({ ...b, type: 'm' })
        type = 'M'
        points.push({ ...a, type: 'M' })
      }
      a = a.next
      b = b.next
    } else {
      console.warn('a is not < b && b is not < a && a !== b', a, b)
      break
    }
  } while (a && b)

  const len = points.length
  if (len && points[len - 1].type === 'M') {
    points.push({ ...lm, type: 'm' })
  } else {
    points.push({ ...lM, type: 'M' })
  }
  return points
}
