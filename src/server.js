import {createConfiguration, startServer} from 'snowpack'
import {Server} from 'socket.io'
import pty from 'node-pty-prebuilt-multiarch'
import os from 'os'

try {
  const config = createConfiguration({
    exclude: [
      '**/node_modules/**/*',
      '**/src/server.js'
    ],
    mount: {
      src: '/'
    },
    devOptions: {
      hostname: '0.0.0.0',
      port: 5000,
      open: 'none'
    }
  })
  const server = await startServer({config})
  const io = new Server(server.rawServer)
  io.on('connection', (socket) => {
    const shell = process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL']
    const prompt = pty.spawn(shell, [], {
      name: 'xterm-color',
      cwd: process.env.HOME,
      env: process.env
    })
    socket.on('input', (input) => prompt.write(input))
    prompt.on('data', (data) => socket.emit('output', data))
    socket.on('resize', (cols, rows) => prompt.resize(cols, rows))
    prompt.on('exit', () => socket.emit('exit'))
  })
} catch (error) {
  console.error(error)
}
