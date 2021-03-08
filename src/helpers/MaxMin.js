export function updateMax ({ price, time, max }, since = 6e4) {
  const current = { price, time }
  // First shift max until found the first one on 'time window' left side
  while (time - max.time > since && max.next) {
    max = max.next
  }

  // Now check if current price is higher than max
  if (price >= max.price) {
    max = current // Yes, no next field (yet)
  } else {
    // If it isn't max, go through the successive maximum points until find one that is lower
    // and replace it by current point.
    // Or insert current at the end if all maximum are greater
    let point = max // start at present max
    while (point.next && price < point.next.price) {
      point = point.next // Continue if there is next point and price is lower
    }
    point.next = current // The maximum chain always ends on current value (Except if it is max value)
  }
  return { ...max, since }
}

export function updateMin ({ price, time, min }, since = 6e4) {
  const current = { price, time }
  while (time - min.time > since && min.next) { // Slide min to first minimum on window since time
    min = min.next
  }

  if (price <= min.price) {
    min = current
  } else {
    let point = min
    while (point.next && price > point.next.price) {
      point = point.next
    }
    point.next = current
  }
  return { ...min, since }
}

export function firstOf (time, m) {
  let a = { ...m }
  while (time > a.time && a.next) a = a.next
  return a
}
