<script lang="ts">
  import type { State } from '../lib/protocol'

  let { game, onGuess }: {
    game: State
    onGuess: (text: string) => void
  } = $props()

  let text = $state('')

  const disabled = $derived(game.phase !== 'playing')

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
    placeholder={game.phase === 'playing' ? 'your guess…' : '…'}
    bind:value={text}
    disabled={disabled}
    autocomplete="off"
  />
  <button class="primary" type="submit" disabled={disabled}>guess</button>
</form>

<style>
  form {
    display: flex;
    gap: 8px;
    width: 100%;
    max-width: 380px;
  }
  input {
    flex: 1;
    min-width: 0;
    font: inherit;
    padding: 12px 0;
    border: 0;
    border-bottom: 1px solid #444;
    border-radius: 0;
    background: transparent;
    color: inherit;
  }
  input:focus {
    outline: 0;
    border-color: #fff;
  }
  input:disabled {
    opacity: 0.5;
  }
</style>