export const downloadPngButtons = (listItem, item) => {
  const downloadBtn = listItem.querySelector('.download-btn');
  const removeBgBtn = listItem.querySelector('.remove-bg-btn');
  const whiteTextBtn = listItem.querySelector('.white-text-btn');
  const bgAndWhiteTextBtn = listItem.querySelector('.bg-and-white-text-btn');
  
  const bgAndBlackTitleBlackTextBtn = listItem.querySelector('.bg-black-title-black-text-btn');
  const bgAndBlackTitleWhiteTextBtn = listItem.querySelector('.bg-black-title-white-text-btn');
  const noBgAndBlackTitleBlackTextBtn = listItem.querySelector('.no-bg-black-title-black-text-btn');
  const noBgAndBlackTitleWhiteTextBtn = listItem.querySelector('.no-bg-black-title-white-text-btn');

  const trackItem = listItem.querySelector('.track-item'); // Main container
  const trackName = listItem.querySelector('.title'); // Main container
  const paragraphs = trackItem.querySelectorAll('p'); // Paragraphs or other child elements
  const colorContainer = trackItem.querySelector('.color-container');

  const buttons = [downloadBtn, removeBgBtn, whiteTextBtn, bgAndWhiteTextBtn, bgAndBlackTitleBlackTextBtn, bgAndBlackTitleWhiteTextBtn, noBgAndBlackTitleBlackTextBtn, noBgAndBlackTitleWhiteTextBtn];

  // Reusable function to reset styles
  const resetStyles = () => {
    trackItem.style.border = '1px dashed #888';
    colorContainer.style.display = 'block';
    paragraphs.forEach(p => (p.style.filter = '')); // Reset blur value
  };

  const downloadImage = async (trackItem, excludeButtons, fileName, additionalReset = () => {}) => {
    // Temporarily adjust styles (all button options)
    // paragraphs.forEach(p => (p.style.filter = 'blur(2px)'));
    colorContainer.style.display = 'none';
    trackItem.style.border = '0px dashed #888';

    try {
      // Capture the container as PNG
      const dataUrl = await domtoimage.toPng(trackItem, {
        filter: node => !excludeButtons.includes(node),
        width: 1280,
        height: 720,
        // style: {
        //   transform: 'scale(1)',
        //   transformOrigin: 'center',
        // },
      });

      // Trigger the download
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      link.click();
    } catch (error) {
      console.error('Error capturing PNG:', error);
    } finally {
      // Restore the original styles
      additionalReset();
      resetStyles();
    }
  };

  // Download with no background
  if (removeBgBtn) {
    removeBgBtn.addEventListener('click', async () => {
      const originalBackgroundImage = trackItem.style.backgroundImage;
      trackItem.style.backgroundImage = 'none';

      await downloadImage(
        trackItem, buttons,
        `api_cat_track_${item.id}_no_bg.png`,
        () => {
          trackItem.style.backgroundImage = originalBackgroundImage;
        }
      );
    });
  }

  // Download with no background and white text
  if (whiteTextBtn) {
    whiteTextBtn.addEventListener('click', async () => {
      const originalBackgroundImage = trackItem.style.backgroundImage;
      trackItem.style.backgroundImage = 'none';
      trackItem.style.color = 'white';

      await downloadImage(
        trackItem, buttons,
        `electroComposer-api_cat_track_${item.id}_white_text_no_bg.png`,
        () => {
          trackItem.style.backgroundImage = originalBackgroundImage;
          trackItem.style.color = '';
        }
      );
    });
  }

  // Download with white text
  if (bgAndWhiteTextBtn) {
    bgAndWhiteTextBtn.addEventListener('click', async () => {
      trackItem.style.color = 'white';

      await downloadImage(
        trackItem, buttons,
        `electroComposer-api_cat_track_${item.id}_white_text.png`,
        () => {
          trackItem.style.color = '';
        }
      );
    });
  }
  
  // Download with black title and black text
if (bgAndBlackTitleBlackTextBtn) {
  bgAndBlackTitleBlackTextBtn.addEventListener('click', async () => {
    const originalTrackNameColor = trackName.style.color;

    trackName.style.color = '#282a27'; // Set title to black

    await downloadImage(
      trackItem, buttons,
      `electroComposer-api_cat_track_${item.id}_black_title_black_text.png`,
      () => {
        trackName.style.color = originalTrackNameColor;
      }
    );
  });
}

// Download with black title and white text
if (bgAndBlackTitleWhiteTextBtn) {
  bgAndBlackTitleWhiteTextBtn.addEventListener('click', async () => {
    const originalTrackNameColor = trackName.style.color;
    const originalTrackItemColor = trackItem.style.color;

    trackName.style.color = '#282a27'; // Set title to black
    trackItem.style.color = 'white'; // Set other text to white

    await downloadImage(
      trackItem, buttons,
      `electroComposer-api_cat_track_${item.id}_black_title_white_text.png`,
      () => {
        trackName.style.color = originalTrackNameColor;
        trackItem.style.color = originalTrackItemColor;
      }
    );
  });
}



// Download with no background and black title / black text
if (noBgAndBlackTitleBlackTextBtn) {
  noBgAndBlackTitleBlackTextBtn.addEventListener('click', async () => {
    const originalBackgroundImage = trackItem.style.backgroundImage;
    const originalTrackNameColor = trackName.style.color;

    // Apply the styles
    trackItem.style.backgroundImage = 'none'; // Remove background
    trackName.style.color = '#282a27'; // Set title to black

    await downloadImage(
      trackItem, buttons,
      `electroComposer-api_cat_track_${item.id}_no_bg_black_title_black_txt.png`,
      () => {
        // Restore original styles
        trackItem.style.backgroundImage = originalBackgroundImage;
        trackName.style.color = originalTrackNameColor;
      }
    );
  });
}

// Download with no background and black title / white text
if (noBgAndBlackTitleWhiteTextBtn) {
  noBgAndBlackTitleWhiteTextBtn.addEventListener('click', async () => {
    const originalBackgroundImage = trackItem.style.backgroundImage;
    const originalTrackNameColor = trackName.style.color;
    const originalTrackItemColor = trackItem.style.color;

    // Apply the styles
    trackItem.style.backgroundImage = 'none'; // Remove background
    trackName.style.color = '#282a27'; // Set title to black
    trackItem.style.color = 'white'; // Set other text to white

    await downloadImage(
      trackItem, buttons,
      `electroComposer-api_cat_track_${item.id}_no_bg_black_title_white_txt.png`,
      () => {
        // Restore original styles
        trackItem.style.backgroundImage = originalBackgroundImage;
        trackName.style.color = originalTrackNameColor;
        trackItem.style.color = originalTrackItemColor;
      }
    );
  });
}





  // Download as rendered
  if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
      await downloadImage(
        trackItem, buttons,
        `electroComposer-api_cat_track_${item.id}.png`
      );
    });
  }
};
