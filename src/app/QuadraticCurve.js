class QuadraticCurve {
  constructor() {
    this.curvePoints = []
    this.controlPoints = []
    this.implicitControlPoints = []
  }

  addCurvePoint(x, y) {
    this.curvePoints.push({ x, y })
    this.calculateImplicitControlPoints()
  }

  addControlPoint(x, y) {
    if (this.controlPoints.length + 1 < this.curvePoints.length) {
      this.controlPoints.push({ x, y })
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
    for (let i = this.controlPoints.length; i < nExpectedCurvePoints; i++) {
      const currentControlPoint = this.controlPoints[i - 1]
      const nextCurvePoint = this.curvePoints[i]

      const dx = nextCurvePoint.x - currentControlPoint.x
      const dy = nextCurvePoint.y - currentControlPoint.y

      this.implicitControlPoints.push({ x: nextCurvePoint.x + dx, y: nextCurvePoint.y + dy })
    }
  }

  getSplineLength() {
    const controlPoints = this.controlPoints.concat(this.implicitControlPoints)
    return controlPoints.reduce((length, controlPoint, i) => {
      const prevCurvePoint = this.curvePoints[i]
      const nextCurvePoint = this.curvePoints[i + 1]

      return length + Math.sqrt(Math.pow(controlPoint.x - prevCurvePoint.x, 2) + Math.pow(controlPoint.y - prevCurvePoint.y, 2)) + Math.sqrt(Math.pow(nextCurvePoint.x - controlPoint.x, 2) + Math.pow(nextCurvePoint.y - controlPoint.y, 2))
    }, 0)
  }

  approximate() {
    const step = 0.01
    const controlPoints = this.controlPoints.concat(this.implicitControlPoints)
    const curveCoords = []
    const normals = []
    for (let i = 0; i < controlPoints.length; i++) {
      const prevCurvePoint = this.curvePoints[i]
      const nextCurvePoint = this.curvePoints[i + 1]
      const controlPoint = controlPoints[i]

      const dirA = [
        (controlPoint.x - prevCurvePoint.x) * step,
        (controlPoint.y - prevCurvePoint.y) * step
      ]
      const dirB = [
        (nextCurvePoint.x - controlPoint.x) * step,
        (nextCurvePoint.y - controlPoint.y) * step
      ]

      const A = [prevCurvePoint.x, prevCurvePoint.y]
      const B = [controlPoint.x, controlPoint.y]

      for (let t = 0; t < 1; t += step) {
        const curveCoordX = A[0] + (B[0] - A[0]) * t
        const curveCoordY = A[1] + (B[1] - A[1]) * t

        A[0] += dirA[0]
        A[1] += dirA[1]
        B[0] += dirB[0]
        B[1] += dirB[1]

        curveCoords.push([curveCoordX, curveCoordY])
        const diff1 = [(controlPoint.x - prevCurvePoint.x) * 2 * (1-t), (controlPoint.y - prevCurvePoint.y) * 2 * (1-t)]
        const diff2 = [(nextCurvePoint.x - controlPoint.x) * 2 * t, (nextCurvePoint.y - controlPoint.y) * 2 * t]
        const normal = [(diff1[0] + diff2[0]), diff1[1] + diff2[1]]
        const normalLen = Math.sqrt(Math.pow(normal[0], 2) + Math.pow(normal[1], 2))
        normal[0] /= normalLen
        normal[1] /= normalLen
        normal[0] *= 10
        normal[1] *= 10
        const k = normal[0]
        normal[0] = -normal[1]
        normal[1] = k
        normal[0] += curveCoordX
        normal[1] += curveCoordY
        normals.push(normal)
      }
    }

    const last = Object.values(this.curvePoints.slice(-1)[0])
    return [curveCoords.concat([last]), normals]
  }
}

module.exports = QuadraticCurve

