const BestScore = ({ bestScore }) => {
  return (
    <div className="best-score">
      {bestScore !== null && (
        <p>
          Best Score: <strong>{bestScore}</strong> rolls
        </p>
      )}
    </div>
  );
};

export default BestScore;