const loader = document.getElementById('loader');
const content = document.getElementById('content');

content.style.display = "none";

setTimeout(() => {
  loader.style.display = "none";

  // window.location = "/api/";
  window.location = "/chat/";
  document.body.style.backgroundColor = "white";
  content.style.display = "block";
}, 2000);
