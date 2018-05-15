import {render as svgRender}     from './renderer/svg-tag.js'
import {create}                  from './core/qrcode'
import {render, renderToDataURL} from './renderer/canvas'

function renderCanvas(renderFunc, canvas, text, opts) {
  var args = [].slice.call(arguments, 1)
  var argsNum = args.length

  if (argsNum < 1) {
    throw new Error('Too few arguments provided')
  }

  if (argsNum === 1) {
    text = canvas
    canvas = opts = undefined
  } else if (argsNum === 2 && !canvas.getContext) {
    opts = text
    text = canvas
    canvas = undefined
  }

  return new Promise(function(resolve, reject) {
    try {
      var data = create(text, opts)
      resolve(renderFunc(data, canvas, opts))
    } catch (e) {
      reject(e)
    }
  })
}

export let toCanvas  = renderCanvas.bind(null, render)
export let toDataURL = renderCanvas.bind(null, renderToDataURL)

// only svg for now.
export let toString = renderCanvas.bind(null, function(data, _, opts) {
  return svgRender(data, opts)
})
