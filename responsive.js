/**
 * responsive.js - Responsive functionality for Block Blast game
 * Handles mobile menu, orientation changes, and responsive game layout
 */

document.addEventListener('DOMContentLoaded', function() {
    // === Variables ===
    const grid = document.getElementById('grid');
    const blocksContainer = document.getElementById('blocks-container');
    const gameContainer = document.querySelector('.game-container');
    const menuLinks = document.querySelector('.menu-links');
    const topMenu = document.querySelector('.top-menu');
    
    // Create hamburger menu button if it doesn't exist
    if (!document.querySelector('.hamburger')) {
        const hamburger = document.createElement('div');
        hamburger.className = 'hamburger';
        hamburger.setAttribute('aria-label', 'Toggle menu');
        hamburger.setAttribute('role', 'button');
        hamburger.setAttribute('tabindex', '0');
        hamburger.innerHTML = '☰';
        topMenu.appendChild(hamburger);
        
        // Mobile menu toggle
        hamburger.addEventListener('click', function() {
            menuLinks.classList.toggle('active');
            this.innerHTML = menuLinks.classList.contains('active') ? '✕' : '☰';
            
            // Accessibility
            if (menuLinks.classList.contains('active')) {
                hamburger.setAttribute('aria-expanded', 'true');
                menuLinks.setAttribute('aria-hidden', 'false');
            } else {
                hamburger.setAttribute('aria-expanded', 'false');
                menuLinks.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (menuLinks.classList.contains('active') && 
                !menuLinks.contains(event.target) && 
                !hamburger.contains(event.target)) {
                menuLinks.classList.remove('active');
                hamburger.innerHTML = '☰';
                hamburger.setAttribute('aria-expanded', 'false');
                menuLinks.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Keyboard support for hamburger menu
        hamburger.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                hamburger.click();
            }
        });
    }
    
    // === Functions ===
    
    /**
     * Calculate and set the appropriate grid cell size based on screen dimensions
     */
    function updateGridCellSize() {
        if (!grid) return;
        
        // Get grid dimensions
        const gridWidth = grid.offsetWidth;
        const cellSize = (gridWidth - 21) / 8; // 7 gaps of 3px each
        
        // Set up grid
        const cells = grid.querySelectorAll('.cell');
        cells.forEach(cell => {
            // Apply size only if we're not using CSS grid positioning
            if (window.getComputedStyle(cell).position !== 'absolute') {
                cell.style.width = cellSize + 'px';
                cell.style.height = cellSize + 'px';
            }
        });
    }
    
    /**
     * Adjust the layout based on screen size
     */
    function adjustLayout() {
        // Check if we're on mobile
        const isMobile = window.innerWidth < 768;
        const isLandscape = window.innerWidth > window.innerHeight;
        
        // Layout adjustments based on screen size
        if (isMobile) {
            // Mobile layout adjustments
            if (isLandscape && window.innerHeight < 500) {
                // Special case for landscape phones with small height
                document.body.classList.add('landscape-mobile');
            } else {
                document.body.classList.remove('landscape-mobile');
            }
        } else {
            // Desktop layout adjustments
            document.body.classList.remove('landscape-mobile');
        }
        
        // Update grid cell sizes
        updateGridCellSize();
        
        // Adjust padding to ensure game is visible
        const topMenuHeight = topMenu.offsetHeight;
        gameContainer.style.paddingTop = (topMenuHeight + 10) + 'px';
    }
    
    /**
     * Handles device orientation changes
     */
    function handleOrientationChange() {
        // Minor delay to allow browser to complete rotation
        setTimeout(adjustLayout, 100);
    }
    
    /**
     * Adjust touch targets for mobile devices
     */
    function enhanceTouchTargets() {
        // Check if device is touch-enabled
        const isTouchDevice = ('ontouchstart' in window) || 
                             (navigator.maxTouchPoints > 0) || 
                             (navigator.msMaxTouchPoints > 0);
        
        if (isTouchDevice) {
            document.body.classList.add('touch-device');
            
            // Make sure blocks can be dragged on touch devices
            const blocks = document.querySelectorAll('.block');
            blocks.forEach(block => {
                // Ensure touch events are properly handled
                block.addEventListener('touchstart', function(e) {
                    // Prevent scrolling when interacting with blocks
                    e.preventDefault();
                    
                    // Your game's existing touch handler can handle the rest
                    // This just ensures the event gets recognized properly
                }, { passive: false });
            });
        }
    }
    
    /**
     * Initialize responsive functionality
     */
    function initResponsive() {
        // Set initial layout
        adjustLayout();
        enhanceTouchTargets();
        
        // Add event listeners
        window.addEventListener('resize', adjustLayout);
        window.addEventListener('orientationchange', handleOrientationChange);
        
        // Load responsive CSS dynamically
        const responsiveCSS = document.createElement('link');
        responsiveCSS.rel = 'stylesheet';
        responsiveCSS.href = 'responsive.css';
        document.head.appendChild(responsiveCSS);
    }
    
    // Initialize after a short delay to ensure DOM is fully loaded
    setTimeout(initResponsive, 100);
    
    // Handle loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        // Hide loading screen after page is fully loaded
        window.addEventListener('load', function() {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        });
    }
});

// Additional utility functions for responsive gameplay

/**
 * Detects if the device has a small screen
 * @returns {boolean} True if the device has a small screen
 */
function isSmallScreen() {
    return window.innerWidth < 768;
}

/**
 * Adjusts game difficulty based on screen size
 * @returns {number} Difficulty multiplier (lower for small screens)
 */
function getScreenSizeMultiplier() {
    // Make game slightly easier on smaller screens where precision is harder
    if (window.innerWidth < 480) return 0.85;
    if (window.innerWidth < 768) return 0.92;
    return 1.0;
}

/**
 * Saves user's preferred orientation
 * @param {string} orientation - 'portrait' or 'landscape'
 */
function savePreferredOrientation(orientation) {
    try {
        localStorage.setItem('preferredOrientation', orientation);
    } catch (e) {
        console.warn('Could not save orientation preference');
    }
}

/**
 * Gets user's preferred orientation
 * @returns {string|null} 'portrait', 'landscape', or null if not set
 */
function getPreferredOrientation() {
    try {
        return localStorage.getItem('preferredOrientation');
    } catch (e) {
        return null;
    }
}