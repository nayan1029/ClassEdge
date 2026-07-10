import React, { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Loader from '../components/common/Loader'
import RoomChat from '../components/rooms/RoomChat'
import RoomVideoCall from '../components/rooms/RoomVideoCall'
import { roomsApi } from '../api/roomsApi'
import { createChatClient } from '../services/chatClient'

export default function StudyRoomsPage() {
  const queryClient = useQueryClient()
  const { data: rooms = [], isLoading } = useQuery({ queryKey: ['rooms'], queryFn: roomsApi.getAll })

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRoom, setNewRoom] = useState({ name: '', topic: '', status: 'SCHEDULED' })
  const [activeRoomId, setActiveRoomId] = useState(null)

  const [chatClient, setChatClient] = useState(null)
  const [connected, setConnected] = useState(false)

  // One shared STOMP connection for the whole page — chat and video signaling
  // for whichever room is open both ride over it.
  useEffect(() => {
    const client = createChatClient({
      onConnect: () => setConnected(true),
      onError: () => setConnected(false),
    })
    setChatClient(client)
    return () => {
      client.deactivate()
    }
  }, [])

  const createMutation = useMutation({
    mutationFn: roomsApi.create,
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      setShowCreateForm(false)
      setNewRoom({ name: '', topic: '', status: 'SCHEDULED' })
      setActiveRoomId(room.id)
    },
  })

  const joinMutation = useMutation({
    mutationFn: roomsApi.join,
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      setActiveRoomId(room.id)
    },
  })

  const activeRoom = rooms.find((room) => room.id === activeRoomId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Collaborative Study Rooms</h1>
        <Button onClick={() => setShowCreateForm((prev) => !prev)}>
          {showCreateForm ? 'Cancel' : '+ Create Room'}
        </Button>
      </div>

      {showCreateForm && (
        <Card title="New Study Room">
          <form
            className="grid gap-3 md:grid-cols-3"
            onSubmit={(event) => {
              event.preventDefault()
              if (!newRoom.name.trim()) return
              createMutation.mutate(newRoom)
            }}
          >
            <Input
              label="Room name"
              value={newRoom.name}
              onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
              placeholder="e.g. Networks Crash Course"
              required
            />
            <Input
              label="Topic"
              value={newRoom.topic}
              onChange={(e) => setNewRoom({ ...newRoom, topic: e.target.value })}
              placeholder="What will you cover?"
            />
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:bg-gray-800 dark:border-gray-700"
                value={newRoom.status}
                onChange={(e) => setNewRoom({ ...newRoom, status: e.target.value })}
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="LIVE">Live now</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <Button type="submit" disabled={createMutation.isPending || !newRoom.name.trim()}>
                {createMutation.isPending ? 'Creating...' : 'Create Room'}
              </Button>
              {createMutation.isError && (
                <span className="ml-3 text-sm text-red-600">
                  {createMutation.error?.response?.data?.message || 'Could not create room'}
                </span>
              )}
            </div>
          </form>
        </Card>
      )}

      {isLoading && <Loader text="Loading study rooms" />}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <Card key={room.id} title={room.name} className={activeRoomId === room.id ? 'ring-2 ring-indigo-500' : ''}>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Members: {room.members}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Status: {room.status}</p>
            {room.topic && <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Topic: {room.topic}</p>}
            <div className="flex gap-2">
              {room.joined ? (
                <Button onClick={() => setActiveRoomId(room.id)}>Open Room</Button>
              ) : (
                <Button onClick={() => joinMutation.mutate(room.id)} disabled={joinMutation.isPending}>
                  {joinMutation.isPending ? 'Joining...' : 'Join Room'}
                </Button>
              )}
              {activeRoomId === room.id && (
                <Button variant="secondary" onClick={() => setActiveRoomId(null)}>Close</Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {activeRoom && (
        <Card title={`${activeRoom.name} — Chat & Video`}>
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Chat</h4>
              <RoomChat room={activeRoom} chatClient={chatClient} connected={connected} />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Video Call</h4>
              <RoomVideoCall room={activeRoom} chatClient={chatClient} connected={connected} />
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
