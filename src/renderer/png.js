import {PNG} from 'pngjs'

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

export function renderToDataURL (qrData, options, cb) {
  if (typeof cb === 'undefined') {
    cb = options
    options = undefined
  }

  var png = render(qrData, options)
  var buffer = []

  png.on('error', cb)

  png.on('data', function (data) {
    buffer.push(data)
  })

  png.on('end', function () {
    var url = 'data:image/png;base64,'
    url += Buffer.concat(buffer).toString('base64')
    cb(null, url)
  })

  png.pack()
}
