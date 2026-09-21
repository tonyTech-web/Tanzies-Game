import { useState, useRef, useEffect } from "react";
import Die from "./Die";
import { nanoid } from "nanoid";
import Confetti from "react-confetti";
import BestScore from "./BestScore";
import GameStats from "./GameStats";

import rollSound from "./sounds/roll.wav";
import winSound from "./sounds/win.wav";
import failSound from "./sounds/fail.wav.mp3";

const MainComponent = () => {

  const [difficulty, setDifficulty] = useState(() => {
  const savedDifficulty = localStorage.getItem("difficulty");
  return savedDifficulty ? Number(savedDifficulty) : 10;
});
  const [selectedDie, setSelectedDie] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

const generateAllNewDice = () => {
  return new Array(difficulty)
    .fill(0)
    .map(() => ({
      value: Math.ceil(Math.random() * 6),
      isHeld: false,
      id: nanoid()
    }));
};
const [allNewDice, setAllNewDice] = useState(
  () => generateAllNewDice()
);
const [rollCount, setRollCount] = useState(0);

const [bestScore, setBestScore] = useState(() => {
  const savedBestScore = localStorage.getItem("bestScore");
  return savedBestScore ? Number(savedBestScore) : null;
});

const [gamesPlayed, setGamesPlayed] = useState(0);
const [gamesWon, setGamesWon] = useState(() => {
  const savedGamesWon = localStorage.getItem("gamesWon");
  return savedGamesWon ? Number(savedGamesWon) : 0;
});
const [isRolling, setIsRolling] = useState(false);

const [time, setTime] = useState(60);
const [timerRunning, setTimerRunning] = useState(false);

const buttonRef = useRef(null);

const rollAudio = useRef(new Audio(rollSound));
const winAudio = useRef(new Audio(winSound));
const failAudio = useRef(new Audio(failSound));

const gameWonBefore = useRef(false);

const gameWon =
  allNewDice.every(die => die.isHeld) &&
  allNewDice.every(die => die.value === allNewDice[0].value);

useEffect(() => {
  localStorage.setItem("difficulty", difficulty);
}, [difficulty]);

useEffect(() => {
  if (!timerRunning) return;

  const timer = setInterval(() => {
    setTime(oldTime => {
      if (oldTime <= 1) {
        setTimerRunning(false);

        failAudio.current.currentTime = 0;
        failAudio.current.play();

        return 0;
      }

      return oldTime - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [timerRunning]);

useEffect(() => {
  setAllNewDice(generateAllNewDice());
  setRollCount(0);
  setSelectedDie(0);
  setTime(0);
  setTimerRunning(false);
}, [difficulty]);

useEffect(() => {
  if (gameWon && !gameWonBefore.current) {
    setTimerRunning(false);

    winAudio.current.currentTime = 0;
    winAudio.current.play();

    setGamesWon(old => {
      const newGamesWon = old + 1;
      localStorage.setItem("gamesWon", newGamesWon);
      return newGamesWon;
    });

    setBestScore(oldBestScore => {
      if (oldBestScore === null || rollCount < oldBestScore) {
        localStorage.setItem("bestScore", rollCount);
        return rollCount;
      }

      return oldBestScore;
    });
  }

  gameWonBefore.current = gameWon;
}, [gameWon, rollCount]);

useEffect(() => {
  const handleKeyDown = (event) => {
    const totalDice = allNewDice.length;
    const columns = 5;

    if (event.key === "ArrowLeft") {
      event.preventDefault();

      setSelectedDie(current => {
        if (current % columns === 0) {
          return current;
        }

        return current - 1;
      });
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();

      setSelectedDie(current => {
        if (current % columns === columns - 1 || current === totalDice - 1) {
          return current;
        }

        return current + 1;
      });
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setSelectedDie(current => {
        if (current - columns < 0) {
          return current;
        }

        return current - columns;
      });
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setSelectedDie(current => {
        if (current + columns >= totalDice) {
          return current;
        }

        return current + columns;
      });
    }

    if (event.code === "Space") {
      event.preventDefault();

      const die = allNewDice[selectedDie];

      if (die) {
        hold(die.id);
      }
    }

    if (event.key.toLowerCase() === "r") {
      event.preventDefault();
      clickButton();
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [allNewDice, selectedDie, gameWon]);
  
const hold = (id) => {
    setAllNewDice(oldAllNewDice =>
      oldAllNewDice.map(die =>
        die.id === id
          ? { ...die, isHeld: !die.isHeld }
          : die
      )
    );
  };

  const resetStatistics = () => {
  localStorage.removeItem("bestScore");
  localStorage.removeItem("gamesPlayed");
  localStorage.removeItem("gamesWon");

  setBestScore(null);
  setGamesPlayed(0);
  setGamesWon(0);
};

  const clickButton = () => {
  if (!gameWon && time > 0) {
    setTimerRunning(true);

    console.log("Roll clicked");
    console.log("Starting timer");

    setTimerRunning(true);

    setIsRolling(true);

    rollAudio.current.currentTime = 0;
    rollAudio.current.play();

    setAllNewDice(oldAllNewDice =>
      oldAllNewDice.map(die =>
        die.isHeld
          ? die
          : {
              ...die,
              value: Math.ceil(Math.random() * 6)
            }
      )
    );

    setRollCount(oldRollCount => oldRollCount + 1);

    setTimeout(() => {
      setIsRolling(false);
    }, 400);

  } else {
    setTimerRunning(false);
    setTime(60);

    setGamesPlayed(oldGamesPlayed => {
      const newGamesPlayed = oldGamesPlayed + 1;
      localStorage.setItem("gamesPlayed", newGamesPlayed);
      return newGamesPlayed;
    });

    setAllNewDice(generateAllNewDice());
    setRollCount(0);

    gameWonBefore.current = false;
  }
};
  
const diceElements = allNewDice.map((dieObject, index) => (
  <Die
    key={dieObject.id}
    value={dieObject.value}
    isHeld={dieObject.isHeld}
    hold={hold}
    id={dieObject.id}
    isRolling={isRolling}
    selected={index === selectedDie}
  />
));

  useEffect(() => {
  const handleKeyDown = (event) => {

    if (event.code === "Space" || event.key.toLowerCase() === "r") {
      event.preventDefault();
      clickButton();
    }
    if (event.key >= "1" && event.key <= "9") {
      const index = Number(event.key) - 1;

      if (allNewDice[index]) {
        hold(allNewDice[index].id);
      }
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [allNewDice, gameWon]);

  return (
    <main>
       {gameWon && <Confetti />}
       <div aria-live="polite" className="sr-only">
           {gameWon
              ? "Congratulations! You won the game. Press New Game to play again."
              : `You have rolled ${rollCount} times.`}
       </div>
      <div className="card-window">
       <div className={`card-content ${darkMode ? "dark" : ""}`}>

  <h1 className="title">Tenzies</h1>

  <p className="instructions">
  Roll until all dice are the same. Click each die to freeze
  it at its current value between rolls.
</p>

<p className="keyboard-help">
  Press <strong>R</strong> or <strong>Space</strong> to roll.
  Press <strong>1–9</strong> to hold dice.
</p>

<div className="game-info">
  <div>
    Time: <strong>{time}s</strong>
  </div>

  <div>
    Rolls: <strong>{rollCount}</strong>
  </div>
</div>

{gameWon && (
  <div className="win-message">
    <h2>🎉 You Won!</h2>
    <p>You finished in {rollCount} rolls.</p>
  </div>
)}

{time === 0 && !gameWon && (
  <div className="win-message">
    <h2>😂 You Failed!</h2>
    <p>Time's up! Better luck next time.</p>
  </div>
)}

<div className="dice-container">
  {diceElements}

  <button
    ref={buttonRef}
    className="roll-dice"
    onClick={clickButton}
    aria-label={gameWon ? "Start a new game" : "Roll the dice"}
  >
    {gameWon || time === 0 ? "New Game" : "Roll"}
  </button>
</div>

  <BestScore bestScore={bestScore} />

<GameStats
  gamesPlayed={gamesPlayed}
  gamesWon={gamesWon}
/>

<button
  className="reset-stats"
  onClick={resetStatistics}
>
  Reset Statistics
</button>

  <div className="difficulty">
    <button onClick={() => setDifficulty(6)}>Easy</button>
    <button onClick={() => setDifficulty(10)}>Normal</button>
    <button onClick={() => setDifficulty(15)}>Hard</button>
  </div>

  <button
    className="theme-button"
    onClick={() => setDarkMode(oldMode => !oldMode)}
  >
    {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
  </button>

       </div>
      </div>
    </main>
  );
};

export default MainComponent;