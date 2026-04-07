export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--midnight)" }}>
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 mb-6">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-2 h-2 rounded-full bg-[var(--gold)]"
              style={{
                animation: "pulse 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
        <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)]">LOADING</p>
      </div>
    </div>
  );
}
