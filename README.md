# qrcode-lite
> QR code/2d barcode generator forked for ES module support

[![Travis](https://img.shields.io/travis/soldair/qrcode-lite.svg?style=flat-square)](http://travis-ci.org/soldair/qrcode-lite)
[![npm](https://img.shields.io/npm/v/qrcode.svg?style=flat-square)](https://www.npmjs.com/package/qrcode-lite)
[![npm](https://img.shields.io/npm/dt/qrcode.svg?style=flat-square)](https://www.npmjs.com/package/qrcode-lite)
[![npm](https://img.shields.io/npm/l/qrcode.svg?style=flat-square)](https://github.com/zeekay/qrcode-lite/master/LICENSE)

- [Highlights](#highlights)
- [Installation](#installation)
- [Usage](#usage)
- [Error correction level](#error-correction-level)
- [QR Code capacity](#qr-code-capacity)
- [Encoding Modes](#encoding-modes)
- [Multibyte characters](#multibyte-characters)
- [API](#api)
- [GS1 QR Codes](#gs1)
- [Credits](#credits)
- [License](#license)

## Highlights
- ES Module support
- Save QR code as image
- Support for Numeric, Alphanumeric, Kanji and Byte mode
- Support for mixed modes
- Support for chinese, cyrillic, greek and japanese characters
- Support for multibyte characters (like emojis :smile:)
- Auto generates optimized segments for best data compression and smallest QR Code size

Note: This fork only supports the browser, check out the [original
project](https://github.com/solidair/qrcode-lite) for server support.

## Installation
Inside your project folder do:

```shell
npm install --save qrcode-lite
```

## Usage

### Browser
`qrcode-lite` can be used in browser through module bundlers like
[Handroll](https://github.com/zeekay/handroll) or
[Rollup](https://github.com/rollup/rollup) or by including the precompiled
bundle present in `lib/` folder.

#### Module bundlers
```html
<!-- index.html -->
<html>
  <body>
    <canvas id="canvas"></canvas>
    <script src="bundle.js"></script>
  </body>
</html>
```

```javascript
// index.js -> bundle.js
import {toCanvas} from 'qrcode-lite'

var canvas = document.getElementById('canvas')

toCanvas(canvas, 'sample text', function (error) {
  if (error) console.error(error)
  console.log('success!');
})
```

#### Precompiled bundle
```html
<canvas id="canvas"></canvas>

<script src="/build/qrcode.min.js"></script>
<script>
QRCode.toCanvas(document.getElementById('canvas'), 'sample text')
    .then(() => {
        console.log('success!')
    })
    .catch((err) => {
        console.error(err)
    })
</script>
```

### NodeJS
Simply require the module `qrcode-lite`.

```javascript
import {toDataURL} from 'qrcode-lite'

// With promises
toDataURL('I am a pony!')
  .then(url => {
    console.log(url)
  })
  .catch(err => {
    console.error(err)
  })

// With async/await
const generateQR = async text => {
  try {
    console.log(await toDataURL(text))
  } catch (err) {
    console.error(err)
  }
}
```

## Error correction level
Error correction capability allows to successfully scan a QR Code even if the
symbol is dirty or damaged.  Four levels are available to choose according to
the operating environment.

Higher levels offer a better error resistance but reduce the symbol's
capacity.

If the chances that the QR Code symbol may be corrupted are low
(for example if it is showed through a monitor) is possible to safely use a low
error level such as `Low` or `Medium`.

Possible levels are shown below:

| Level            | Error resistance |
|------------------|:----------------:|
| **L** (Low)      | **~7%**          |
| **M** (Medium)   | **~15%**         |
| **Q** (Quartile) | **~25%**         |
| **H** (High)     | **~30%**         |

The percentage indicates the maximum amount of damaged surface after which the
symbol becomes unreadable.

Error level can be set through `options.errorCorrectionLevel` property.

If not specified, the default value is `M`.

```javascript
toDataURL('some text', { errorCorrectionLevel: 'H' }).then((url) => {
  console.log(url)
})
```

## QR Code capacity
Capacity depends on symbol version and error correction level. Also encoding
modes may influence the amount of storable data.

The QR Code versions range from version **1** to version **40**.

Each version has a different number of modules (black and white dots), which
define the symbol's size.  For version 1 they are `21x21`, for version 2 `25x25`
and so on.  Higher is the version, more are the storable data, and of course
bigger will be the QR Code symbol.

The table below shows the maximum number of storable characters in each encoding
mode and for each error correction level.

| Mode         | L    | M    | Q    | H    |
|--------------|------|------|------|------|
| Numeric      | 7089 | 5596 | 3993 | 3057 |
| Alphanumeric | 4296 | 3391 | 2420 | 1852 |
| Byte         | 2953 | 2331 | 1663 | 1273 |
| Kanji        | 1817 | 1435 | 1024 | 784  |

**Note:** Maximum characters number can be different when using [Mixed modes](#mixed-modes).

QR Code version can be set through `options.version` property.

If no version is specified, the more suitable value will be used. Unless a
specific version is required, this option is not needed.

```javascript
QRCode.toDataURL('some text', { version: 2 }, function (err, url) {
  console.log(url)
})
```

## Encoding modes
Modes can be used to encode a string in a more efficient way.

A mode may be more suitable than others depending on the string content.
A list of supported modes are shown in the table below:

| Mode         | Characters                                                | Compression                               |
|--------------|-----------------------------------------------------------|-------------------------------------------|
| Numeric      | 0, 1, 2, 3, 4, 5, 6, 7, 8, 9                              | 3 characters are represented by 10 bits   |
| Alphanumeric | 0–9, A–Z (upper-case only), space, $, %, *, +, -, ., /, : | 2 characters are represented by 11 bits   |
| Kanji        | Characters from the Shift JIS system based on JIS X 0208  | 2 kanji are represented by 13 bits        |
| Byte         | Characters from the ISO/IEC 8859-1 character set          | Each characters are represented by 8 bits |

Choose the right mode may be tricky if the input text is unknown.

In these cases **Byte** mode is the best choice since all characters can be
encoded with it. (See [Multibyte characters](#multibyte-characters))

However, if the QR Code reader supports mixed modes, using [Auto
mode](#auto-mode) may produce better results.

### Mixed modes
Mixed modes are also possible. A QR code can be generated from a series of
segments having different encoding modes to optimize the data compression.

However, switching from a mode to another has a cost which may lead to a worst
result if it's not taken into account.  See [Manual mode](#manual-mode) for an
example of how to specify segments with different encoding modes.

### Auto mode
By **default**, automatic mode selection is used.

The input string is automatically split in various segments optimized to
produce the shortest possible bitstream using mixed modes. This is the preferred
way to generate the QR Code.

For example, the string **ABCDE12345678?A1A** will be split in 3 segments with the following modes:

| Segment  | Mode         |
|----------|--------------|
| ABCDE    | Alphanumeric |
| 12345678 | Numeric      |
| ?A1A     | Byte         |

Any other combinations of segments and modes will result in a longer bitstream.

If you need to keep the QR Code size small, this mode will produce the best
results.

### Manual mode
If auto mode doesn't work for you or you have specific needs, is also possible
to manually specify each segment with the relative mode.  In this way no segment
optimizations will be applied under the hood.

Segments list can be passed as an array of object:

```javascript
import {toDataURL} from 'qrcode-lite'

var segs = [
{ data: 'ABCDEFG', mode: 'alphanumeric' },
{ data: '0123456', mode: 'numeric' }
]

QRCode.toDataURL(segs, function (err, url) {
console.log(url)
})
```

### Kanji mode
With kanji mode is possible to encode characters from the Shift JIS system in an
optimized way.

Unfortunately, there isn't a way to calculate a Shifted JIS values from, for
example, a character encoded in UTF-8, for this reason a conversion table from
the input characters to the SJIS values is needed.

This table is not included by default in the bundle to keep the size as small as
possible.

If your application requires kanji support, you will need to pass a function
that will take care of converting the input characters to appropriate values.

An helper method is provided by the lib through an optional file that you can
include as shown in the example below.

**Note:** Support for Kanji mode is only needed if you want to benefit of the
data compression, otherwise is still possible to encode kanji using Byte mode
(See [Multibyte characters](#multibyte-characters)).

```javascript
  import {toDataURL, toSJIS} from 'qrcode-lite'

  toDataURL(kanjiString, { toSJISFunc: toSJIS }, function (err, url) {
    console.log(url)
  })
```

With precompiled bundle:

```html
<canvas id="canvas"></canvas>

<script src="/build/qrcode.min.js"></script>
<script src="/build/qrcode.tosjis.min.js"></script>
<script>
  QRCode.toCanvas(document.getElementById('canvas'),
    'sample text', { toSJISFunc: QRCode.toSJIS }, function (error) {
    if (error) console.error(error)
    console.log('success!')
  })
</script>
```

## Multibyte characters
Support for multibyte characters isn't present in the initial QR Code standard, but is possible to encode UTF-8 characters in Byte mode.

QR Codes provide a way to specify a different type of character set through ECI (Extended Channel Interpretation), but it's not fully implemented in this lib yet.

Most QR Code readers, however, are able to recognize multibyte characters even without ECI.

Note that a single Kanji/Kana or Emoji can take up to 4 bytes.

## API
- [create()](#createtext-options)
- [toCanvas()](#tocanvascanvaselement-text-options)
- [toDataURL()](#todataurltext-options-url)
- [toString()](#tostringtext-options-string)

### API
#### `create(text, [options])`
Creates QR Code symbol and returns a QRCode object.

##### `text`
Type: `String|Array`

Text to encode or a list of objects describing segments.

##### `options`
See [QR Code options](#qr-code-options).

##### `returns`
Type: `Object`

```javascript
// QRCode object
{
  modules,              // Bitmatrix class with modules data
  version,              // Calculated QR Code version
  errorCorrectionLevel, // Error Correction Level
  maskPattern,          // Calculated Mask pattern
  segments              // Generated segments
}
```

<br>

#### `toCanvas(canvasElement, text, [options])`
#### `toCanvas(text, [options])`
Draws qr code symbol to canvas.<br>
If `canvasElement` is omitted a new canvas is returned.

##### `canvasElement`
Type: `DOMElement`

Canvas where to draw QR Code.

##### `text`
Type: `String|Array`

Text to encode or a list of objects describing segments.

##### `options`
See [Options](#options).

##### Example
```javascript
toCanvas('text', { errorCorrectionLevel: 'H' }).then((canvas) => {
  var container = document.getElementById('container')
  container.appendChild(canvas)
})
```

#### `toDataURL(text, [options], [cb(error, url)])`
#### `toDataURL(canvasElement, text, [options], [cb(error, url)])`
Returns a Data URI containing a representation of the QR Code image.<br>
If provided, `canvasElement` will be used as canvas to generate the data URI.

##### `canvasElement`
Type: `DOMElement`

Canvas where to draw QR Code.

##### `text`
Type: `String|Array`

Text to encode or a list of objects describing segments.

##### `options`
- ###### `type`
  Type: `String`<br>
  Default: `image/png`

  Data URI format.<br>
  Possible values are: `image/png`, `image/jpeg`, `image/webp`.<br>
  **Note: `image/webp` only works in Chrome browser.**

- ###### `rendererOpts.quality`
  Type: `Number`<br>
  Default: `0.92`

  A Number between `0` and `1` indicating image quality if the requested type is `image/jpeg` or `image/webp`.

See [Options](#options) for other settings.

##### Example
```javascript
var opts = {
  errorCorrectionLevel: 'H',
  type: 'image/jpeg',
  rendererOpts: {
    quality: 0.3
  }
}

toDataURL('text', opts).then((url) => {
  var img = document.getElementById('image')
  img.src = url
})
```
<br>

#### `toString(text, [options])`

Returns a string representation of the QR Code.<br>
Currently only works for SVG.

##### `text`
Type: `String|Array`

Text to encode or a list of objects describing segments.

##### `options`
- ###### `type`
  Type: `String`<br>
  Default: `svg`

  Output format.<br>
  Possible values are: `svg`.

See [Options](#options) for other settings.

##### Example
```javascript
toString('http://www.google.com').then((string) => {
  console.log(string)
})
```

### Options

#### QR Code options
##### `version`
  Type: `Number`<br>

  QR Code version. If not specified the more suitable value will be calculated.

##### `errorCorrectionLevel`
  Type: `String`<br>
  Default: `M`

  Error correction level.<br>
  Possible values are `low, medium, quartile, high` or `L, M, Q, H`.

##### `maskPattern`
  Type: `Number`<br>

  Mask pattern used to mask the symbol.<br>
  Possible values are `0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`.<br>
  If not specified the more suitable value will be calculated.

##### `toSJISFunc`
  Type: `Function`<br>

  Helper function used internally to convert a kanji to its Shift JIS value.<br>
  Provide this function if you need support for Kanji mode.

#### Renderers options
##### `margin`
  Type: `Number`<br>
  Default: `4`

  Define how much wide the quiet zone should be.

##### `scale`
  Type: `Number`<br>
  Default: `4`

  Scale factor. A value of `1` means 1px per modules (black dots).

##### `width`
  Type: `Number`<br>

  Forces a specific width for the output image.<br>
  If width is too small to contain the qr symbol, this option will be ignored.<br>
  Takes precedence over `scale`.

##### `color.dark`
Type: `String`<br>
Default: `#000000ff`

Color of dark module. Value must be in hex format (RGBA).<br>
Note: dark color should always be darker than `color.light`.

##### `color.light`
Type: `String`<br>
Default: `#ffffffff`

Color of light module. Value must be in hex format (RGBA).<br>

## GS1 QR Codes
There was a real good discussion here about them. but in short any qrcode
generator will make gs1 compatible qrcodes, but what defines a gs1 qrcode is a
header with metadata that describes your gs1 information.

https://github.com/soldair/qrcode-lite/issues/45

## Credits
This lib is based on "QRCode for JavaScript" which Kazuhiko Arase thankfully MIT
licensed.

## License
[MIT](https://github.com/zeekay/qrcode-lite/blob/master/LICENSE)

The word "QR Code" is registered trademark of:<br>
DENSO WAVE INCORPORATED
