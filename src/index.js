import xterm from 'xterm'
import fit from 'xterm-addon-fit'
import {io} from 'socket.io-client'

const terminal = new xterm.Terminal({cursorBlink: true})
terminal.open(document.body)
terminal.focus()

const fitAddon = new fit.FitAddon()
terminal.loadAddon(fitAddon)

const {protocol, hostname, port} = location
const socket = io(protocol.replace(/http(s?:)/, 'ws$1//') + hostname + (port ? ':' + port : ''))

terminal.onData((data) => socket.emit('input', data))
socket.on('output', (output) => terminal.write(output))
socket.on('exit', () => location.reload())

const resize = () => {
  const {cols, rows} = fitAddon.proposeDimensions()
  socket.emit('resize', cols, rows)
  fitAddon.fit()
}
window.onload = resize
window.onresize = resize
