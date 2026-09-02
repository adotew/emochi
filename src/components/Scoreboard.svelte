<script lang="ts">
  import type { State } from '../lib/protocol'

  let { game }: { game: State } = $props()

  const ranked = $derived(
    [...game.players].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)),
  )
</script>

{#if game.phase === 'over'}
  <div class="final">
    <h2>scores</h2>
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
    gap: 16px;
    justify-content: center;
    color: #aaa;
    font-size: 14px;
  }
  .chip {
    display: inline-flex;
    gap: 6px;
  }
  .name {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .score {
    color: #fff;
    font-weight: 600;
  }
  .final {
    width: 100%;
  }
  .final h2 {
    margin: 0 0 16px;
    font-size: 18px;
  }
  .ranked {
    list-style: none;
    padding: 0;
    margin: 0;
    border-top: 1px solid #333;
  }
  .ranked li {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #333;
  }
  .ranked li.first {
    color: #7ee2a8;
    font-weight: 600;
  }
</style>