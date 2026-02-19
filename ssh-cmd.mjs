import { Client } from 'ssh2'

const conn = new Client()

const host = '155.212.222.189'
const user = 'root'
const password = 'Russia03!!!'
const command = process.argv[2] || 'docker --version'

conn.on('ready', () => {
  conn.exec(command, (err, stream) => {
    if (err) {
      console.error('Exec error:', err)
      conn.end()
      process.exit(1)
    }

    let output = ''
    stream.on('close', (code, signal) => {
      console.log(output)
      conn.end()
      process.exit(code || 0)
    }).on('data', (data) => {
      output += data.toString()
    }).stderr.on('data', (data) => {
      output += data.toString()
    })
  })
}).on('error', (err) => {
  console.error('Connection error:', err.message)
  process.exit(1)
}).connect({
  host,
  port: 22,
  username: user,
  password
})
