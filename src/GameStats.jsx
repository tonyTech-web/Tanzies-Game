const GameStats = ({ gamesPlayed, gamesWon }) => {
  return (
    <div className="game-stats">
      <p>Games Played: <strong>{gamesPlayed}</strong></p>
      <p>Games Won: <strong>{gamesWon}</strong></p>
    </div>
  );
};

export default GameStats;