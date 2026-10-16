export default function SnakeArtwork() {
  return (
    <div className="art snakeart" aria-hidden="true">
      <div className="microhead">
        SNAKE / BROWSER EDITION <span>PLAY →</span>
      </div>
      <div className="snakepixels">
        {Array.from({ length: 80 }, (_, i) => (
          <i
            key={i}
            className={
              [24, 25, 26, 27, 37, 47, 46, 45].includes(i)
                ? 'snakepixel'
                : i === 32
                  ? 'foodpixel'
                  : ''
            }
          />
        ))}
      </div>
      <div className="artcaption">A FEW RULES. ENDLESS POSSIBILITIES.</div>
    </div>
  );
}
