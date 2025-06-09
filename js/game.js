const size = 16;
const mineCount = 40;
const game = document.getElementById("game");
const tileCount = document.getElementById("tile-count");
const mineCountElement = document.getElementById("mine-count");
const flagCount = document.getElementById("flag-count");
const minesFlaggedCount = document.getElementById("mines-flagged-count");
const minesMissedCount = document.getElementById("mines-missed-count");
const restartButton = document.getElementById("restart-button");
const counter = document.querySelector(".counter");
const grid = [];
const mines = new Set();
let revealedCount = 0;
let minesHit = 0;
let flagsPlaced = 0;
let minesFlagged = 0;
let minesMissed = 0;
let isFirstClick = true;
let gameOver = false;

// Initialize grid
for (let row = 0; row < size; row++) {
  grid[row] = [];
  for (let col = 0; col < size; col++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.row = row;
    tile.dataset.col = col;
    game.appendChild(tile);
    grid[row][col] = tile;
  }
}

// Place mines
while (mines.size < mineCount) {
  const r = Math.floor(Math.random() * size);
  const c = Math.floor(Math.random() * size);
  mines.add(`${r},${c}`);
}

// Count adjacent mines
function getMineCount(r, c) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr;
      const nc = c + dc;
      if (mines.has(`${nr},${nc}`)) count++;
    }
  }
  return count;
}

// Count adjacent flags
function getFlagCount(r, c) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr;
      const nc = c + dc;
      const tile = grid[nr]?.[nc];
      if (tile && tile.classList.contains("marked")) count++;
    }
  }
  return count;
}

// Reveal all adjacent tiles
function revealAdjacent(r, c) {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr;
      const nc = c + dc;
      const tile = grid[nr]?.[nc];
      if (tile && !tile.classList.contains("revealed") && !tile.classList.contains("marked")) {
        reveal(nr, nc);
      }
    }
  }
}

// Check for win
function checkWin() {
  const totalTiles = size * size;
  const nonMineTiles = totalTiles - mineCount;
  return revealedCount === nonMineTiles;
}

// End game
function endGame(won) {
  gameOver = true;
  restartButton.classList.add("visible");
  
  // Update final mine statistics
  minesMissed = mineCount - minesFlagged;
  minesMissedCount.textContent = minesMissed;
  
  if (won) {
    alert("You Win!");
  }
}

// Mark/unmark tile
function toggleMark(r, c) {
  const tile = grid[r]?.[c];
  if (!tile || tile.classList.contains("revealed") || gameOver) return;
  
  const key = `${r},${c}`;
  const wasMarked = tile.classList.contains("marked");
  tile.classList.toggle("marked");

  if (tile.classList.contains("marked")) { 
    tile.innerHTML = "<img src='css/img/flag.png'>";
    
  } else { 
    tile.innerHTML = "";
  }
  
  if (wasMarked) {
    flagsPlaced--;
    if (mines.has(key)) {
      minesFlagged--;
    }
  } else {
    flagsPlaced++;
    if (mines.has(key)) {
      minesFlagged++;
    }
  }
  
  // Update all counters
  flagCount.textContent = flagsPlaced;
  minesFlaggedCount.textContent = minesFlagged;
  minesMissed = mineCount - minesFlagged;
  minesMissedCount.textContent = minesMissed;
}

// Reveal tile
function reveal(r, c) {
  const key = `${r},${c}`;
  const tile = grid[r]?.[c];
  if (!tile || tile.classList.contains("revealed") || tile.classList.contains("marked") || gameOver) return;

  if (isFirstClick) {
    document.querySelectorAll('.counter').forEach(counter => {
      counter.classList.add("visible");
    });
    isFirstClick = false;
  }

  tile.classList.add("revealed");
  revealedCount++;
  tileCount.textContent = revealedCount;

  if (mines.has(key)) {
    tile.classList.add("bomb");
    tile.innerHTML = "<img src='css/img/bomb.png'>";
    minesHit++;
    mineCountElement.textContent = minesHit;
    minesMissed = mineCount - minesFlagged;
    minesMissedCount.textContent = minesMissed;
    endGame(false);
    return;
  }

  const count = getMineCount(r, c);
  if (count > 0) {
    tile.textContent = count;
  } else {
    // Reveal surrounding tiles if 0
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        reveal(r + dr, c + dc);
      }
    }
  }

  if (checkWin()) {
    endGame(true);
  }
}

// Click handlers
game.addEventListener("click", e => {
  if (!e.target.classList.contains("tile")) return;
  const r = parseInt(e.target.dataset.row);
  const c = parseInt(e.target.dataset.col);
  reveal(r, c);
});

game.addEventListener("contextmenu", e => {
  e.preventDefault();
  console.log(e.target)
  if (!e.target.classList.contains("tile")) return;
  const r = parseInt(e.target.dataset.row);
  const c = parseInt(e.target.dataset.col);
  const tile = grid[r][c];

  // If the tile is revealed and has a number, check for chord
  if (tile.classList.contains("revealed") && tile.textContent && tile.textContent !== "0") {
    const number = parseInt(tile.textContent);
    const flagCount = getFlagCount(r, c);
    if (flagCount === number) {
      revealAdjacent(r, c);
    }
  } else {
    // Normal flag placement
    toggleMark(r, c);
  }
});

// Restart game
restartButton.addEventListener("click", () => {
  // Clear the grid
  game.innerHTML = "";
  grid.length = 0;
  mines.clear();
  
  // Reset game state
  revealedCount = 0;
  isFirstClick = true;
  gameOver = false;
  
  // Hide restart button
  restartButton.classList.remove("visible");
  
  // Reinitialize the game
  for (let row = 0; row < size; row++) {
    grid[row] = [];
    for (let col = 0; col < size; col++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.dataset.row = row;
      tile.dataset.col = col;
      game.appendChild(tile);
      grid[row][col] = tile;
    }
  }
  
  // Place new mines
  while (mines.size < mineCount) {
    const r = Math.floor(Math.random() * size);
    const c = Math.floor(Math.random() * size);
    mines.add(`${r},${c}`);
  }
}); 