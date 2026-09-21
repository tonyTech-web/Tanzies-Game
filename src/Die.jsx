const Die = ({
  value,
  isHeld,
  hold,
  id,
  isRolling,
  selected
}) => {

  const styles = {
    backgroundColor: isHeld ? "#59E391" : "white"
  };

  return (
    <button
      className={`die 
        ${isHeld ? "held" : ""} 
        ${isRolling && !isHeld ? "rolling" : ""}
        ${selected ? "selected" : ""}
      `}
      style={styles}
      onClick={() => hold(id)}
      aria-label={`Die showing ${value}${isHeld ? ", held" : ""}`}
      aria-pressed={isHeld}
    >
      <div className={`pips pips-${value}`}>
        {Array.from({ length: value }).map((_, index) => (
          <span key={index} className="pip"></span>
        ))}
      </div>
    </button>
  );
};

export default Die;