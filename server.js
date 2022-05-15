import {createServer} from 'vite'
import {Server} from 'socket.io'
import pty from 'node-pty-prebuilt-multiarch'
import os from 'os'

(async () => {
  try {
    const server = await createServer({
      configFile: false,
      server: {
        port: 5000
      }
    })
    await server.listen()
    server.printUrls()
    const io = new Server(server.httpServer)
    io.on('connection', (socket) => {
      const shell = process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL']
      const prompt = pty.spawn(shell, [], {
        name: 'xterm-256color',
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
})()
