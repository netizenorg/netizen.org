/*
   here's a basic example of how to draw waveforms and frequency bars from data
   generated by the AnalyserNode using the canvas API
*/

const ctx = new (window.AudioContext || window.webkitAudioContext)()
const fft = new AnalyserNode( ctx )
const osc = new OscillatorNode( ctx, {frequency:20})
const gn = new GainNode(ctx, {gain:0.5})

osc.connect(gn)
gn.connect(fft)
fft.connect(ctx.destination)

// let's span the range of average human audability,
// 20 Hz - 20,000 Hz
function incFreq(){
    if(osc.frequency.value < 20000){
        requestAnimationFrame(incFreq)
        osc.frequency.value += 10
    } else {
        osc.stop()
    }
}

osc.start()
incFreq()

// ------------------------------------------------
// ------------- canvas animations ----------------
// ------------------------------------------------

// create canvas...
const canvas = document.createElement('canvas')
canvas.width = document.querySelector('section').offsetWidth
document.querySelector('section').appendChild(canvas)
const canvasCtx = canvas.getContext("2d")
canvasCtx.fillStyle = "#23241f"
canvasCtx.strokeStyle = "#f92672"

// create array to store data in
let bufferLength = fft.frequencyBinCount
let dataArray = new Uint8Array(bufferLength)

function animate(){
    setTimeout(animate,1000/12) // 12fps
    canvasCtx.fillStyle = "#23241f"
    canvasCtx.fillRect(0,0,canvas.width,canvas.height)

    // fill dataArray w/ time domain data (ints 0-128)...
    fft.getByteTimeDomainData(dataArray)

    // draw time domain data (waveform)...
    canvasCtx.beginPath()
    let column = canvas.width/bufferLength
    let x = 0
    for (let i = 0; i < bufferLength; i++) {
        //       normalize data      scale to canvas
        let y = (dataArray[i]/128) * (canvas.height/2)
        if (i===0) canvasCtx.moveTo(x, y)
        else canvasCtx.lineTo(x, y)
        x += column
    }
    canvasCtx.lineTo(canvas.width, canvas.height/2)
    canvasCtx.stroke()

    // now fill dataArray w/ frequency domain data (ints 0-255)...
    fft.getByteFrequencyData(dataArray)

    // draw frequency domain data (bar graph)...
    x = 0
    let barH, barW = canvas.width/bufferLength
    for(let i = 0; i < bufferLength; i++) {
        //     normalize data     scale to 75% of canvas height
        barH = dataArray[i]/255 * canvas.height * 0.75
        // yellow, but the higher the data value the more saturated
        canvasCtx.fillStyle = `rgb(${dataArray[i]},${dataArray[i]},50)`
        canvasCtx.fillRect(x, canvas.height-barH, barW,barH )
        x += barW + 1
    }

    // draw current osc frequency value
    canvasCtx.fillStyle = '#fff'
    canvasCtx.font = '24px Arial'
    canvasCtx.fillText(`${osc.frequency.value}Hz`, 10, 30)

}
animate()