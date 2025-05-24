


    const text = document.getElementById('text');
    const image = document.getElementById('image');
    const heading = document.getElementById('heading');

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;


      heading.style.transform = `translate(-50%, calc(-50% - ${scrollY * .1}px))`;


      image.style.transform = `translate(-50%, calc(-50% - ${scrollY * -0.5}px))`;
      
      


      text.style.transform = `translate(-50%, calc(-50% - ${scrollY * 2.25}px))`;
    });






const icons = [
  
  { el: document.getElementById('icon1'), speed: 0, rotationRate: 0.1 },
  { el: document.getElementById('icon2'), speed: 2.25, rotationRate: 0 },
  { el: document.getElementById('icon3'), speed: 2, rotationRate: 0 },
  { el: document.getElementById('icon4'), speed: 0.5, rotationRate: 0.6 },
  { el: document.getElementById('icon5'), speed: 0.8, rotationRate: 0.4 },
];

let latestScroll = 0;

function updateParallax() {
  const scrollY = latestScroll;

  icons.forEach(({ el, speed, rotationRate }) => {
    const translateY = scrollY * speed;
    const rotation = scrollY * rotationRate; // Degrees

    el.style.transform = `translate(-50%, calc(-50% - ${translateY}px)) rotate(${rotation}deg)`;
  });

  requestAnimationFrame(updateParallax);
}

window.addEventListener('scroll', () => {
  latestScroll = window.scrollY;
});

requestAnimationFrame(updateParallax);
