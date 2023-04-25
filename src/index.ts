import httpServer from "./app"
import OS from "os"
import cluster from "cluster"

const PORT = process.env.NODE_ENV || 5000

const CPUcores = OS.cpus().length

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} on CPU core ${process.pid}`)
})
