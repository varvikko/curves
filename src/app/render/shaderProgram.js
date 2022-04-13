
class ShaderProgram {
  constructor() {

  }

  create(context) {
    this.program = context.createProgram()
    return this
  }

  attachShader(context, shader) {
    context.attachShader(this.program, shader.shader)
    return this
  }

  link(context) {
    context.linkProgram(this.program)
    return this
  }
}

export default ShaderProgram

