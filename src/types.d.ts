interface UserTypes {
  username: string
  email: string
  userRoomsId: string[]
  userId?: string
  sessionId: string
  image: string
}

interface MessageTypes {
  sender: string
  userId: string
  to: string
  content: string
  createdAt: number
}

interface RomeTypes {
  roomId: string
  name: string
  description
  userId: string
  users: User[]
  messages: Message[]
}

interface ServerToClient {
  alert: ({ message: string }) => void
  recieve_message: (message: MessageTypes) => void
}

interface ClientToServer {
  join_room: ({ username: string, roomName: string }) => void
  send_message: (message: MessageTypes) => void
}
export { UserTypes, MessageTypes, RomeTypes, ServerToClient, ClientToServer }
