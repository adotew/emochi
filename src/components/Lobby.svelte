<script lang="ts">
  import type { State } from '../lib/protocol'

  let { game, isHost, code, onStart }: {
    game: State
    isHost: boolean
    code: string
    onStart?: () => void
  } = $props()

  let copied = $state(false)

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      copied = true
      setTimeout(() => (copied = false), 1500)
    } catch {
      copied = false
    }
  }
</script>

<div class="card">
  <h2>lobby</h2>

  {#if isHost}
    <p class="code-label">share this room code</p>
    <div class="code-row">
      <span class="code">{code}</span>
      <button class="ghost" onclick={copyCode}>{copied ? 'copied ✓' : 'copy'}</button>
    </div>
  {:else}
    <p class="code-label">you joined room</p>
    <div class="code-row">
      <span class="code">{code}</span>
    </div>
  {/if}

  <ul class="players">
    {#each game.players as p (p.id)}
      <li>
        <span>{p.name}</span>
        {#if p.id === 'host'}<span class="badge">host</span>{/if}
      </li>
    {/each}
  </ul>

  {#if isHost}
    <button class="primary" onclick={onStart} disabled={game.players.length < 2}>
      {game.players.length < 2 ? 'waiting for players…' : `start (${game.players.length} players)`}
    </button>
  {:else}
    <p class="waiting">waiting for the host to start…</p>
  {/if}
</div>

<style>
  .card {
    background: #1a1d24;
    border: 1px solid #2b2f3a;
    border-radius: 16px;
    padding: 28px;
    width: 100%;
    max-width: 380px;
  }
  h2 {
    margin: 0 0 16px;
  }
  .code-label {
    margin: 0 0 8px;
    color: #9aa3b2;
    font-size: 14px;
  }
  .code-row {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }
  .code {
    font-family: ui-monospace, monospace;
    font-size: 28px;
    letter-spacing: 6px;
    color: #ffd166;
    user-select: all;
  }
  .players {
    list-style: none;
    padding: 0;
    margin: 0 0 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .players li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #12151b;
    border-radius: 8px;
    padding: 8px 12px;
  }
  .badge {
    font-size: 12px;
    color: #9aa3b2;
    border: 1px solid #2b2f3a;
    border-radius: 999px;
    padding: 2px 8px;
  }
  .waiting {
    margin: 0;
    color: #9aa3b2;
  }
</style>