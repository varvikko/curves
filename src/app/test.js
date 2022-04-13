const Curve = require("./QuadraticCurve")

const curve1 = new Curve()
curve1.addCurvePoint(-100, -100)
curve1.addCurvePoint(10, 25)
curve1.addControlPoint(-100, 0)
const curvePoints = curve1.approximate()
// console.log(curvePoints)

