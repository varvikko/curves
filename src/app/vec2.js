class Vec2 {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  copy() {
    return new Vec2(this.x, this.y)
  }

  scaled(k) {
    return this.copy().scale(k)
  }

  add(v) {
    this.x += v.x
    this.y += v.y
    return this
  }

  subtract(v) {
    this.x -= v.x
    this.y -= v.y
    return this
  }

  scale(k) {
    this.x *= k
    this.y *= k
    return this
  }

  dot(v) {
    return this.x * v.x + this.y * v.y
  }

  length() {
    return Math.sqrt(this.dot(this))
  }

  // static

  static from(x, y) {
    return new Vec2(x, y)
  }

  static sum(a, b) {
    return b.copy().add(a)
  }

  static subtraction(a, b) {
    return b.copy().subtract(a)
  }
}

export default Vec2

