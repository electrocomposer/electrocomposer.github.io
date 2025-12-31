export function launchConfetti() {
  const container = document.createElement("div");
  container.className = "fixed inset-0 pointer-events-none overflow-hidden z-50";
  document.body.appendChild(container);

  const colors = ["#ef4444", "#22c55e", "#3b82f6", "#eab308", "#a855f7"];

  for (let i = 0; i < 80; i++) {
    const piece = document.createElement("div");

    piece.style.position = "absolute";
    piece.style.top = "-10px";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.width = "8px";
    piece.style.height = "8px";
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.opacity = Math.random();
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;

    const fallDuration = 2000 + Math.random() * 1500;
    piece.animate(
      [
        { transform: "translateY(0) rotate(0deg)" },
        { transform: `translateY(110vh) rotate(${Math.random() * 720}deg)` }
      ],
      {
        duration: fallDuration,
        easing: "ease-out",
        iterations: 1
      }
    );

    container.appendChild(piece);
  }

  /* NEW: clean up DOM after animation finishes */
  setTimeout(() => {
    container.remove();
  }, 4000);
}
