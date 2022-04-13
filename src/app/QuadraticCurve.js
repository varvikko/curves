import { vec2 } from 'gl-matrix'

class QuadraticCurve {
  constructor() {
    this.curvePoints = []
    this.controlPoints = []
    this.implicitControlPoints = []
  }

  addCurvePoint(x, y) {
    this.curvePoints.push(vec2.fromValues(x, y))
    this.calculateImplicitControlPoints()
  }

  addControlPoint(x, y) {
    if (this.controlPoints.length + 1 < this.curvePoints.length) {
      this.controlPoints.push(vec2.fromValues(x, y))
      this.calculateImplicitControlPoints()
    }
  }

  calculateImplicitControlPoints() {
    // if there are less than curvePoints.lenght - 1 controlPoints,
    // calculate missing control points based on previous control points

    if (this.controlPoints.length === 0) {
      // a curve with zero control points is a segment
      return []
    }

    const nExpectedCurvePoints = this.curvePoints.length - 1
    this.implicitControlPoints = []
    const vBase = vec2.create()
    for (let i = this.controlPoints.length; i < nExpectedCurvePoints; i++) {
      const currentControlPoint = this.controlPoints[i - 1]
      const nextCurvePoint = this.curvePoints[i]
      vec2.sub(vBase, nextCurvePoint, currentControlPoint)
      vec2.add(vBase, vBase, nextCurvePoint)
      this.implicitControlPoints.push(vBase)
    }
  }

  getSplineLength() {
    const controlPoints = this.controlPoints.concat(this.implicitControlPoints)
    return controlPoints.reduce((length, controlPoint, i) => {
      const prevCurvePoint = this.curvePoints[i]
      const nextCurvePoint = this.curvePoints[i + 1]

      return length + Math.sqrt(Math.pow(controlPoint[0] - prevCurvePoint[0], 2) + Math.pow(controlPoint[1] - prevCurvePoint[1], 2)) + Math.sqrt(Math.pow(nextCurvePoint[0] - controlPoint[0], 2) + Math.pow(nextCurvePoint[1] - controlPoint[1], 2))
    }, 0)
  }

  getNormal(t, p0, p1, p2) {

  }

  approximate() {
    const step = 0.1
    const controlPoints = this.controlPoints.concat(this.implicitControlPoints)
    const curveCoords = []
    const normals = []
    for (let i = 0; i < controlPoints.length; i++) {
      const prevCurvePoint = this.curvePoints[i]
      const nextCurvePoint = this.curvePoints[i + 1]
      const controlPoint = controlPoints[i]
      
      const v1 = vec2.create()
      const v2 = vec2.create()
      const v3 = vec2.create()
      for (let t = 0; t < 1; t += step) {
        // const curveCoordX = A[0] + (B[0] - A[0]) * t
        // const curveCoordY = A[1] + (B[1] - A[1]) * t

        // A[0] += dirA[0]
        // A[1] += dirA[1]
        // B[0] += dirB[0]
        // B[1] += dirB[1]
        vec2.scale(v1, prevCurvePoint, Math.pow(1 - t, 2))
        vec2.scale(v2, controlPoint, 2 * (1 - t) * t)

        vec2.scaleAndAdd(v3, vec2.add(v1, v1, v2), nextCurvePoint, t * t)
        curveCoords.push([v3[0],v3[1]])
        console.log(v3)
        const diff1 = [(controlPoint[0] - prevCurvePoint[0]) * 2 * (1-t), (controlPoint[1] - prevCurvePoint[1]) * 2 * (1-t)]
        const diff2 = [(nextCurvePoint[0] - controlPoint[0]) * 2 * t, (nextCurvePoint[1] - controlPoint[1]) * 2 * t]
        const normal = [(diff1[0] + diff2[0]), diff1[1] + diff2[1]]
        const normalLen = Math.sqrt(Math.pow(normal[0], 2) + Math.pow(normal[1], 2))
        normal[0] /= normalLen
        normal[1] /= normalLen
        normal[0] *= 10
        normal[1] *= 10
        const k = normal[0]
        normal[0] = -normal[1]
        normal[1] = k
        normal[0] += v3[0]
        normal[1] += v3[1]
        normals.push(normal)
      }
    }

    const last = Object.values(this.curvePoints.slice(-1)[0])
    return [curveCoords.concat([last]), normals]
  }
}

export default QuadraticCurve
