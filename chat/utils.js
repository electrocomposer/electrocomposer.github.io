const chatScroll = document.getElementById("chatScroll");

export function scrollToBottom() {
  chatScroll.scrollTo({
    top: chatScroll.scrollHeight,
    behavior: "smooth"
  });
}



export function parseAlbumDuration(duration) {
  if (typeof duration !== "number" || isNaN(duration)) return 0;

  const minutes = Math.floor(duration);
  const seconds = Math.round((duration % 1) * 100); // treat fraction as seconds
  return minutes * 60 + seconds;
}


export function formatSeconds(totalSeconds) {
  if (typeof totalSeconds !== "number" || isNaN(totalSeconds) || totalSeconds <= 0) {
    return "0m 0s";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(" ");
}
