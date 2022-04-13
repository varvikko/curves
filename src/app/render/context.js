class Context {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId)
    this.glContext = this.canvas.getContext('webgl2', { antialias: true })

    if (!this.glContext) {
      throw new Error('Failed to fetch WebGL context.')
    }

    this.width = this.canvas.clientWidth
    this.height = this.canvas.clientHeight
  }

  get context() {
    return this.glContext
  }

  setClearColor(r, g, b, a) {
    this.glContext.clearColor(r, g, b, a)
  }
}

export default Context

