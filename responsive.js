// Responsive menu functionality for mobile devices
document.addEventListener('DOMContentLoaded', function() {
    // Create hamburger menu if it doesn't exist
    const topMenu = document.querySelector('.top-menu');
    if (!document.querySelector('.hamburger')) {
      const hamburger = document.createElement('div');
      hamburger.className = 'hamburger';
      hamburger.innerHTML = '☰';
      hamburger.setAttribute('aria-label', 'Toggle menu');
      hamburger.setAttribute('role', 'button');
      hamburger.setAttribute('tabindex', '0');
      topMenu.appendChild(hamburger);
    }
  
    // Get the hamburger menu
    const hamburger = document.querySelector('.hamburger');
    
    // Add click event for mobile menu toggle
    hamburger.addEventListener('click', function() {
      topMenu.classList.toggle('mobile-active');
      
      // Change hamburger icon
      if (topMenu.classList.contains('mobile-active')) {
        hamburger.innerHTML = '✕';
        hamburger.setAttribute('aria-expanded', 'true');
      } else {
        hamburger.innerHTML = '☰';
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!topMenu.contains(event.target) && topMenu.classList.contains('mobile-active')) {
        topMenu.classList.remove('mobile-active');
        hamburger.innerHTML = '☰';
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
    
    // Keyboard accessibility
    hamburger.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        hamburger.click();
      }
    });
    
    // Handle window resize
    const handleResize = () => {
      if (window.innerWidth > 480 && topMenu.classList.contains('mobile-active')) {
        topMenu.classList.remove('mobile-active');
        hamburger.innerHTML = '☰';
        hamburger.setAttribute('aria-expanded', 'false');
      }
      
      // Adjust game elements based on screen size and orientation
      adjustGameElements();
    };
    
    // Function to adjust game elements based on current screen dimensions
    function adjustGameElements() {
      const gameContainer = document.querySelector('.game-container');
      const gridContainer = document.querySelector('.grid-container');
      const grid = document.querySelector('.grid');
      const blocksContainer = document.querySelector('#blocks-container');
      
      if (!gridContainer || !grid) return; // Exit if game elements aren't loaded yet
      
      // Check if we're in landscape on a small device
      const isSmallLandscape = window.innerHeight < 500 && window.innerWidth > window.innerHeight;
      
      if (isSmallLandscape) {
        gameContainer.classList.add('landscape-layout');
      } else {
        gameContainer.classList.remove('landscape-layout');
      }
      
      // Adjust block size based on grid size
      const cellSize = grid.offsetWidth / 8; // 8x8 grid
      
      // Update CSS variable for cell size if needed
      document.documentElement.style.setProperty('--cell-size', `${cellSize}px`);
      
      // For mobile, ensure blocks are properly positioned
      if (window.innerWidth <= 480) {
        const blocks = document.querySelectorAll('.block');
        blocks.forEach(block => {
          if (block.style.transform) {
            // Reset any absolute positioning that might be causing overflow
            block.style.position = '';
            block.style.left = '';
            block.style.top = '';
          }
        });
      }
    }
    
    window.addEventListener('resize', handleResize);
    
    // Initial call to set up the layout
    handleResize();
  });