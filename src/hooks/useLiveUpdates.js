import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { SOCKET_URL } from '../services/http'
import { socketAuthOptions } from '../services/authToken'

/**
 * Call `onEvent(name, data)` when any of `events` arrives for this user.
 * Each page gets its own connection (authenticated with the cookie or the
 * Bearer token, so it works on iPhone too) and joins `rooms` (e.g. a booking).
 */
export default function useLiveUpdates(events, onEvent, { rooms = [] } = {}) {
  const handler = useRef(onEvent)
  handler.current = onEvent
  const key = `${events.join(',')}|${rooms.map((r) => `${r.type}:${r.id}`).join(',')}`

  useEffect(() => {
    let socket
    try {
      socket = io(SOCKET_URL, socketAuthOptions({ transports: ['websocket', 'polling'], reconnection: true }))
    } catch {
      return undefined
    }
    socket.on('connect', () => {
      rooms.forEach((r) => {
        if (r.type === 'booking') socket.emit('join-booking', r.id)
        if (r.type === 'errand') socket.emit('join-errand', r.id)
      })
    })
    events.forEach((name) => socket.on(name, (data) => handler.current?.(name, data)))
    return () => socket.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}
