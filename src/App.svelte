<script lang="ts">
  import { onDestroy } from 'svelte'
  import Peer, { type DataConnection } from 'peerjs'
  import { HostGame } from './lib/game'
  import { normalizeCode, randomCode } from './lib/network'
  import type { ClientMsg, ServerMsg, State } from './lib/protocol'
  import Lobby from './components/Lobby.svelte'
  import Board from './components/Board.svelte'
  import GuessInput from './components/GuessInput.svelte'
  import Scoreboard from './components/Scoreboard.svelte'

  const TOTAL_ROUNDS = 10
  const REVEAL_MS = 4500
  const MAX_CODE_RETRIES = 3

  let peer: Peer | null = null
  let conn: DataConnection | null = null
  let isHost = $state(false)
  let roomCode = $state('')
  let myId = $state('')
  let error = $state('')
  let hostGame = $state<HostGame | null>(null)
  let hostState = $state<State | null>(null)
  let remoteState = $state<State | null>(null)
  let conns = new Map<string, DataConnection>()
  let revealTimer: ReturnType<typeof setTimeout> | null = null

  const game = $derived(isHost ? hostState : remoteState)

  const inGame = $derived(!!game)

  function setError(message: string) {
    error = message
  }

  function broadcast() {
    if (!hostGame) return
    for (const c of conns.values()) {
      if (c.open) c.send({ type: 'state', state: hostGame.state } satisfies ServerMsg)
    }
  }

  function scheduleNext() {
    if (revealTimer) clearTimeout(revealTimer)
    revealTimer = setTimeout(() => {
      hostGame?.next()
      broadcast()
    }, REVEAL_MS)
  }

  function handleHostGuess(id: string, text: string) {
    if (!hostGame) return
    hostGame.guess(id, text)
    broadcast()
    if (hostGame.state.phase === 'roundEnd') scheduleNext()
  }

  function handleHostJoin(c: DataConnection, name: string) {
    if (!hostGame) return
    const err = hostGame.addPlayer(c.peer, name)
    if (err) {
      c.send({ type: 'error', message: err } satisfies ServerMsg)
      return
    }
    broadcast()
  }

  function setupHostPeer(code: string): Peer {
    const p = new Peer(code)
    p.on('open', () => {
      roomCode = code
      setError('')
    })
    p.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        peer = null
        p.destroy()
        if (!roomCode) tryHostAgain()
        return
      }
      setError(`host error: ${err.type}`)
    })
    p.on('connection', (c) => {
      conns.set(c.peer, c)
      c.on('open', () => broadcast())
      c.on('data', (data) => {
        const msg = data as ClientMsg
        if (msg.type === 'join') handleHostJoin(c, msg.name)
        else if (msg.type === 'guess') handleHostGuess(c.peer, msg.text)
      })
      c.on('close', () => {
        conns.delete(c.peer)
        hostGame?.removePlayer(c.peer)
        broadcast()
      })
    })
    return p
  }

  let codeRetries = 0
  function tryHostAgain() {
    codeRetries++
    if (codeRetries > MAX_CODE_RETRIES) {
      setError('could not create a room — try again')
      cleanup()
      return
    }
    peer = setupHostPeer(randomCode())
  }

  function createRoom(name: string) {
    codeRetries = 0
    isHost = true
    myId = 'host'
    hostGame = new HostGame(name.trim().slice(0, 16), TOTAL_ROUNDS)
    hostGame.onState((s) => (hostState = s))
    peer = setupHostPeer(randomCode())
  }

  function joinRoom(code: string, name: string) {
    const normalized = normalizeCode(code)
    if (!normalized) return setError('enter a room code')
    isHost = false
    const p = new Peer()
    peer = p
    p.on('open', () => {
      const c = p.connect(normalized, { reliable: true })
      conn = c
      c.on('open', () => {
        roomCode = normalized
        setError('')
        c.send({ type: 'join', name: name.trim().slice(0, 16) } satisfies ClientMsg)
      })
      c.on('data', (data) => {
        const msg = data as ServerMsg
        if (msg.type === 'state') {
          remoteState = msg.state
          myId = c.peer
          setError('')
        } else if (msg.type === 'error') {
          setError(msg.message)
        }
      })
      c.on('close', () => {
        setError('the host left the game')
        cleanup()
      })
      c.on('error', (err) => {
        const type = (err as { type?: string }).type
        setError(type === 'peer-unavailable' ? 'room not found — check the code' : 'could not join the room')
        cleanup()
      })
    })
    p.on('error', () => {
      setError('could not connect — try again')
      cleanup()
    })
  }

  function sendGuess(text: string) {
    conn?.send({ type: 'guess', text } satisfies ClientMsg)
  }

  function leave() {
    if (isHost) {
      for (const c of conns.values()) c.close()
      conns.clear()
    }
    cleanup()
  }

  function cleanup() {
    if (revealTimer) clearTimeout(revealTimer)
    revealTimer = null
    conn?.close()
    conn = null
    try {
      peer?.destroy()
    } catch {
      /* already destroyed */
    }
    peer = null
    conns.clear()
    isHost = false
    roomCode = ''
    myId = ''
    hostGame = null
    hostState = null
    remoteState = null
    error = ''
  }

  onDestroy(() => {
    if (revealTimer) clearTimeout(revealTimer)
    try {
      peer?.destroy()
    } catch {
      /* already destroyed */
    }
    for (const c of conns.values()) c.close()
  })
</script>

<main>
  {#if !inGame}
    <section class="home">
      <h1>🍩 emojiguess</h1>
      <p class="tagline">one player creates a room and shares the code.<br />everyone else guesses the emoji.</p>

      {#if error}
        <p class="error">{error}</p>
      {/if}

      <form
        class="card"
        onsubmit={(e) => {
          e.preventDefault()
          const name = new FormData(e.currentTarget).get('name')?.toString() ?? ''
          if (!name.trim()) return setError('enter a name')
          createRoom(name)
        }}
      >
        <h2>create a room</h2>
        <input name="name" type="text" placeholder="your name" maxlength="16" autocomplete="off" />
        <button class="primary" type="submit">create</button>
      </form>

      <form
        class="card"
        onsubmit={(e) => {
          e.preventDefault()
          const data = new FormData(e.currentTarget)
          const name = data.get('name')?.toString() ?? ''
          const code = data.get('code')?.toString() ?? ''
          if (!name.trim()) return setError('enter a name')
          joinRoom(code, name)
        }}
      >
        <h2>join a room</h2>
        <input name="name" type="text" placeholder="your name" maxlength="16" autocomplete="off" />
        <input name="code" type="text" placeholder="room code" maxlength="8" autocomplete="off" />
        <button class="primary" type="submit">join</button>
      </form>
    </section>
  {:else if game}
    <section class="game">
      {#if game.phase === 'lobby'}
        <Lobby {game} {isHost} code={roomCode} onStart={() => {
          hostGame?.start()
          broadcast()
        }} />
      {:else}
        <Scoreboard {game} />
        <Board
          {game}
          {isHost}
          onReveal={() => {
            hostGame?.reveal()
            broadcast()
            scheduleNext()
          }}
        />
        {#if !isHost}
          <GuessInput {game} {myId} onGuess={sendGuess} />
        {:else if game.phase === 'over'}
          <button
            class="primary"
            onclick={() => {
              hostGame?.reset()
              broadcast()
            }}
          >
            play again
          </button>
        {/if}
        <button class="ghost leave" onclick={leave}>leave</button>
      {/if}
    </section>
  {/if}
</main>

<style>
  main {
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  .home {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
    max-width: 380px;
  }
  h1 {
    margin: 0;
    font-size: 44px;
    letter-spacing: -1px;
  }
  .tagline {
    margin: 0 0 8px;
    text-align: center;
    color: #9aa3b2;
    line-height: 1.5;
  }
  .error {
    margin: 0;
    color: #ff8a8a;
    font-size: 14px;
  }
  .card {
    background: #1a1d24;
    border: 1px solid #2b2f3a;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }
  .card h2 {
    margin: 0;
    font-size: 18px;
  }
  input {
    font: inherit;
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid #2b2f3a;
    background: #12151b;
    color: #e8eaed;
  }
  input:focus {
    outline: 2px solid #ffd166;
    outline-offset: 1px;
  }
  .game {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  .leave {
    margin-top: 8px;
  }
</style>