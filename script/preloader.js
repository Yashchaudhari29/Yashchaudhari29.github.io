document.addEventListener("DOMContentLoaded", function() {
  // Hide content initially
  const content = document.getElementById('content');
  const preloader = document.getElementById('preloader');
  
  if (content && preloader) {
      content.style.display = 'none';
  } else {
      console.error('Preloader or content element not found!');
      return;
  }

  // Minimum display time for preloader (e.g., 1 second)
  const minDisplayTime = 2300; // 2.3 second
  const startTime = Date.now();

  // Function to check if all resources are loaded
  const checkIfLoaded = () => {
      if (document.readyState === 'complete') {
          const currentTime = Date.now();
          const elapsedTime = currentTime - startTime;

          if (elapsedTime >= minDisplayTime) {
              preloader.classList.add('loaded');
              content.style.display = 'block'; // Show content
          } else {
              // Wait until minimum display time has passed
              setTimeout(checkIfLoaded, minDisplayTime - elapsedTime);
          }
      } else {
          setTimeout(checkIfLoaded, 100); // Check again after 100ms
      }
  };

  // Start checking if resources are loaded after minimum display time
  setTimeout(checkIfLoaded, minDisplayTime);

  // Fallback to window.onload in case of older browsers
  window.onload = function() {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;

      if (elapsedTime >= minDisplayTime) {
          preloader.classList.add('loaded');
          content.style.display = 'block'; // Show content
      } else {
          setTimeout(() => {
              preloader.classList.add('loaded');
              content.style.display = 'block'; // Show content
          }, minDisplayTime - elapsedTime);
      }
  };
});
