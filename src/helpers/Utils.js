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
  let a = { ...max }, b = { ...min }
  do {
    if (a.time < b.time) {
      points.push({ ...a, type: 'M' })
      do { a = a.next } while (a && a.time <= b.time)
    } else {
      points.push({ ...b, type: 'm' })
      do { b = b.next } while (b && b.time <= a.time)
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
