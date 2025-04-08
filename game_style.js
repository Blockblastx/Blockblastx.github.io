// Optimized Visual Enhancements for Block Blast Game
(function() {
    'use strict';
    
    // Main class to manage all visual effects
    class VisualEffectsManager {
        constructor() {
            this.isMobile = window.innerWidth < 768;
            this.particlePool = [];
            this.particleIndex = 0;
            this.scorePopupPool = [];
            this.comboMessagePool = [];
            
            // Initialize
            this.initParticlePool();
            this.setupGameOverEnhancements();
            this.setupKeyboardControls();
            this.enhanceScoreUpdates();
            this.enhanceLineClearingLogic();
            
            // Expose methods to window
            window.createEnhancedParticles = this.createEnhancedParticles.bind(this);
            window.enhancedLineClearing = this.enhancedLineClearing.bind(this);
        }
        
        // Initialize particle system
        initParticlePool() {
            const POOL_SIZE = this.isMobile ? 50 : 100;
            
            // Create particle style
            const styleElement = document.createElement('style');
            styleElement.id = 'particle-effects-style';
            styleElement.textContent = `
                .particle {
                    position: absolute;
                    pointer-events: none;
                    z-index: 999;
                    will-change: transform, opacity;
                }
                
                .particle-circle {
                    border-radius: 50%;
                }
                
                .particle-square {
                    border-radius: 2px;
                }
                
                .particle-triangle {
                    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
                }
                
                .particle-star {
                    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
                }
                
                .score-popup {
                    position: absolute;
                    color: white;
                    font-weight: bold;
                    pointer-events: none;
                    text-shadow: 0 0 4px rgba(0,0,0,0.5);
                    z-index: 1000;
                    font-size: 18px;
                    will-change: transform, opacity;
                }
                
                .combo-message {
                    position: absolute;
                    color: white;
                    font-weight: bold;
                    font-size: 28px;
                    text-align: center;
                    pointer-events: none;
                    text-shadow: 0 0 10px #FF9500, 0 0 20px rgba(255,255,255,0.7);
                    z-index: 1500;
                    will-change: transform, opacity;
                    transform: translate(-50%, -50%);
                }
                
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
                    40%, 60% { transform: translate3d(3px, 0, 0); }
                }
                
                .flash-effect {
                    animation: flash 0.3s ease-out;
                }
                
                @keyframes flash {
                    0% { filter: brightness(1); }
                    50% { filter: brightness(1.5); }
                    100% { filter: brightness(1); }
                }
                
                @media (prefers-reduced-motion: reduce) {
                    .particle, .score-popup, .combo-message {
                        display: none !important;
                    }
                    
                    .flash-effect {
                        animation: none !important;
                    }
                }
            `;
            
            document.head.appendChild(styleElement);
            
            // Create particles
            for (let i = 0; i < POOL_SIZE; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.display = 'none';
                document.body.appendChild(particle);
                this.particlePool.push(particle);
            }
        }
        
        // Get a particle from the pool
        getParticleFromPool() {
            const particle = this.particlePool[this.particleIndex];
            this.particleIndex = (this.particleIndex + 1) % this.particlePool.length;
            return particle;
        }
        
        // Get a score popup from pool or create new one
        getScorePopup() {
            if (this.scorePopupPool.length > 0) {
                return this.scorePopupPool.pop();
            }
            
            const popup = document.createElement('div');
            popup.className = 'score-popup';
            return popup;
        }
        
        // Get a combo message from pool or create new one
        getComboMessage() {
            if (this.comboMessagePool.length > 0) {
                return this.comboMessagePool.pop();
            }
            
            const message = document.createElement('div');
            message.className = 'combo-message';
            return message;
        }
        
        // Create particles with optimized rendering
        createParticles(x, y, color, count = 8) {
            // Skip if off-screen
            if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) {
                return;
            }
            
            // Limit particles on mobile
            const actualCount = this.isMobile ? Math.ceil(count / 2) : count;
            
            for (let i = 0; i < actualCount; i++) {
                const particle = this.getParticleFromPool();
                
                // Configure particle
                const size = Math.random() * 3 + 2;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.backgroundColor = color;
                particle.style.left = `${x}px`;
                particle.style.top = `${y}px`;
                particle.style.display = 'block';
                
                // Animation parameters
                const angle = Math.random() * Math.PI * 2;
                const distance = 20 + Math.random() * 30;
                const duration = 300 + Math.random() * 300;
                
                // Use requestAnimationFrame for smoother animation
                let start = null;
                
                const animateParticle = (timestamp) => {
                    if (!start) start = timestamp;
                    const progress = (timestamp - start) / duration;
                    
                    if (progress < 1) {
                        const easeOut = 1 - Math.pow(1 - progress, 2);
                        const translateX = Math.cos(angle) * distance * easeOut;
                        const translateY = Math.sin(angle) * distance * easeOut;
                        const scale = 1 - easeOut;
                        const opacity = 0.8 * (1 - easeOut);
                        
                        particle.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
                        particle.style.opacity = opacity;
                        
                        requestAnimationFrame(animateParticle);
                    } else {
                        // Reset particle for reuse
                        particle.style.display = 'none';
                        particle.style.transform = 'none';
                        particle.style.opacity = '0';
                    }
                };
                
                requestAnimationFrame(animateParticle);
            }
        }
        
        // Create enhanced particles with more variety
        createEnhancedParticles(x, y, color, count = 15) {
            // Skip if off-screen
            if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) {
                return;
            }
            
            // Limit particles on mobile
            const actualCount = this.isMobile ? Math.min(count, 5) : count;
            
            const shapes = ['circle', 'square', 'triangle', 'star'];
            
            for (let i = 0; i < actualCount; i++) {
                // Get particle from pool
                const particle = this.getParticleFromPool();
                
                // Randomly choose particle shape
                const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
                particle.className = `particle particle-${shapeType}`;
                
                // Vary the particle size
                const size = Math.random() * 6 + 3;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                
                // Parse color components and add variation
                let r = 255, g = 255, b = 255;
                if (color.startsWith('rgb')) {
                    const rgbValues = color.match(/\d+/g);
                    if (rgbValues && rgbValues.length >= 3) {
                        r = parseInt(rgbValues[0]);
                        g = parseInt(rgbValues[1]);
                        b = parseInt(rgbValues[2]);
                    }
                }
                
                // Add slight color variation
                const colorVariation = 30;
                const newR = Math.max(0, Math.min(255, r + (Math.random() * colorVariation * 2 - colorVariation)));
                const newG = Math.max(0, Math.min(255, g + (Math.random() * colorVariation * 2 - colorVariation)));
                const newB = Math.max(0, Math.min(255, b + (Math.random() * colorVariation * 2 - colorVariation)));
                
                particle.style.backgroundColor = `rgb(${newR}, ${newG}, ${newB})`;
                particle.style.display = 'block';
                
                // Set initial position
                particle.style.left = `${x}px`;
                particle.style.top = `${y}px`;
                
                // Animation parameters
                const angle = Math.random() * Math.PI * 2;
                const distance = 30 + Math.random() * 50;
                const duration = 500 + Math.random() * 500;
                const rotation = Math.random() * 360;
                const animationType = Math.floor(Math.random() * 3);
                
                // Use requestAnimationFrame for smoother animation
                let start = null;
                
                const animateParticle = (timestamp) => {
                    if (!start) start = timestamp;
                    const progress = (timestamp - start) / duration;
                    
                    if (progress < 1) {
                        let translateX, translateY, scale, rotate, opacity;
                        
                        if (animationType === 0) {
                            // Straight path
                            translateX = Math.cos(angle) * distance * progress;
                            translateY = Math.sin(angle) * distance * progress;
                            scale = 1 - progress;
                            rotate = rotation * progress;
                            opacity = 0.8 * (1 - progress);
                        } else if (animationType === 1) {
                            // Arc path
                            const arcProgress = progress < 0.5 ? progress * 2 : 0.5 + (progress - 0.5) * 2;
                            translateX = Math.cos(angle) * distance * arcProgress;
                            translateY = Math.sin(angle) * distance * arcProgress - (Math.sin(progress * Math.PI) * 20);
                            scale = 1 - progress;
                            rotate = rotation * progress;
                            opacity = 0.8 * (1 - progress);
                        } else {
                            // Bounce path
                            const bounceProgress = Math.abs(Math.sin(progress * Math.PI * 2));
                            translateX = Math.cos(angle) * distance * progress;
                            translateY = Math.sin(angle) * distance * progress - (bounceProgress * 10);
                            scale = (1 - progress) * (0.8 + bounceProgress * 0.4);
                            rotate = rotation * progress;
                            opacity = 0.8 * (1 - progress * 0.7);
                        }
                        
                        particle.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotate}deg)`;
                        particle.style.opacity = opacity;
                        
                        requestAnimationFrame(animateParticle);
                    } else {
                        // Reset particle for reuse
                        particle.style.display = 'none';
                        particle.style.transform = 'none';
                        particle.style.opacity = '0';
                    }
                };
                
                requestAnimationFrame(animateParticle);
            }
        }
        
        // Create score popup with improved animation
        createScorePopup(score, x, y) {
            // Get popup from pool
            const popup = this.getScorePopup();
            popup.textContent = `+${score}`;
            
            // Position the popup
            popup.style.left = `${x}px`;
            popup.style.top = `${y}px`;
            popup.style.display = 'block';
            
            document.body.appendChild(popup);
            
            // Use requestAnimationFrame for smoother animation
            let start = null;
            const duration = 800;
            
            const animatePopup = (timestamp) => {
                if (!start) start = timestamp;
                const progress = (timestamp - start) / duration;
                
                if (progress < 1) {
                    const translateY = -20 * progress;
                    const opacity = progress < 0.2 ? progress * 5 : 1 - ((progress - 0.2) * 1.25);
                    
                    popup.style.transform = `translateY(${translateY}px)`;
                    popup.style.opacity = opacity;
                    
                    requestAnimationFrame(animatePopup);
                } else {
                    // Return to pool for reuse
                    document.body.removeChild(popup);
                    popup.style.display = 'none';
                    popup.style.transform = 'none';
                    popup.style.opacity = '0';
                    this.scorePopupPool.push(popup);
                }
            };
            
            requestAnimationFrame(animatePopup);
        }
        
        // Enhanced line clearing effects
        enhancedLineClearing(completedRows, completedCols) {
            // Flash effect for the grid
            const gridElement = document.querySelector('.grid-container');
            if (gridElement) {
                gridElement.classList.add('flash-effect');
                setTimeout(() => gridElement.classList.remove('flash-effect'), 300);
            }
            
            // Throttle effects on mobile
            if (this.isMobile) return;
            
            // Screen shake effect (stronger for multiple lines)
            const intensity = Math.min(3, (completedRows.length + completedCols.length));
            if (intensity > 0) {
                document.body.style.animation = `shake ${0.3}s cubic-bezier(.36,.07,.19,.97)`;
                document.body.style.animationIterationCount = '1';
                setTimeout(() => document.body.style.animation = '', 300);
            }
            
            // Display special text for multiple lines
            const totalLines = completedRows.length + completedCols.length;
            if (totalLines > 1) {
                const messages = ["Double!", "Triple!", "Quad!", "Penta!", "Super Combo!"];
                const messageText = messages[Math.min(messages.length - 1, totalLines - 2)];
                
                // Get combo message from pool
                const comboMessage = this.getComboMessage();
                comboMessage.textContent = messageText;
                
                // Position the message
                if (gridElement) {
                    const rect = gridElement.getBoundingClientRect();
                    comboMessage.style.left = `${rect.left + rect.width / 2}px`;
                    comboMessage.style.top = `${rect.top + rect.height / 2}px`;
                }
                
                document.body.appendChild(comboMessage);
                
                setTimeout(() => {
                    document.body.removeChild(comboMessage);
                    this.comboMessagePool.push(comboMessage);
                }, 1000);
            }
        }
        
        // Enhanced score update function
        enhanceScoreUpdates() {
            // Store original updateScore
            const originalUpdateScore = window.updateScore;
            
            // Debounce variables
            let updateScoreDebounce = false;
            let updateScorePoints = 0;
            
            // Replace with enhanced version
            window.updateScore = (points) => {
                // Debounce rapid score updates
                if (updateScoreDebounce) {
                    updateScorePoints += points;
                    return;
                }
                
                updateScoreDebounce = true;
                setTimeout(() => {
                    updateScoreDebounce = false;
                    if (updateScorePoints > 0) {
                        const totalPoints = updateScorePoints;
                        updateScorePoints = 0;
                        
                        // Call original function
                        if (originalUpdateScore) {
                            originalUpdateScore(totalPoints);
                        } else {
                            // Fallback if original function is missing
                            window.score = (window.score || 0) + totalPoints;
                            const scoreElement = document.getElementById('current-score');
                            if (scoreElement) {
                                scoreElement.textContent = window.score;
                            }
                            
                            // Update high score if needed
                            if (window.score > (window.highScore || 0)) {
                                window.highScore = window.score;
                                const highScoreElement = document.getElementById('high-score');
                                if (highScoreElement) {
                                    highScoreElement.textContent = window.highScore;
                                }
                                try {
                                    localStorage.setItem('blockBlastHighScore', window.highScore);
                                } catch (e) {
                                    console.log('localStorage not available');
                                }
                            }
                        }
                        
                        // Add subtle score popup
                        const scoreElement = document.getElementById('current-score');
                        if (scoreElement && totalPoints > 0) {
                            const rect = scoreElement.getBoundingClientRect();
                            this.createScorePopup(totalPoints, rect.right, rect.top);
                        }
                    }
                }, 50);
            };
        }
        
        // Enhance the line clearing detection
        enhanceLineClearingLogic() {
            // Store original check function
            const originalCheckForCompletedLines = window.checkForCompletedLines;
            
            // Replace with enhanced version
            window.checkForCompletedLines = () => {
                // Call the original function first
                const result = originalCheckForCompletedLines ? originalCheckForCompletedLines() : 0;
                
                // If no lines were completed, return early
                if (!result) return 0;
                
                // Create particles only for visible cells
                const visibleCells = Array.from(document.querySelectorAll('.cell.clearing')).filter(cell => {
                    const rect = cell.getBoundingClientRect();
                    return rect.top < window.innerHeight && 
                           rect.bottom > 0 && 
                           rect.left < window.innerWidth && 
                           rect.right > 0;
                });
                
                // Limit particles for performance
                const cellsToAnimate = visibleCells.length <= 50 ? 
                                      visibleCells : 
                                      visibleCells.filter((_, index) => index % Math.ceil(visibleCells.length / 50) === 0);
                
                cellsToAnimate.forEach(cell => {
                    const rect = cell.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    
                    // Get cell color
                    const computedStyle = window.getComputedStyle(cell);
                    const bgcolor = computedStyle.backgroundColor;
                    
                    // Create particles with limited count
                    this.createParticles(centerX, centerY, bgcolor, 6);
                });
                
                return result;
            };
        }
        
        // Setup keyboard controls for accessibility
        setupKeyboardControls() {
            document.addEventListener('keydown', (e) => {
                if (window.gameOver) return;
                
                // Rotate blocks with R key
                if (e.key === 'r' || e.key === 'R') {
                    if (typeof window.rotateCurrentBlock === 'function') {
                        window.rotateCurrentBlock();
                    }
                }
                
                // Tab between available blocks
                if (e.key === 'Tab') {
                    e.preventDefault();
                    if (typeof window.selectNextBlock === 'function') {
                        window.selectNextBlock();
                    }
                }
            });
        }
        
        // Setup game over screen enhancements
        setupGameOverEnhancements() {
            const gameOverElement = document.getElementById('game-over');
            if (!gameOverElement) return;
            
            // Watch for game over becoming visible
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'style' && 
                        gameOverElement.style.visibility === 'visible') {
                        this.enhanceGameOverScreen();
                    }
                });
            });
            
            observer.observe(gameOverElement, { attributes: true });
            
            // Enhanced show game over function
            window.enhancedShowGameOver = () => {
                // Clear any lingering particles first
                this.particlePool.forEach(particle => {
                    if (particle.style.display !== 'none') {
                        particle.style.display = 'none';
                    }
                });
                
                // Show game over with standard method
                if (typeof window.showGameOverWithEffect === 'function') {
                    window.showGameOverWithEffect();
                } else if (gameOverElement) {
                    gameOverElement.style.visibility = 'visible';
                }
            };
        }
        
        // Enhance game over screen with stats
        enhanceGameOverScreen() {
            const gameOverElement = document.getElementById('game-over');
            if (!gameOverElement) return;
            
            // Add final score if not already present
            if (!gameOverElement.querySelector('.final-score')) {
                const finalScore = document.createElement('div');
                finalScore.className = 'final-score';
                finalScore.style.fontSize = '24px';
                finalScore.style.marginBottom = '20px';
                finalScore.textContent = `Final Score: ${window.score || 0}`;
                
                // Add additional stats if needed
                const stats = document.createElement('div');
                stats.className = 'stats';
                stats.style.fontSize = '16px';
                stats.style.marginBottom = '20px';
                stats.style.textAlign = 'center';
                
                // Insert before restart button
                const restartButton = gameOverElement.querySelector('.restart-button');
                if (restartButton) {
                    gameOverElement.insertBefore(finalScore, restartButton);
                    gameOverElement.insertBefore(stats, restartButton);
                }
            }
        }
    }
    
    // Initialize when DOM is loaded
    const initEffects = () => {
        // Create effects manager
        const effectsManager = new VisualEffectsManager();
        
        // Store manager instance for debugging
        window.effectsManager = effectsManager;
    };
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEffects);
    } else {
        initEffects();
    }
})();