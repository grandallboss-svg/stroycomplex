import pkg from 'ssh2'
const { Client } = pkg

const host = '155.212.222.189'
const user = 'root'
const password = 'Russia03!!!'

const conn = new Client()

conn.on('ready', () => {
  const cmd = process.argv[2]
  if (!cmd) {
    console.error('Usage: node ssh-cmd.mjs "command"')
    process.exit(1)
  }

  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Exec error:', err)
      process.exit(1)
    }

    stream.on('close', () => {
      conn.end()
      process.exit(0)
    }).on('data', (data) => {
      process.stdout.write(data)
    }).stderr.on('data', (data) => {
      process.stderr.write(data)
    })
  })
}).on('error', (err) => {
  console.error('SSH connection error:', err.message)
  process.exit(1)
})

conn.connect({
  host,
  port: 22,
  username: user,
  password
})
