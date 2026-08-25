<script lang="ts">
  import type { State } from '../lib/protocol'

  let { game, myId, onGuess }: {
    game: State
    myId: string
    onGuess: (text: string) => void
  } = $props()

  let text = $state('')

  const me = $derived(game.players.find((p) => p.id === myId))
  const iGotIt = $derived(
    game.phase === 'roundEnd' &&
      !!me &&
      game.guesses.some((g) => g.correct && g.name === me.name),
  )
  const disabled = $derived(game.phase !== 'playing' || iGotIt)

  function submit() {
    const guess = text.trim()
    if (!guess || disabled) return
    onGuess(guess)
    text = ''
  }
</script>

<form
  onsubmit={(e) => {
    e.preventDefault()
    submit()
  }}
>
  <input
    type="text"
    placeholder={iGotIt ? 'nice! 🎉' : game.phase === 'playing' ? 'your guess…' : '…'}
    bind:value={text}
    disabled={disabled}
    autocomplete="off"
  />
  <button class="primary" type="submit" disabled={disabled}>guess</button>
</form>

{#if iGotIt}
  <p class="got">you got it! +10</p>
{/if}

<style>
  form {
    display: flex;
    gap: 8px;
    width: 100%;
    max-width: 380px;
  }
  input {
    flex: 1;
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
  input:disabled {
    opacity: 0.5;
  }
  .got {
    margin: 0;
    color: #7ee2a8;
    font-size: 14px;
  }
</style>