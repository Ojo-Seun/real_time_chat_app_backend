interface UserTypes {
  name: string
  username: string
  email: string
  roomsConnected: string[]
  userId?: string
  sessionId: string
  image: string
}

type OnlineUser = Omit<UserTypes, "roomNames" | "email", "roomsConnected">

interface MessageTypes {
  sender: string
  userId: string
  to: string
  content: string
  createdAt: number
  image: string
}

interface RoomTypes {
  name: string
  logo?: string
  userId: string
  users: Pick<UserTypes, "username" | "image" | "userId" | "sessionId">[]
  messages: MessageTypes[]
  roomId?: string
}

interface ServerToClient {
  alert: ({ message: string }) => void
  recieve_message: (message: MessageTypes) => void
  all_users: (allUsers: Pick<UserTypes, "image", "username", "userId">[]) => void
  online_users: (users: OnlineUser[]) => void
  all_rooms: (allRooms: any[]) => void
  rooms_connected: (roomsConnected: any[]) => void
  initial_room_messages: (messages: MessageTypes[]) => void
  room_info: (room: Pick<RoomTypes, "messages" | "roomId" | "name" | "users">) => void
  disconnect: () => void
}

interface ClientToServer {
  join_room: ({ userId: string, roomName: string }) => void
  leave_room: ({ userId: string, roomName: string }) => void
  send_message: (message: MessageTypes) => void
  join_server: ({ username: string, userId: string, image: string }) => void
}
export { UserTypes, MessageTypes, RoomTypes, ServerToClient, ClientToServer, OnlineUser }
