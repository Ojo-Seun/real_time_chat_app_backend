import httpServer from "./app"

const PORT = process.env.NODE_ENV || 5000

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
