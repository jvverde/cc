export default class Queue {
  constructor (size = 300) {
    this.head = 0
    this.tail = 0
    this.buff = new Array(size)
    this.size = size
  }

  push (v) {
    this.buff[this.head] = v
    this.head = (this.head + 1) % this.size
    return this.head
  }

  remove () {
    const v = this.buff[this.tail]
    this.tail = (this.tail + 1) % this.size
    return v
  }

  shift () {
    if (this.isEmpty) {
      return undefined
    } else {
      return this.remove()
    }
  }

  get isFull () {
    return (this.head + 1) % this.size === this.tail
  }

  get isEmpty () {
    return this.head === this.tail
  }

  rotate (v) {
    if (this.isFull) {
      const old = this.remove()
      this.push(v)
      return old
    } else {
      this.push(v)
      return undefined
    }
  }
}

export class QueueZ extends Queue {
  constructor (size, obj = 0) {
    super(size)
    this.buff = this.buff.map(e => obj)
  }
}
