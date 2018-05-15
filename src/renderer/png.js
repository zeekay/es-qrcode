import PNG from 'pnglib-es6'

import {getImageWidth, getOptions, qrToImageData} from './utils'

export function render (qrData, options) {
  var opts = getOptions(options)
  var pngOpts = opts.rendererOpts
  var size = getImageWidth(qrData.modules.size, opts)

  pngOpts.width = size
  pngOpts.height = size

  var pngImage = new PNG(pngOpts)
  qrToImageData(pngImage.data, qrData, opts)

  return pngImage
}

export function renderToDataURL (qrData, options) {
  var png = render(qrData, options)
  return png.getDataURL()
}
