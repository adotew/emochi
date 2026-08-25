<script lang="ts">
  import type { State } from '../lib/protocol'

  let { game }: { game: State } = $props()

  const ranked = $derived(
    [...game.players].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)),
  )
</script>

{#if game.phase === 'over'}
  <div class="final card">
    <h2>final scores</h2>
    <ol class="ranked">
      {#each ranked as p, i (p.id)}
        <li class:first={i === 0}>
          <span>{i === 0 ? '👑 ' : ''}{p.name}</span>
          <span class="score">{p.score}</span>
        </li>
      {/each}
    </ol>
  </div>
{:else}
  <div class="bar">
    {#each ranked as p (p.id)}
      <span class="chip" title={p.name}>
        <span class="name">{p.name}</span>
        <span class="score">{p.score}</span>
      </span>
    {/each}
  </div>
{/if}

<style>
  .bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #1a1d24;
    border: 1px solid #2b2f3a;
    border-radius: 999px;
    padding: 6px 14px;
    font-size: 14px;
  }
  .name {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .score {
    color: #ffd166;
    font-weight: 700;
  }
  .final {
    width: 100%;
    max-width: 380px;
  }
  .final h2 {
    margin: 0 0 16px;
  }
  .ranked {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    counter-reset: place;
  }
  .ranked li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #12151b;
    border-radius: 8px;
    padding: 10px 14px;
  }
  .ranked li.first {
    background: #1d3524;
    color: #7ee2a8;
    font-weight: 700;
  }
  .ranked .score {
    color: #ffd166;
  }
</style>