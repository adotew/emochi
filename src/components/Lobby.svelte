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

<section class="lobby">
  <div class="code-row">
    <span class="code">{code}</span>
    {#if isHost}
      <button class="ghost" onclick={copyCode}>{copied ? 'copied' : 'copy'}</button>
    {/if}
  </div>

  <ul class="players">
    {#each game.players as p (p.id)}
      <li>
        <span>{p.name}</span>
        {#if p.id === 'host'}<small>host</small>{/if}
      </li>
    {/each}
  </ul>

  {#if isHost}
    <button class="primary" onclick={onStart} disabled={game.players.length < 2}>
      {game.players.length < 2 ? 'waiting…' : 'start'}
    </button>
  {:else}
    <p>waiting for host…</p>
  {/if}
</section>

<style>
  .lobby {
    width: 100%;
    text-align: center;
  }
  .code-row {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: center;
    margin-bottom: 32px;
  }
  .code {
    font-family: monospace;
    font-size: 30px;
    letter-spacing: 6px;
    user-select: all;
  }
  .players {
    list-style: none;
    padding: 0;
    margin: 0 0 24px;
    border-top: 1px solid #333;
  }
  .players li {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #333;
  }
  small,
  p {
    color: #888;
  }
  p {
    margin: 0;
  }
  .primary {
    width: 100%;
  }
</style>