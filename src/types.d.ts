interface UserTypes {
  name: string
  username: string
  email: string
  roomsConnected: string[]
  userId?: string
  imageName: string
}

type OnlineUser = Omit<UserTypes, "roomNames" | "email", "roomsConnected">

interface MessageTypes {
  sender: string
  userId: string
  to: string
  content: string
  createdAt: number
  imageName: string
}

interface RoomTypes {
  name: string
  logo?: string
  userId: string
  users: Pick<UserTypes, "username" | "imageName" | "userId">[]
  messages: MessageTypes[]
  roomId?: string
}

interface UserStartUpData {
  allRooms: Pick<RoomTypes, "messages" | "name" | "roomId" | "users">[]
  allUsers: Pick<UserTypes, "imageName", "username", "userId">[]
  onlineUsers: OnlineUser[]
}

interface ServerToClient {
  alert: ({ message: string }) => void
  all_users: (allUsers: Pick<UserTypes, "imageName", "username", "userId">[]) => void
  online_users: (users: OnlineUser[]) => void
  all_rooms: (allRooms: Pick<RoomTypes, "messages" | "name" | "roomId" | "users">[]) => void
  initial_room_messages: (messages: MessageTypes[]) => void
  rooms_connected: (roomsConnected: Omit<RoomTypes, "logo">[]) => void
  message: (message: MessageTypes) => void
  newUserImage: (e: { [key: string]: string }) => void
}

interface ClientToServer {
  join_room: (
    { userId: string, roomName: string },
    cb: (room: Pick<RoomTypes, "messages" | "name" | "roomId" | "users">, roomsConnected: Pick<RoomTypes, "messages" | "name" | "roomId" | "users">[]) => void
  ) => void
  leave_room: ({ userId: string, roomName: string }, cb: (roomsConnected: Pick<RoomTypes, "messages" | "name" | "roomId" | "users">[]) => void) => void
  message: (message: MessageTypes) => void
  join_server: (
    { username: string, userId: string, imageName: string },
    cb: (roomsConnected: Pick<RoomTypes, "messages" | "name" | "roomId" | "users">[], allUsersImages: { [imageName: string]: string }[]) => void
  ) => void
  room_messages: (roomName: string) => void
  user_image: (imageName: string, cb: ({ image: string }) => void) => void
}
export { UserTypes, MessageTypes, RoomTypes, ServerToClient, ClientToServer, OnlineUser }
