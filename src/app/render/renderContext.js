
class RenderContext {

  setShaderProgram(shaderProgram) {
    this.program = shaderProgram
  }

  sendBuffer(context, buffer, type) {
    context.bindBuffer(type, buffer)
  }
}

