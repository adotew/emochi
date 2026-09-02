<script lang="ts">
  import type { State } from '../lib/protocol'

  let { game }: { game: State } = $props()

  const winner = $derived(game.players.find((p) => p.id === game.winnerId))
</script>

<div class="board">
  <p class="round">round {game.round.num} / {game.round.total}</p>

  <div class="emoji" aria-label="emoji clue">{game.round.emojis.join(' ')}</div>

  {#if game.phase === 'roundEnd'}
    <div class="reveal">
      <p class="answer">it was <strong>{game.answer}</strong></p>
      {#if winner}
        <p class="winner">🎉 {winner.name} got it! +10</p>
      {:else}
        <p class="winner">no one got it 😅</p>
      {/if}
    </div>
  {/if}

  {#if game.guesses.length > 0}
    <ul class="guesses">
      {#each game.guesses as g, i (i)}
        <li class:correct={g.correct}>
          <span class="who">{g.name}</span>
          <span class="text">{g.text}</span>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .board {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
  }
  .round,
  .winner,
  .who {
    color: #888;
  }
  .round,
  .answer,
  .winner {
    margin: 0;
  }
  .round {
    font-size: 13px;
  }
  .emoji {
    margin: 24px 0;
    font-size: 96px;
    line-height: 1;
  }
  .reveal {
    text-align: center;
  }
  .answer {
    margin-bottom: 4px;
    font-size: 20px;
  }
  .guesses {
    list-style: none;
    padding: 0;
    margin: 8px 0 0;
    width: 100%;
    max-height: 180px;
    overflow-y: auto;
    border-top: 1px solid #333;
  }
  .guesses li {
    display: flex;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid #333;
    font-size: 14px;
  }
  .guesses li.correct,
  .guesses li.correct .who {
    color: #7ee2a8;
  }
  .who {
    flex-shrink: 0;
  }
</style>