// Game Over Wave Effect
// Add this to your game_style.js or to the end of your script.js file

// Wave Effect with Random Colors
function gameOverWaveEffect(onEffectComplete) {
    const gridElement = document.getElementById('grid');
    if (!gridElement) {
        if (typeof onEffectComplete === 'function') {
            onEffectComplete();
        }
        return;
    }
    
    const cells = Array.from(gridElement.children);
    // Find empty cells (ones that don't have a color class)
    const emptyCells = cells.filter(cell => !cell.className.includes('-cell') || cell.className === 'cell');
    
    // List of vibrant colors to use
    const colors = [
        '#FF5252', // Red
        '#FF4081', // Pink
        '#E040FB', // Purple
        '#7C4DFF', // Deep Purple
        '#536DFE', // Indigo
        '#448AFF', // Blue
        '#40C4FF', // Light Blue
        '#18FFFF', // Cyan
        '#64FFDA', // Teal
        '#69F0AE', // Green
        '#B2FF59', // Light Green
        '#EEFF41', // Lime
        '#FFFF00', // Yellow
        '#FFD740', // Amber
        '#FFAB40', // Orange
        '#FF6E40'  // Deep Orange
    ];
    
    // Wave pattern - animate cells in rings from center
    const centerX = Math.floor(GRID_SIZE / 2);
    const centerY = Math.floor(GRID_SIZE / 2);
    
    // Calculate distance of each cell from center
    const cellsWithDistance = emptyCells.map(cell => {
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        return { cell, distance };
    });
    
    // Sort by distance
    cellsWithDistance.sort((a, b) => a.distance - b.distance);
    
    // If no empty cells, just call the callback
    if (cellsWithDistance.length === 0) {
        if (typeof onEffectComplete === 'function') {
            onEffectComplete();
        }
        return;
    }
    
    // Animate in waves
    cellsWithDistance.forEach((item, index) => {
        setTimeout(() => {
            // Pick a random color
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // Create a div for the animation
            const overlay = document.createElement('div');
            overlay.className = 'cell-overlay';
            overlay.style.backgroundColor = color;
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.borderRadius = '3px';
            overlay.style.transform = 'scale(0)';
            overlay.style.opacity = '0';
            
            // Position relative for absolute positioning of overlay
            item.cell.style.position = 'relative';
            item.cell.style.overflow = 'hidden';
            
            // Add overlay to cell
            item.cell.appendChild(overlay);
            
            // Animate with a pop effect
            requestAnimationFrame(() => {
                overlay.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
                overlay.style.transform = 'scale(1)';
                overlay.style.opacity = '1';
            });
        }, item.distance * 100); // Delay based on distance from center
    });
    
    // After all cells are filled, add final flash effect
    const maxDelay = Math.max(...cellsWithDistance.map(item => item.distance)) * 100 + 300;
    setTimeout(() => {
        // Add a flash effect to the entire grid
        const flash = document.createElement('div');
        flash.className = 'grid-flash';
        flash.style.position = 'absolute';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = 'white';
        flash.style.opacity = '0';
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '100';
        
        gridElement.style.position = 'relative';
        gridElement.appendChild(flash);
        
        // Flash animation
        requestAnimationFrame(() => {
            flash.style.transition = 'opacity 0.3s ease-out';
            flash.style.opacity = '0.7';
            
            setTimeout(() => {
                flash.style.opacity = '0';
                setTimeout(() => {
                    if (gridElement.contains(flash)) {
                        gridElement.removeChild(flash);
                    }
                    
                    // Call the callback after the effect is complete
                    if (typeof onEffectComplete === 'function') {
                        onEffectComplete();
                    }
                }, 300);
            }, 200);
        });
    }, maxDelay > 0 ? maxDelay : 500);
}

// Add CSS styles for the effects
function addGameOverEffectStyles() {
    // Check if styles already exist
    if (document.getElementById('game-over-effect-styles')) {
        return;
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = 'game-over-effect-styles';
    styleElement.textContent = `
        @keyframes pop-in {
            0% { transform: scale(0); opacity: 0; }
            60% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        .cell-overlay {
            animation: pop-in 0.3s forwards;
        }
        
        @keyframes flash {
            0% { opacity: 0; }
            50% { opacity: 0.7; }
            100% { opacity: 0; }
        }
        
        .grid-flash {
            animation: flash 0.5s forwards;
        }
        
        @media (prefers-reduced-motion: reduce) {
            .cell-overlay, .grid-flash {
                transition: none !important;
                animation: none !important;
            }
        }
    `;
    document.head.appendChild(styleElement);
}

// Show game over with effect
function showGameOverWithEffect() {
    // Add styles if they don't exist
    addGameOverEffectStyles();
    
    // Run the wave effect, then show the game over screen
    gameOverWaveEffect(() => {
        // Show game over screen after effect completes
        const gameOverElement = document.getElementById('game-over');
        if (gameOverElement) {
            gameOverElement.style.visibility = 'visible';
        }
    });
}

// Cleanup function to remove effect elements
function cleanupGameOverEffects() {
    // Remove any cell overlays
    document.querySelectorAll('.cell-overlay').forEach(overlay => {
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    });
    
    // Remove any grid flashes
    document.querySelectorAll('.grid-flash').forEach(flash => {
        if (flash.parentNode) {
            flash.parentNode.removeChild(flash);
        }
    });
    
    // Reset cell styles
    document.querySelectorAll('.cell').forEach(cell => {
        cell.style.position = '';
        cell.style.overflow = '';
    });
}

// Integrate with game over detection
// Add this inside your game logic where you detect game over
// For example, replace code like this:
//   gameOverElement.style.visibility = 'visible';
// With:
//   showGameOverWithEffect();

// Export functions to window
window.showGameOverWithEffect = showGameOverWithEffect;
window.cleanupGameOverEffects = cleanupGameOverEffects;