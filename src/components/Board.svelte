<script lang="ts">
  import type { State } from '../lib/protocol'

  let { game, isHost, onReveal }: {
    game: State
    isHost: boolean
    onReveal?: () => void
  } = $props()

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
  {:else if game.phase === 'playing' && isHost}
    <button class="ghost" onclick={onReveal}>reveal answer</button>
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
    gap: 16px;
    background: #1a1d24;
    border: 1px solid #2b2f3a;
    border-radius: 16px;
    padding: 32px;
    min-width: 320px;
  }
  .round {
    margin: 0;
    color: #9aa3b2;
    font-size: 14px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .emoji {
    font-size: 110px;
    line-height: 1;
  }
  .reveal {
    text-align: center;
  }
  .answer {
    margin: 0 0 6px;
    font-size: 20px;
  }
  .answer strong {
    color: #ffd166;
  }
  .winner {
    margin: 0;
    color: #9aa3b2;
  }
  .guesses {
    list-style: none;
    padding: 0;
    margin: 8px 0 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 180px;
    overflow-y: auto;
  }
  .guesses li {
    display: flex;
    gap: 10px;
    font-size: 14px;
    background: #12151b;
    border-radius: 8px;
    padding: 6px 10px;
  }
  .guesses li.correct {
    background: #1d3524;
    color: #7ee2a8;
  }
  .who {
    color: #9aa3b2;
    flex-shrink: 0;
  }
  .guesses li.correct .who {
    color: #7ee2a8;
  }
</style>