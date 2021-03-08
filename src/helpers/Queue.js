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

  shift () {
    if (this.tail === this.head) {
      return undefined
    } else {
      const v = this.buff[this.tail]
      this.tail = (this.tail + 1) % this.size
      return v
    }
  }
}
