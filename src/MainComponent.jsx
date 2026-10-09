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

  // -----------------------------
  // Difficulty
  // -----------------------------

  const [difficulty, setDifficulty] = useState(() => {
    const savedDifficulty = localStorage.getItem("difficulty");

    return savedDifficulty
      ? Number(savedDifficulty)
      : 10;
  });


  // -----------------------------
  // Generate dice
  // -----------------------------

  const generateAllNewDice = (numberOfDice = difficulty) => {
    return new Array(numberOfDice)
      .fill(0)
      .map(() => ({
        value: Math.ceil(Math.random() * 6),
        isHeld: false,
        id: nanoid()
      }));
  };


  // -----------------------------
  // Saved game state
  // -----------------------------

  const [allNewDice, setAllNewDice] = useState(() => {
    const savedDice = localStorage.getItem("tenziesDice");

    return savedDice
      ? JSON.parse(savedDice)
      : generateAllNewDice();
  });


  const [rollCount, setRollCount] = useState(() => {
    const savedRollCount = localStorage.getItem("tenziesRollCount");

    return savedRollCount
      ? Number(savedRollCount)
      : 0;
  });


  const [time, setTime] = useState(() => {
    const savedTime = localStorage.getItem("tenziesTime");

    return savedTime
      ? Number(savedTime)
      : 60;
  });


  const [timerRunning, setTimerRunning] = useState(() => {
    return localStorage.getItem("tenziesTimerRunning") === "true";
  });


  // -----------------------------
  // Other state
  // -----------------------------

  const [selectedDie, setSelectedDie] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  const [bestScore, setBestScore] = useState(() => {
    const savedBestScore = localStorage.getItem("bestScore");

    return savedBestScore
      ? Number(savedBestScore)
      : null;
  });

  const [gamesPlayed, setGamesPlayed] = useState(() => {
    const savedGamesPlayed = localStorage.getItem("gamesPlayed");

    return savedGamesPlayed
      ? Number(savedGamesPlayed)
      : 0;
  });

  const [gamesWon, setGamesWon] = useState(() => {
    const savedGamesWon = localStorage.getItem("gamesWon");

    return savedGamesWon
      ? Number(savedGamesWon)
      : 0;
  });

  const [isRolling, setIsRolling] = useState(false);


  // -----------------------------
  // Refs
  // -----------------------------

  const buttonRef = useRef(null);

  const rollAudio = useRef(new Audio(rollSound));
  const winAudio = useRef(new Audio(winSound));
  const failAudio = useRef(new Audio(failSound));

  const gameWonBefore = useRef(false);


  // -----------------------------
  // Game won
  // -----------------------------

  const gameWon =
    allNewDice.length > 0 &&
    allNewDice.every(die => die.isHeld) &&
    allNewDice.every(
      die => die.value === allNewDice[0].value
    );


  // -----------------------------
  // Save game state
  // -----------------------------

  useEffect(() => {
    localStorage.setItem(
      "tenziesDice",
      JSON.stringify(allNewDice)
    );
  }, [allNewDice]);


  useEffect(() => {
    localStorage.setItem(
      "tenziesRollCount",
      rollCount
    );
  }, [rollCount]);


  useEffect(() => {
    localStorage.setItem(
      "tenziesTime",
      time
    );
  }, [time]);


  useEffect(() => {
    localStorage.setItem(
      "tenziesTimerRunning",
      timerRunning
    );
  }, [timerRunning]);


  useEffect(() => {
    localStorage.setItem(
      "difficulty",
      difficulty
    );
  }, [difficulty]);


  // -----------------------------
  // Timer
  // -----------------------------

  useEffect(() => {

    if (!timerRunning || time <= 0 || gameWon) {
      return;
    }

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

  }, [timerRunning, time, gameWon]);


  // -----------------------------
  // Win logic
  // -----------------------------

  useEffect(() => {

    if (gameWon && !gameWonBefore.current) {

      setTimerRunning(false);

      winAudio.current.currentTime = 0;
      winAudio.current.play();

      setGamesWon(oldGamesWon => {
        const newGamesWon = oldGamesWon + 1;

        localStorage.setItem(
          "gamesWon",
          newGamesWon
        );

        return newGamesWon;
      });


      setBestScore(oldBestScore => {

        if (
          oldBestScore === null ||
          rollCount < oldBestScore
        ) {

          localStorage.setItem(
            "bestScore",
            rollCount
          );

          return rollCount;
        }

        return oldBestScore;
      });

    }

    gameWonBefore.current = gameWon;

  }, [gameWon, rollCount]);


  // -----------------------------
  // Hold die
  // -----------------------------

  const hold = (id) => {

    setAllNewDice(oldDice =>
      oldDice.map(die =>
        die.id === id
          ? {
              ...die,
              isHeld: !die.isHeld
            }
          : die
      )
    );

  };


  // -----------------------------
  // Roll / New Game
  // -----------------------------

  const clickButton = () => {

    // NEW GAME
    if (gameWon || time === 0) {

      const newDice = generateAllNewDice();

      setAllNewDice(newDice);
      setRollCount(0);
      setTime(60);
      setTimerRunning(false);
      setSelectedDie(0);

      gameWonBefore.current = false;

      setGamesPlayed(oldGamesPlayed => {

        const newGamesPlayed = oldGamesPlayed + 1;

        localStorage.setItem(
          "gamesPlayed",
          newGamesPlayed
        );

        return newGamesPlayed;
      });

      return;
    }


    // ROLL
    setTimerRunning(true);
    setIsRolling(true);

    rollAudio.current.currentTime = 0;
    rollAudio.current.play();


    setAllNewDice(oldDice =>
      oldDice.map(die =>
        die.isHeld
          ? die
          : {
              ...die,
              value: Math.ceil(Math.random() * 6)
            }
      )
    );


    setRollCount(oldRollCount =>
      oldRollCount + 1
    );


    setTimeout(() => {
      setIsRolling(false);
    }, 400);

  };


  // -----------------------------
  // Change difficulty
  // -----------------------------

  const changeDifficulty = (newDifficulty) => {

    setDifficulty(newDifficulty);

    const newDice = generateAllNewDice(
      newDifficulty
    );

    setAllNewDice(newDice);

    setRollCount(0);
    setTime(60);
    setTimerRunning(false);
    setSelectedDie(0);

    gameWonBefore.current = false;
  };


  // -----------------------------
  // Reset statistics
  // -----------------------------

  const resetStatistics = () => {

    localStorage.removeItem("bestScore");
    localStorage.removeItem("gamesPlayed");
    localStorage.removeItem("gamesWon");

    setBestScore(null);
    setGamesPlayed(0);
    setGamesWon(0);
  };


  // -----------------------------
  // Keyboard controls
  // -----------------------------

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

          if (
            current % columns === columns - 1 ||
            current === totalDice - 1
          ) {
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


      if (event.key >= "1" && event.key <= "9") {

        const index = Number(event.key) - 1;

        if (allNewDice[index]) {
          hold(allNewDice[index].id);
        }
      }

    };


    window.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };

  }, [allNewDice, selectedDie, gameWon]);


  // -----------------------------
  // Dice elements
  // -----------------------------

  const diceElements = allNewDice.map(
    (dieObject, index) => (

      <Die
        key={dieObject.id}
        value={dieObject.value}
        isHeld={dieObject.isHeld}
        hold={hold}
        id={dieObject.id}
        isRolling={isRolling}
        selected={index === selectedDie}
      />

    )
  );


  // -----------------------------
  // Render
  // -----------------------------

  return (

    <main>

      {gameWon && <Confetti />}


      <div
        aria-live="polite"
        className="sr-only"
      >

        {gameWon
          ? "Congratulations! You won the game. Press New Game to play again."
          : `You have rolled ${rollCount} times.`
        }

      </div>


      <div className="card-window">

        <div
          className={`card-content ${
            darkMode ? "dark" : ""
          }`}
        >

          <h1 className="title">
            Tenzies
          </h1>


          <p className="instructions">
            Roll until all dice are the same.
            Click each die to freeze it at its
            current value between rolls.
          </p>


          <p className="keyboard-help">
            Press <strong>R</strong> or{" "}
            <strong>Space</strong> to roll.
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

              <p>
                You finished in {rollCount} rolls.
              </p>

            </div>

          )}


          {time === 0 && !gameWon && (

            <div className="win-message">

              <h2>😂 You Failed!</h2>

              <p>
                Time's up! Better luck next time.
              </p>

            </div>

          )}


          <div className="dice-container">

            {diceElements}


            <button
              ref={buttonRef}
              className="roll-dice"
              onClick={clickButton}
              aria-label={
                gameWon || time === 0
                  ? "Start a new game"
                  : "Roll the dice"
              }
            >

              {gameWon || time === 0
                ? "New Game"
                : "Roll"
              }

            </button>

          </div>


          <BestScore
            bestScore={bestScore}
          />


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

            <button
              onClick={() => changeDifficulty(6)}
            >
              Easy
            </button>

            <button
              onClick={() => changeDifficulty(10)}
            >
              Normal
            </button>

            <button
              onClick={() => changeDifficulty(15)}
            >
              Hard
            </button>

          </div>


          <button
            className="theme-button"
            onClick={() =>
              setDarkMode(oldMode => !oldMode)
            }
          >

            {darkMode
              ? "☀️ Light Mode"
              : "🌙 Dark Mode"
            }

          </button>


        </div>

      </div>

    </main>

  );
};

export default MainComponent;