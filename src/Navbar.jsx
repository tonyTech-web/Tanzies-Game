
import { useState } from "react";
import BestScore from "./BestScore";
import GameStats from "./GameStats";

export default function Navbar({
  difficulty,
  onDifficultyChange,
  darkMode,
  onToggleDarkMode,
  bestScore,
  gamesPlayed,
  gamesWon,
  onResetStatistics,
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-dice">🎲</span>
        <span>Tenzies</span>
      </div>

      <div className="settings-wrapper">
        <button
          type="button"
          className="settings-button"
          onClick={() => setSettingsOpen((open) => !open)}
          aria-expanded={settingsOpen}
          aria-label="Toggle settings menu"
        >
          <span>Settings</span>
          <span>{settingsOpen ? "✕" : "⚙"}</span>
        </button>

        {settingsOpen && (
          <div className="settings-dropdown">
            <section className="settings-section">
              <h3>Difficulty</h3>

              <div className="difficulty-options">
                {[6, 10, 15].map((number) => (
                  <button
                    key={number}
                    type="button"
                    className={
                      difficulty === number ? "active" : ""
                    }
                    onClick={() => onDifficultyChange(number)}
                    aria-pressed={difficulty === number}
                  >
                    {number === 6
                      ? "Easy"
                      : number === 10
                      ? "Normal"
                      : "Hard"}
                  </button>
                ))}
              </div>
            </section>

            <section className="settings-section">
              <h3>Appearance</h3>

              <button
                type="button"
                className="settings-action"
                onClick={onToggleDarkMode}
              >
                {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
            </section>

            <section className="settings-section">
              <h3>Statistics</h3>

              <div className="settings-stats">
                <p>
                  Best score: <strong>{bestScore ?? "—"}</strong>
                </p>

                <GameStats
                  gamesPlayed={gamesPlayed}
                  gamesWon={gamesWon}
                />
              </div>
            </section>

            <section className="settings-section">
              <button
                type="button"
                className="reset-stats-button"
                onClick={() => {
                  const confirmed = window.confirm(
                    "Are you sure you want to reset your statistics?"
                  );

                  if (confirmed) {
                    onResetStatistics();
                  }
                }}
              >
                Reset Statistics
              </button>
            </section>
          </div>
        )}
      </div>
    </nav>
  );
}
