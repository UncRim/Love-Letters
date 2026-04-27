export function AnimatedText({ text }: { text: string }) {
  return (
    <>
      {text.split("").map((char, i) => (
        <span
          key={i}
          style={{
            opacity: 0,
            animation: `write-in 0.04s ${i * 0.03}s forwards`,
            whiteSpace: char === " " ? "pre" : "normal",
          }}
        >
          {char}
        </span>
      ))}
    </>
  );
}
