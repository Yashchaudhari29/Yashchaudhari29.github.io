document.addEventListener("DOMContentLoaded", function() {
    // Hide preloader after 2 seconds (2000 milliseconds)
    setTimeout(function() {
      document.getElementById('preloader').classList.add('loaded');
      document.getElementById('content').style.display = 'block'; // Show content
    }, 2500);
  });
  