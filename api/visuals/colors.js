// Function to randomize an array (Fisher-Yates algorithm).
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements.
  }
};

// Function to render the color boxes.
export const renderColorBoxes = (container) => {
  // Colors for the color boxes.
  const colors = [
    '#ff0000',
    '#dfe0df',
    '#ffffff',
    '#b8bdbb',
    '#c7cccb',
    '#939f9d',
    '#202221',
  ];

  // Shuffle the colors array.
  shuffleArray(colors);

  // Clear any previous boxes.
  container.innerHTML = '';

  // Render a color box for each color.
  colors.forEach(color => {
    const colorBox = document.createElement('div');
    colorBox.classList.add('color-box');
    colorBox.style.backgroundColor = color; // Set the background color.
    container.appendChild(colorBox); // Append the box to the container.
  });
};
