/** Extract host:port from a remote host URL (Vue/Angular parity). */
export function extractDomain(remoteHost: string): string {
  if (remoteHost.includes('://')) {
    return remoteHost.split('/')[2] || ''
  }
  return remoteHost.split('/')[0] || remoteHost
}

export function closeSocialWebSocket(
  socket: WebSocket,
  socketRef: { current: WebSocket | null },
) {
  if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
    socket.close()
  }
  if (socketRef.current === socket) {
    socketRef.current = null
  }
}

export function buildSocialWebSocketUrl(path: string): string {
  const remoteHost = import.meta.env.VITE_REMOTE_HOST || window.location.origin
  const domain = extractDomain(remoteHost)
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${domain}${path}`
}
