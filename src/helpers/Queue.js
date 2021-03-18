export default class Queue {
  constructor (size = 300) {
    this.head = 0
    this.tail = 0
    this.buff = new Array(size)
    this.size = size
  }

  _inc (index) { return (index + 1) % this.size }

  _incHead () { return (this.head = this._inc(this.head)) }

  _incTail () { return (this.tail = this._inc(this.tail)) }

  push (v) {
    if (this.isFull) this._incTail() // If it is full push tail one position
    this.buff[this.head] = v
    // this.head = (this.head + 1) % this.size
    this._incHead()
    return this.head
  }

  _remove () {
    const v = this.buff[this.tail]
    // this.tail = (this.tail + 1) % this.size
    this._incTail()
    return v
  }

  shift () {
    if (this.isEmpty) {
      return undefined
    } else {
      return this._remove()
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
      const old = this._remove()
      this.push(v)
      return old
    } else {
      this.push(v)
      return undefined
    }
  }

  [Symbol.iterator] () {
    let index = this.tail
    const done = true
    return {
      next: () => {
        if (index !== this.head) {
          const value = this.buff[index]
          index = (1 + index) % this.size
          return { value }
        } else {
          return { done }
        }
      }
    }
  }
}

export class QueueZ extends Queue {
  constructor (size, obj = 0) {
    super(size)
    this.buff = this.buff.map(e => obj)
  }
}
