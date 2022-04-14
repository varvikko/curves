import '../styles/main.css'

import { mat4, vec3, vec4 } from 'gl-matrix'

import vertexShaderSource from '../shaders/basic_vs.glsl'
import fragmentShaderSource from '../shaders/basic_fs.glsl'

const appContext = {}

class AttribBuffer {
  constructor(gl) {
    this.buffer = gl.createBuffer()
    this.formatObjects = []
  }

  sendAttribs(gl, attribs) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attribs), gl.STATIC_DRAW)
    this.attribsLength = attribs.length
  }

  defineFormat(gl, location, size, type, normalize, stride, offset) {
    this.formatObjects.push([location, size, type, normalize, stride, offset])
    this.vCount = this.attribsLength / size
    gl.enableVertexAttribArray(this.formatObjects[0][0])
  }

  draw(gl) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)

    for (let i = 0; i < this.formatObjects.length; i++) {
      gl.vertexAttribPointer(...this.formatObjects[i])
    }

    gl.drawArrays(gl.TRIANGLES, 0, this.vCount)
  }
}

class Rectangle {
  constructor(x, y, width, height, color) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.color = color
  }

  draw(gl) {
    Rectangle.positionBuffer.draw(gl)
  }

  static init(gl) {
    Rectangle.positionBuffer = new AttribBuffer(gl)
    Rectangle.positionBuffer.sendAttribs(gl, [1, 1, -1, 1, 1, -1, -1, -1])
    Rectangle.positionBuffer.defineFormat(
      gl, appContext.program.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0)
  }
}

function createShader(gl, source, type) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(log)
  }

  return shader
}

function setup() {
  const canvas = document.getElementById('render-canvas')
  const gl = canvas.getContext('webgl2', { antialias: true })

  if (!gl) throw new Error('Cannot acquire WebGL context.')

  const vertexShader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER)
  const fragmentShader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER)

  const shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(shaderProgram)
    gl.deleteProgram(shaderProgram)
    throw new Error(log)
  }

  const program = {
    program: shaderProgram,
    attribLocations: {},
    uniformLocations: {}
  }

  program.attribLocations.vertexPosition = gl.getAttribLocation(shaderProgram, 'vertexPosition')
  program.attribLocations.vertexColor = gl.getAttribLocation(shaderProgram, 'vertexColor')
  program.uniformLocations.modelViewMatrix = gl.getUniformLocation(shaderProgram, 'modelViewMatrix')
  program.uniformLocations.orthogonalMatrix = gl.getUniformLocation(shaderProgram, 'orthogonalMatrix')
  program.uniformLocations.fillColor = gl.getUniformLocation(shaderProgram, 'fillColor')

  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)

  appContext.canvas = canvas
  appContext.gl = gl
  appContext.program = program
  appContext.buffers = {}
  appContext.zoom = 5

  // setup models

  Rectangle.init(gl)

  const positionBuffer1 = new AttribBuffer(gl)
  const attribs1 = [
    0.5, 0.5,
    -0.5, 0.5,
    0.5, -0.5
  ]
  // positionBuffer.sendAttribs(gl, [0.5, 0.5, -0.5, 0.5, 0.5, -0.5])
  positionBuffer1.sendAttribs(gl, attribs1)
  positionBuffer1.defineFormat(gl, appContext.program.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0)
  // positionBuffer1.defineFormat(gl, appContext.program.attribLocations.vertexColor, 3, gl.FLOAT, false, 5 * 4, 2 * 4)

  const positionBuffer2 = new AttribBuffer(gl)
  const attribs2 = [
    0.5, 0.5, 0.0,
    -0.5, 0.5, 0.0,
    -0.5, -0.5, 0.0
  ]
  // positionBuffer.sendAttribs(gl, [0.5, 0.5, -0.5, 0.5, 0.5, -0.5])
  positionBuffer2.sendAttribs(gl, attribs2)
  positionBuffer2.defineFormat(gl, appContext.program.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0)

  appContext.buffers = [positionBuffer1, positionBuffer2]
}

function drawFrame(gl) {
  gl.clearColor(1, 0, 0, 1)
  gl.viewport(0, 0, appContext.width, appContext.height)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  const orthogonalMatrix = mat4.create()
  const aspectRatio = appContext.width / appContext.height
  const zoom = appContext.zoom
  mat4.ortho(orthogonalMatrix, -aspectRatio * zoom, aspectRatio * zoom, -zoom, zoom, 0.1, 100)

  const modelViewMatrix = mat4.create()
  mat4.translate(modelViewMatrix, modelViewMatrix, vec3.fromValues(0, 0, -10))

  gl.useProgram(appContext.program.program)
  gl.uniformMatrix4fv(appContext.program.uniformLocations.orthogonalMatrix, false, orthogonalMatrix)
  gl.uniformMatrix4fv(appContext.program.uniformLocations.modelViewMatrix, false, modelViewMatrix)
  gl.uniform4fv(appContext.program.uniformLocations.fillColor, vec4.fromValues(1, 1, 1, 1))

  appContext.buffers[0].draw(gl)

  mat4.identity(modelViewMatrix)
  mat4.translate(modelViewMatrix, modelViewMatrix, vec3.fromValues(1, 0, -10))
  gl.uniformMatrix4fv(appContext.program.uniformLocations.modelViewMatrix, false, modelViewMatrix)

  appContext.buffers[1].draw(gl)

  window.requestAnimationFrame(drawFrame.bind(null, gl))
}

function resize(appContext) {
  appContext.canvas.width = appContext.width = appContext.canvas.clientWidth
  appContext.canvas.height = appContext.height = appContext.canvas.clientHeight
}

export default function app() {
  setup()
  resize(appContext)

  window.addEventListener('resize', resize.bind(null, appContext))
  window.requestAnimationFrame(drawFrame.bind(null, appContext.gl))
}

