
class Shader {
  constructor(source, type) {
    this.source = source
    this.type = type
  }

  compile(context) {
    this.shader = context.createShader(this.type)
    context.shaderSource(this.shader, this.source)
    context.compileShader(this.shader)

    if (!context.getShaderParameter(this.shader, context.COMPILE_STATUS)) {
      const log = context.getShaderInfoLog(this.shader)
      context.deleteShader(this.shader)
      throw new Error(log)
    }
    return this
  }
}

export default Shader

