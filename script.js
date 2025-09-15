'use strict';

// Ensure DOM is ready even if script not deferred
(function initWhenReady() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();

function initApp() {
  // Query essential elements
  const boxes = Array.from(document.querySelectorAll('.Box'));
  const statusEl = document.getElementById('status');
  const resetBtn = document.getElementById('reset');

  if (boxes.length !== 9) {
    console.warn('Expected 9 .Box elements for Tic-Tac-Toe.');
  }
  if (!statusEl) {
    console.warn('Missing #status element; creating one at top of <main>.');
    const div = document.createElement('div');
    div.id = 'status';
    const main = document.querySelector('main') || document.body;
    main.prepend(div);
  }

  // Constants
  const X = 'X';
  const O = 'O';
  const WIN_LINES = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ]; // standard winning combos [1]

  // State
  let board = Array(9).fill(null);
  let turn = X;
  let over = false;

  // Boot
  wireHandlers();
  reset();

  // -------------- Functions --------------

  function wireHandlers() {
    boxes.forEach((btn, i) => {
      btn.dataset.index = String(i);
      btn.addEventListener('click', onCellClick);
    });
    if (resetBtn) resetBtn.addEventListener('click', reset);
  } // attach listeners once [1]

  function reset() {
    board = Array(9).fill(null);
    turn = X;
    over = false;

    boxes.forEach(btn => {
      btn.textContent = '';
      btn.disabled = false;
      btn.classList.remove('win');
    });

    setStatus('Turn: X');
    document.body.classList.remove('won'); // hide celebration
  } // reset board and UI [1]

  function onCellClick(e) {
    if (over) return;
    const btn = e.currentTarget;
    const i = Number(btn.dataset.index);
    if (!Number.isInteger(i) || i < 0 || i > 8) return;
    if (board[i] !== null) return;

    // Apply move
    board[i] = turn;
    btn.textContent = turn;
    btn.disabled = true;

    // Evaluate
    const result = evaluate(board);
    if (result.finished) {
      endGame(result);
      return;
    }

    // Next turn
    turn = turn === X ? O : X;
    setStatus(`Turn: ${turn}`);
  } // apply move and check result [1]

  function evaluate(b) {
    for (const line of WIN_LINES) {
      const [a, c, d] = line;
      if (b[a] && b[a] === b[c] && b[a] === b[d]) {
        return { finished: true, winner: b[a], line };
      }
    }
    if (b.every(v => v !== null)) {
      return { finished: true, winner: null, line: null };
    }
    return { finished: false, winner: null, line: null };
  } // win/tie detection using 8 lines [1]

  function endGame({ winner, line }) {
    over = true;
    boxes.forEach(b => (b.disabled = true));

    if (winner) {
      // Exact requested messaging: X -> "You won!", O -> "O won!"
      setStatus(winner === X ? 'You won!' : 'O won!');

      // Highlight winning cells and show celebration layer
      if (Array.isArray(line)) {
        line.forEach(i => boxes[i]?.classList.add('win'));
      }
      document.body.classList.add('won'); // reveal banner/confetti via CSS
    } else {
      setStatus('Tie game');
      // Optional: no confetti on tie; ensure it’s hidden
      document.body.classList.remove('won');
    }
  } // lock board and celebrate [1]

  function setStatus(text) {
    const el = document.getElementById('status');
    if (el) el.textContent = text;
  } // status line update [1]
}
