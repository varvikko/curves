import { beginFrame } from './render/frame'

export default function(context) {
  window.requestAnimationFrame(processAnimationFrame.bind(null, context))
}

function processAnimationFrame(context) {
  beginFrame(context)

  window.requestAnimationFrame(processAnimationFrame.bind(null, context))
}

