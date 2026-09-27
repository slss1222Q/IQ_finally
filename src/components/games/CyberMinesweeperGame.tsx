import React, { useState, useEffect } from 'react';
import { soundManager } from '../../utils/audio';
import { ArrowLeft, RotateCcw, Trophy, Bomb, Shield, Flag, Sparkles } from 'lucide-react';

interface CyberMinesweeperGameProps {
  onWin: (ticketsWon: number) => void;
  onBack: () => void;
}

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  isOpen: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

const GRID_SIZE = 5;
const TOTAL_MINES = 4;

export const CyberMinesweeperGame: React.FC<CyberMinesweeperGameProps> = ({ onWin, onBack }) => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [flagMode, setFlagMode] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [minesRemaining, setMinesRemaining] = useState(TOTAL_MINES);

  const initGrid = () => {
    // Generate empty grid
    const newGrid: Cell[][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        row.push({
          r,
          c,
          isMine: false,
          isOpen: false,
          isFlagged: false,
          neighborMines: 0,
        });
      }
      newGrid.push(row);
    }

    // Place random mines
    let placed = 0;
    while (placed < TOTAL_MINES) {
      const rr = Math.floor(Math.random() * GRID_SIZE);
      const cc = Math.floor(Math.random() * GRID_SIZE);
      if (!newGrid[rr][cc].isMine) {
        newGrid[rr][cc].isMine = true;
        placed++;
      }
    }

    // Compute neighbor counts
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
                if (newGrid[nr][nc].isMine) count++;
              }
            }
          }
          newGrid[r][c].neighborMines = count;
        }
      }
    }

    setGrid(newGrid);
    setGameOver(false);
    setGameWon(false);
    setMinesRemaining(TOTAL_MINES);
  };

  useEffect(() => {
    initGrid();
  }, []);

  const handleCellClick = (r: number, c: number) => {
    if (gameOver || gameWon) return;
    const cell = grid[r][c];
    if (cell.isOpen) return;

    if (flagMode) {
      soundManager.playCyberClick();
      const nextGrid = grid.map(row => row.map(cl => ({ ...cl })));
      nextGrid[r][c].isFlagged = !nextGrid[r][c].isFlagged;
      setGrid(nextGrid);
      setMinesRemaining(prev => nextGrid[r][c].isFlagged ? prev - 1 : prev + 1);
      return;
    }

    if (cell.isFlagged) return;

    if (cell.isMine) {
      // Boom
      soundManager.playErrorBuzz();
      const revealed = grid.map(row =>
        row.map(cl => ({ ...cl, isOpen: cl.isMine ? true : cl.isOpen }))
      );
      setGrid(revealed);
      setGameOver(true);
      return;
    }

    // Open cell
    soundManager.playCyberClick();
    const nextGrid = grid.map(row => row.map(cl => ({ ...cl })));

    // Flood fill if 0 neighbors
    const openCellRecursive = (cr: number, cc: number) => {
      if (cr < 0 || cr >= GRID_SIZE || cc < 0 || cc >= GRID_SIZE) return;
      if (nextGrid[cr][cc].isOpen || nextGrid[cr][cc].isFlagged) return;
      nextGrid[cr][cc].isOpen = true;

      if (nextGrid[cr][cc].neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr !== 0 || dc !== 0) openCellRecursive(cr + dr, cc + dc);
          }
        }
      }
    };

    openCellRecursive(r, c);
    setGrid(nextGrid);

    // Check Win condition: all non-mine cells opened
    let unopenedSafeCells = 0;
    for (let row of nextGrid) {
      for (let cl of row) {
        if (!cl.isMine && !cl.isOpen) unopenedSafeCells++;
      }
    }

    if (unopenedSafeCells === 0) {
      soundManager.playVictoryFanfare();
      setGameWon(true);
      onWin(2);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between p-4 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-xl">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
              Kognitiv Trenajyor
            </div>
            <h2 className="text-base font-display font-bold text-white flex items-center gap-1.5">
              <span>MINALAR MAYDONI & DEAKTIVATOR</span>
              <Bomb className="w-4 h-4 text-emerald-400" />
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playCyberClick();
              setFlagMode(!flagMode);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              flagMode
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-400'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{flagMode ? 'Bayroq Rejimi' : 'Ochish Rejimi'}</span>
          </button>

          <button
            onClick={initGrid}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 flex items-center justify-center transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-slate-950 border border-emerald-500/30 shadow-2xl space-y-4 text-center">
        <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-400">
          <span>Qolgan Minalar: <strong className="text-amber-400">{minesRemaining}</strong></span>
          <span>Hajm: <strong>5x5</strong></span>
        </div>

        {/* 5x5 Mine Grid */}
        <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto aspect-square">
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`rounded-xl font-mono text-sm font-bold flex items-center justify-center transition-all cursor-pointer ${
                  cell.isOpen
                    ? cell.isMine
                      ? 'bg-rose-600 text-white shadow-lg'
                      : 'bg-slate-900 border border-slate-800 text-cyan-300'
                    : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-400 shadow-sm'
                }`}
              >
                {cell.isOpen ? (
                  cell.isMine ? (
                    '💣'
                  ) : cell.neighborMines > 0 ? (
                    cell.neighborMines
                  ) : (
                    ''
                  )
                ) : cell.isFlagged ? (
                  '🚩'
                ) : (
                  ''
                )}
              </button>
            ))
          )}
        </div>

        {/* Win Alert */}
        {gameWon && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-400 text-center space-y-2 animate-bounce">
            <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
            <h3 className="text-base font-bold text-white">BARCHA MINALAR DEAKTIVATSIYA BO'LDI!</h3>
            <p className="text-xs text-emerald-300 font-mono">
              Xavfsiz xotira tozalindi! +2 Chipta taqdim etildi!
            </p>
            <button
              onClick={initGrid}
              className="mt-2 px-5 py-2 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs shadow"
            >
              Yana Sinash
            </button>
          </div>
        )}

        {/* Game Over */}
        {gameOver && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500 text-center space-y-2">
            <h3 className="text-base font-bold text-white">MINA PORTLADI!</h3>
            <p className="text-xs text-rose-300">
              Kiber virus faollashdi. Qaytadan urinib ko'ring!
            </p>
            <button
              onClick={initGrid}
              className="mt-2 px-5 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs shadow"
            >
              Qayta Boshlash
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
