export function updateMax ({ price, time, max }, delta = 6e4) {
  const current = { price, time }
  // First shift max until found the first one on 'time window' left side
  while (time - max.time > delta && max.next) {
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
  return { ...max, delta }
}

export function updateMin ({ price, time, min }, delta = 6e4) {
  const current = { price, time }
  while (time - min.time > delta && min.next) { // Slide min to first minimum on window delta time
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
  return { ...min, delta }
}
