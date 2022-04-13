import '../styles/main.css'

import vertexShaderSource from '../shaders/basic_vs.glsl'
import fragmentShaderSource from '../shaders/basic_fs.glsl'

import Context from './render/context'
import ShaderProgram from './render/shaderProgram'
import Shader from './render/shader'
import run from './loop'

import QuadraticCurve from './QuadraticCurve'
import Vec2 from './vec2'

import { mat4, vec3, quat } from 'gl-matrix'

let vertexBuffer
let shaderProgram
let w
let h
let zoom = 150
let panX = 0
let panY = 0

let lineBuffer

const locations = { }
const curve = new QuadraticCurve()
curve.addCurvePoint(-100, -100)
curve.addCurvePoint(0, 0)
curve.addCurvePoint(100, 100)
curve.addControlPoint(100, -50)
curve.addControlPoint(-100, 50)
const [curvePoints, normals] = curve.approximate()

let mouseDown = false
function setup(context) {
  context.setClearColor(1.0, 1.0, 1.0, 1.0)

  const vertexShader = new Shader(vertexShaderSource, context.context.VERTEX_SHADER).compile(context.context)
  const fragmentShader = new Shader(fragmentShaderSource, context.context.FRAGMENT_SHADER).compile(context.context)
  shaderProgram = new ShaderProgram()
    .create(context.context)
    .attachShader(context.context, vertexShader)
    .attachShader(context.context, fragmentShader)
    .link(context.context)

  locations.vertexPosition = context.context.getAttribLocation(shaderProgram.program, 'vertexPosition')
  locations.orthogonalMatrix = context.context.getUniformLocation(shaderProgram.program, 'orthogonalMat')
  locations.modelViewMatrix = context.context.getUniformLocation(shaderProgram.program, 'modelViewMat')

  //
  //
  //

  vertexBuffer = context.context.createBuffer()
  context.context.bindBuffer(context.context.ARRAY_BUFFER, vertexBuffer)

  const vertices = [
    1, 1,
    -1, 1,
    1, -1,
    -1, -1
  ]

  context.context.bufferData(context.context.ARRAY_BUFFER, new Float32Array(vertices), context.context.STATIC_DRAW)

  lineBuffer = context.context.createBuffer()
  context.context.bindBuffer(context.context.ARRAY_BUFFER, lineBuffer)

  const lineVertices = []
  for (let i = 0; i < curvePoints.length - 1; i++) {
    lineVertices.push(...curvePoints[i], ...normals[i])
  }

  context.context.bufferData(context.context.ARRAY_BUFFER, new Float32Array(lineVertices), context.context.STATIC_DRAW)

  window.requestAnimationFrame(draw.bind(null, context, shaderProgram))
}

function draw(context, shaderProgram) {
  // draw
  context.context.viewport(0, 0, w, h)
  context.context.enable(context.context.DEPTH_TEST)
  context.context.depthFunc(context.context.LEQUAL)
  context.context.clear(context.context.COLOR_BUFFER_BIT | context.context.DEPTH_BUFFER_BIT)

  const orthogonalMatrix = mat4.create()
  const aspectRatio = w / h
  mat4.ortho(orthogonalMatrix, -aspectRatio * zoom, aspectRatio * zoom, -1.0 * zoom, 1.0 * zoom, 0.1, 100)

  const modelViewMatrix = mat4.create()
  mat4.translate(modelViewMatrix, modelViewMatrix, [panX, panY, -10.0])

  const points = curvePoints
  // const quadBatch = points.map(quad => ({ ...quad, w: 1, h: 1 }))

  context.context.useProgram(shaderProgram.program)

  const orthogonalMatrixLocation = locations.orthogonalMatrix
  context.context.uniformMatrix4fv(orthogonalMatrixLocation, false, orthogonalMatrix)

  renderBatch(points, vertexBuffer, context.context)

  const gl = context.context
  mat4.identity(modelViewMatrix)
  mat4.translate(modelViewMatrix, modelViewMatrix, [0,0,-10])
  gl.uniformMatrix4fv(locations.modelViewMatrix, false, modelViewMatrix)

  context.context.bindBuffer(context.context.ARRAY_BUFFER, lineBuffer)
  gl.vertexAttribPointer(locations.vertexPosition, 2, gl.FLOAT, false, 0, 0)

  gl.drawArrays(gl.LINES, 0, curvePoints.length*2)
}

function renderBatch(batch, vBuffer, gl) {
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer)

  gl.vertexAttribPointer(locations.vertexPosition, 2, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(locations.vertexPosition)

  const rot = quat.fromEuler(quat.create(), 0, 0, 0)
  for (let i = 0; i < batch.length; i++) {
    const modelViewMatrix = mat4.fromRotationTranslationScale(mat4.create(), rot, [batch[i][0], batch[i][1], -10.0], [1, 1, 1])
    gl.uniformMatrix4fv(locations.modelViewMatrix, false, modelViewMatrix)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
}

// `this` needs to be bound to the context
// resize triggers redraw
function resize() {
  w = this.canvas.clientWidth
  h = this.canvas.clientHeight
  this.canvas.width = w
  this.canvas.height = h
  window.requestAnimationFrame(draw.bind(null, this, shaderProgram))
}

export default function app() {
  const context = new Context('render-canvas')
  setup(context)
  resize.call(context)

  window.addEventListener('resize', resize.bind(context))
  window.addEventListener('wheel', function ({ deltaY }) {
    zoom += deltaY / 100
    window.requestAnimationFrame(draw.bind(null, context, shaderProgram))
  })

  window.addEventListener("mousedown", () => mouseDown = true)
  window.addEventListener("mouseup", () => mouseDown = false)
}

