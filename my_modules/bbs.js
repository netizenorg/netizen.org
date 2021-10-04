const net = require('net')
const sockets = []
const C = [
  '\x1b[0m', //   0  Reset
  '\x1b[1m', //   1  Bright
  '\x1b[2m', //   2  Dim
  '\x1b[4m', //   3  Underscore
  '\x1b[5m', //   4  Blink
  '\x1b[7m', //   5  Reverse
  '\x1b[8m', //   6  Hidden
  '\x1b[30m', //  7  Foreground Black
  '\x1b[31m', //  8  Foreground Red
  '\x1b[32m', //  9  Foreground Green
  '\x1b[33m', //  10 Foreground Yellow
  '\x1b[34m', //  11 Foreground Blue
  '\x1b[35m', //  12 Foreground Magenta
  '\x1b[36m', //  13 Foreground Cyan
  '\x1b[37m', //  14 Foreground White
  '\x1b[90m', //  15 Foreground Brright Black
  '\x1b[91m', //  16 Foreground Brright Red
  '\x1b[92m', //  17 Foreground Brright Green
  '\x1b[93m', //  18 Foreground Brright Yellow
  '\x1b[94m', //  19 Foreground Brright Blue
  '\x1b[95m', //  20 Foreground Brright Magenta
  '\x1b[96m', //  21 Foreground Brright Cyan
  '\x1b[97m', //  22 Foreground Brright White
  '\x1b[40m', //  23 Background Black
  '\x1b[41m', //  24 Background Red
  '\x1b[42m', //  25 Background Green
  '\x1b[43m', //  26 Background Yellow
  '\x1b[44m', //  27 Background Blue
  '\x1b[45m', //  28 Background Magenta
  '\x1b[46m', //  29 Background Cyan
  '\x1b[47m', //  30 Background White
  '\x1b[100m', // 31 Background BrBlack
  '\x1b[101m', // 32 Background Bright Red
  '\x1b[102m', // 33 Background Bright Green
  '\x1b[103m', // 34 Background Bright Yellow
  '\x1b[104m', // 35 Background Bright Blue
  '\x1b[10m', //  36 Background Bright Magent
  '\x1b[106m', // 37 Background Bright Cyan
  '\x1b[107m', // 38 Background Bright White
  '\x1Bc' // 39 clear screen
]

const banner = `
${C[17]}███${C[10]}╗${C[14]}░░${C[17]}██${C[10]}╗${C[17]}███████${C[10]}╗${C[17]}████████${C[10]}╗${C[17]}██${C[10]}╗${C[17]}███████${C[10]}╗${C[17]}███████${C[10]}╗${C[17]}███${C[10]}╗${C[14]}░░${C[17]}██${C[10]}╗
${C[17]}████${C[10]}╗${C[14]}░${C[17]}██${C[10]}║${C[17]}██${C[10]}╔════╝╚══${C[17]}██${C[10]}╔══╝${C[17]}██${C[10]}║╚════${C[17]}██${C[10]}║${C[17]}██${C[10]}╔════╝${C[17]}████${C[10]}╗${C[14]}░${C[17]}██${C[10]}║
${C[17]}██${C[10]}╔${C[17]}██${C[10]}╗${C[17]}██${C[10]}║${C[17]}█████${C[10]}╗${C[14]}░░░░░${C[17]}██${C[10]}║${C[14]}░░░${C[17]}██${C[10]}║${C[14]}░░${C[17]}███${C[10]}╔═╝${C[17]}█████${C[10]}╗${C[14]}░░${C[17]}██${C[10]}╔${C[17]}██${C[10]}╗${C[17]}██${C[10]}║
${C[17]}██${C[10]}║╚${C[17]}████${C[10]}║${C[17]}██${C[10]}╔══╝${C[14]}░░░░░${C[17]}██${C[10]}║${C[14]}░░░${C[17]}██${C[10]}║${C[17]}██${C[10]}╔══╝${C[14]}░░${C[17]}██${C[10]}╔══╝${C[14]}░░${C[17]}██${C[10]}║╚${C[17]}████${C[10]}║
${C[17]}██${C[10]}║${C[14]}░${C[10]}╚${C[17]}███${C[10]}║${C[17]}███████${C[10]}╗${C[14]}░░░${C[17]}██${C[10]}║${C[14]}░░░${C[17]}██${C[10]}║${C[17]}███████${C[10]}╗${C[17]}███████${C[10]}╗${C[17]}██${C[10]}║${C[14]}░${C[10]}╚${C[17]}███${C[10]}║
${C[30]}${C[7]}
.--.      .-'.      .--.      .--.      .--.      .--.
:::::.\\::::::::.\\::::::::.\\::::::::.\\::::::::.\\:::::::
'      \`--'      \`.-'      \`--'      \`--'      \`--'...
_  netizen.org propels curious citizens of the ‘net  _
__ beyond problematic defaults towards a more       __
_  creative, playful, and equitable digital world.   _
__                                                  __
_  We're a collective of new media artists, educators_
__ and activists on a mission to reestablish human  __
_  agency in the information age through public      _
__ lectures, workshops, digital tools, online events__
_  and festivals.                                    _
.--.      .-'.      .--.      .--.      .--.      .--.
:::::.\\::::::::.\\::::::::.\\::::::::.\\::::::::.\\:::::::
'      \`--'      \`.-'      \`--'      \`--'      \`--'...
_____________________________ what's your name? _____${C[0]}`

const chatBanner = `${C[17]}
      \\'-._           __
       \\\\  '-..____,.'  '.
        :'.         /    \\'.
        :  )       :      : \\
         ;'        '   ;  |  :
       )..      .. .:.'.;  :
        /::...  .:::...   ' ;
        ; _ '    __        /:\\
        ':o>   /\\o_>      ;:. '.
       '-'.__ ;   __..--- /:.   \\
       === \\_/   ;=====_.':.     ;
        ,/''--'...'--....        ;
             ;                    ;
           .'                      ;   ,-------,
.--------/         \\------------------/         \\-----------.
| .------\\         /----------------- \\         /---------. |
| |       '-'--'--'                    '--'--'-'          | |
| |            ${C[0]}WELCOME TO THE C${C[17]}H${C[0]}AT ROOM${C[17]}                   | |
| |         ${C[0]}when u wanna leave type: ${C[18]}@quit${C[17]}                | |
| |                                                       | |
| |_______________________________________________________| |
|___________________________________________________________|
${C[0]}`

function handleData (socket, data) {
  data = data.toString()
  data = data.substr(0, data.length - 2) // clear \r\n

  if (data === '@quit') {
    socket.end()
  } else if (!socket.handle) {
    socket.handle = data.toUpperCase()
    socket.write(C[39])
    socket.write(chatBanner)
  } else {
    for (let i = 0; i < sockets.length; i++) {
      if (sockets[i] !== socket) {
        const label = `${socket.color}[${socket.handle}]${C[0]}`
        sockets[i].write(`${label}: ${data}\r\n`)
      }
    }
  }
}

function closeSocket (socket) {
  const i = sockets.indexOf(socket)
  if (i !== -1) sockets.splice(i, 1)
}

function newSocket (socket) {
  socket.handle = null
  const ran = Math.floor(Math.random() * 15) + 7
  socket.color = C[ran]
  sockets.push(socket)
  socket.write(C[39])
  socket.write(banner)
  socket.on('data', (data) => handleData(socket, data))
  socket.on('end', () => closeSocket(socket))
}

const server = net.createServer(newSocket)
module.exports = server
