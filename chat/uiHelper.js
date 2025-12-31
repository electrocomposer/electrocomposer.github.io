// uiHelpers.js

import { scrollToBottom } from './utils.js';

const chat = document.getElementById("chat");

export function addMessage(text, sender = "bot") {
  const wrapper = document.createElement("div");
  wrapper.className =
    sender === "user" ? "flex justify-end" : "flex justify-start";

  const bubble = document.createElement("div");
  bubble.className =
    sender === "user"
      ? "bg-gray-900 text-white px-4 py-2 rounded-lg max-w-lg whitespace-pre-line"
      : "bg-white border px-4 py-2 rounded-lg max-w-lg whitespace-pre-line";

  bubble.textContent = text;
  wrapper.appendChild(bubble);
  chat.appendChild(wrapper);
  scrollToBottom();
}

/* Render helper for image responses */
export function addImage({ title, src, link }) {
  const wrapper = document.createElement("div");
  wrapper.className = "flex justify-start";

  const card = document.createElement("div");
  card.className = "bg-white border rounded-lg p-3 max-w-xs";

  if (title) {
    const heading = document.createElement("div");
    heading.className = "font-semibold text-sm mb-2";
    // heading.textContent = title;
    heading.textContent = "Click image for YouTube playlist";
    card.appendChild(heading);
  }

  /* Image wrapped in anchor when a link is provided */
  const img = document.createElement("img");
  img.src = src;
  img.alt = title || "Album artwork";
  img.className = "rounded cursor-pointer";

  /* Ensure scroll occurs AFTER image has loaded */
  img.onload = () => {
    scrollToBottom();
  };


  if (link) {
    const anchor = document.createElement("a");
    anchor.href = link;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.appendChild(img);
    card.appendChild(anchor);
  } else {
    card.appendChild(img);
  }

  wrapper.appendChild(card);
  chat.appendChild(wrapper);
  scrollToBottom();
}

/* Render helper for clickable link responses */
export function addLink({ title, url, label }) {
  const wrapper = document.createElement("div");
  wrapper.className = "flex justify-start";

  const bubble = document.createElement("div");
  bubble.className = "bg-white border px-4 py-2 rounded-lg max-w-lg";

  // for playlists etc (not applied to image as that is dealt with above)
  if (title) {
    const heading = document.createElement("div");
    heading.className = "font-semibold text-sm mb-1";
    heading.textContent = title;
    bubble.appendChild(heading);
  }

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.className = "text-blue-600 underline break-all";
  anchor.textContent = label || url;

  bubble.appendChild(anchor);
  wrapper.appendChild(bubble);
  chat.appendChild(wrapper);
  scrollToBottom();
}



/* Render an array of blocks (text + links) */
export function addBlocks(blocks) {
  blocks.forEach(block => {
  if (block.type === "text") addMessage(block.text);
  if (block.type === "link") addLink(block);
  if (block.type === "image") addImage(block);
  if (block.type === "action") {
    // Render a clickable button that triggers the action
    const wrapper = document.createElement("div");
    wrapper.className = "flex justify-start mt-2";

    const btn = document.createElement("button");
    btn.textContent = block.label;
    btn.className = "bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700";
    btn.onclick = block.action;

    wrapper.appendChild(btn);
    chat.appendChild(wrapper);
    scrollToBottom();
  }
});

}




