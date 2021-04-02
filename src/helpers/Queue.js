export default class Queue {
  constructor (size = 301) {
    this._head = 0
    this._tail = 0
    this._buff = size => Array.from(new Array(size), x => null)
    this._size = size
  }

  _inc (index) { return (index + 1) % this._size }

  _incHead () { return (this._head = this._inc(this._head)) }

  _incTail () { return (this._tail = this._inc(this._tail)) }

  _remove () {
    const v = this._buff[this._tail]
    // this._tail = (this._tail + 1) % this._size
    this._incTail()
    return v
  }

  push (v) {
    if (this.isFull) this._incTail() // If it is full push tail one position
    this._buff[this._head] = v
    // this._head = (this._head + 1) % this._size
    this._incHead()
    return this._head
  }

  shift () {
    if (this.isEmpty) {
      return undefined
    } else {
      return this._remove()
    }
  }

  pusha (v) {
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
    let index = this._tail
    const done = true
    return {
      next: () => {
        if (index !== this._head) {
          const value = this._buff[index]
          index = (1 + index) % this._size
          return { value }
        } else {
          return { done }
        }
      }
    }
  }

  get isFull () {
    return (this._head + 1) % this._size === this._tail
  }

  get isEmpty () {
    return this._head === this._tail
  }

  get size () { return this._size - 1 }
}

export class QueueZ extends Queue {
  constructor (size, obj = 0) {
    super(size)
    this._buff = this._buff.map(e => obj)
  }
}
