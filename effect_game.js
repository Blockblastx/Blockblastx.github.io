// Visual Enhancements for Block Blast - Optimized Version
// Consolidated visual effects with improved performance

(function() {
    'use strict';
    
    // Single style element for all visual enhancements
    const createStyleElement = () => {
        const styleElement = document.createElement('style');
        styleElement.id = 'visual-enhancements-style';
        
        styleElement.textContent = `
                 
            
            .block.dragging { animation: none !important; }
            
            /* Particle trails */
            .drag-particle {
                position: absolute;
                width: 6px;
                height: 6px;
                border-radius: 50%;
                opacity: 0;
                pointer-events: none;
                z-index: 1000;
                will-change: transform, opacity;
            }
            
            @keyframes particle-fade {
                0% { opacity: 0.7; transform: scale(1); }
                100% { opacity: 0; transform: scale(0); }
            }
            
        
            
            /* Grid highlighting */
            .highlight {
                background-color: rgba(255, 255, 255, 0.2) !important;
                box-shadow: inset 0 0 5px rgba(255, 255, 255, 0.5);
                transition: all 0.2s ease;
            }
            
            .invalid {
                background-color: rgba(255, 0, 0, 0.2) !important;
                box-shadow: inset 0 0 5px rgba(255, 0, 0, 0.5);
                transition: all 0.2s ease;
            }
            
           
            /* Block clearing animation */
            @keyframes enhanced-clear-animation {
                0% { transform: scale(1); opacity: 1; }
                20% { transform: scale(1.1); opacity: 0.9; }
                100% { transform: scale(0); opacity: 0; }
            }
            
            .clearing {
                animation: enhanced-clear-animation 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                z-index: 5;
            }
            
            /* Header glow effect */
            .score {
                text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                transition: text-shadow 0.3s ease;
            }
            
            .crown {
                filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.7));
                transition: filter 0.3s ease;
            }
            
            @keyframes score-change {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            
            .score-change {
                animation: score-change 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            
            /* Game over enhancements */
            #game-over {
                backdrop-filter: blur(5px);
                background-color: rgba(15, 23, 42, 0.8);
                transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            
            .game-over-text {
                font-size: 48px;
                text-shadow: 0 0 20px rgba(255, 255, 255, 0.7);
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { text-shadow: 0 0 20px rgba(255, 255, 255, 0.7); }
                50% { text-shadow: 0 0 30px rgba(255, 255, 255, 0.9); }
                100% { text-shadow: 0 0 20px rgba(255, 255, 255, 0.7); }
            }
            
            .restart-button {
                background: linear-gradient(135deg, #5588ff, #3366cc);
                border: none;
                padding: 15px 30px;
                font-size: 18px;
                border-radius: 8px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }
            
            .restart-button:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
                background: linear-gradient(135deg, #6699ff, #4477dd);
            }
            
            .restart-button:active {
                transform: translateY(1px);
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            }
            
            .final-score {
                font-size: 28px;
                margin-bottom: 20px;
                color: white;
                text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
            }
            
            /* Layout improvements */
            html, body {
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
                overflow: hidden;
            }
            
           
            
            .game-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px;
                box-sizing: border-box;
                position: relative;
                z-index: 1;
            }
            
            .grid-container {
                margin: 0 auto 30px auto;
            }
            
            
            
            /* Reduce animations for users who prefer reduced motion */
            @media (prefers-reduced-motion: reduce) {
                body, .block, .clearing, .score-change, .game-over-text {
                    animation: none !important;
                    transition: none !important;
                }
                
                .drag-particle, .cell-overlay, .grid-flash {
                    display: none !important;
                }
            }
        `;
        
        document.head.appendChild(styleElement);
    };
    
    // Create and manage particle pool
    class ParticleManager {
        constructor(poolSize = 50) {
            this.poolSize = poolSize;
            this.particlePool = [];
            this.particleIndex = 0;
            this.lastParticleTime = 0;
            this.PARTICLE_THROTTLE = 40; // ms between particles
            
            this.initPool();
        }
        
        initPool() {
            for (let i = 0; i < this.poolSize; i++) {
                const particle = document.createElement('div');
                particle.className = 'drag-particle';
                particle.style.display = 'none';
                document.body.appendChild(particle);
                this.particlePool.push(particle);
            }
        }
        
        getParticle() {
            const particle = this.particlePool[this.particleIndex];
            this.particleIndex = (this.particleIndex + 1) % this.poolSize;
            return particle;
        }
        
        getBlockColor(blockElement) {
            if (!blockElement) return '#ffffff';
            
            if (blockElement.classList.contains('yellow-block')) return '#ffce55';
            if (blockElement.classList.contains('purple-block')) return '#c778e5';
            if (blockElement.classList.contains('blue-block')) return '#5588ff';
            if (blockElement.classList.contains('green-block')) return '#4cd26a';
            if (blockElement.classList.contains('red-block')) return '#ff5555';
            
            return '#ffffff';
        }
        
        createParticle(x, y, color, duration = 600) {
            const particle = this.getParticle();
            
            particle.style.display = 'block';
            particle.style.backgroundColor = color;
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.transform = 'scale(1)';
            particle.style.opacity = '0.7';
            
            // Animate using CSS animation
            particle.style.animation = `particle-fade ${duration / 1000}s forwards`;
            
            // Reset particle after animation completes
            setTimeout(() => {
                particle.style.display = 'none';
                particle.style.animation = '';
            }, duration);
        }
        
        createParticleTrail(x, y, color) {
            const now = Date.now();
            if (now - this.lastParticleTime <= this.PARTICLE_THROTTLE) return;
            
            this.lastParticleTime = now;
            
            // Optimize for performance on low-end devices
            const particleCount = window.matchMedia('(max-width: 768px)').matches ? 1 : 3;
            
            for (let i = 0; i < particleCount; i++) {
                // Add some randomness to position
                const offsetX = (Math.random() - 0.5) * 10;
                const offsetY = (Math.random() - 0.5) * 10;
                this.createParticle(x + offsetX, y + offsetY, color);
            }
        }
    }
    


    // Score animation manager
    class ScoreAnimationManager {
        constructor() {
            this.originalUpdateScore = window.updateScore;
            this.setupScoreAnimation();
        }
        
        setupScoreAnimation() {
            if (typeof this.originalUpdateScore === 'function') {
                window.updateScore = (points) => {
                    // Call original function
                    this.originalUpdateScore(points);
                    
                    // Add animation
                    const scoreElement = document.getElementById('current-score');
                    if (scoreElement) {
                        scoreElement.classList.add('score-change');
                        setTimeout(() => {
                            scoreElement.classList.remove('score-change');
                        }, 300);
                    }
                };
            }
        }
    }
    
    
    // Core enhancement manager
    class VisualEnhancementManager {
        constructor() {
            this.particleManager = new ParticleManager();
            this.scoreAnimationManager = new ScoreAnimationManager();
            
            this.setupEventListeners();
            this.enhanceGameOverScreen();
        }
        
        setupEventListeners() {
            // Mouse move event for particle trails
            document.addEventListener('mousemove', (e) => {
                if (window.currentDrag && window.currentDrag.element) {
                    const color = this.particleManager.getBlockColor(window.currentDrag.originalElement);
                    this.particleManager.createParticleTrail(e.clientX, e.clientY, color);
                }
            });
            
            // Touch move event for particle trails
            document.addEventListener('touchmove', (e) => {
                if (window.currentDrag && window.currentDrag.element) {
                    const touch = e.touches[0];
                    const color = this.particleManager.getBlockColor(window.currentDrag.originalElement);
                    this.particleManager.createParticleTrail(touch.clientX, touch.clientY, color);
                }
            }, { passive: true });
        }
        
        enhanceGameOverScreen() {
            const gameOverElement = document.getElementById('game-over');
            if (!gameOverElement) return;
            
            // Use MutationObserver to detect when game over becomes visible
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'style' && 
                        gameOverElement.style.visibility === 'visible') {
                        // Add final score if not already present
                        if (!gameOverElement.querySelector('.final-score')) {
                            this.updateGameOverStats(gameOverElement);
                        }
                    }
                });
            });
            
            observer.observe(gameOverElement, { attributes: true });
        }
        
        updateGameOverStats(gameOverElement) {
            const finalScore = document.createElement('div');
            finalScore.className = 'final-score';
            finalScore.textContent = `Final Score: ${window.score || 0}`;
            
            const restartButton = gameOverElement.querySelector('.restart-button');
            if (restartButton) {
                gameOverElement.insertBefore(finalScore, restartButton);
            }
        }
    }
    
    // Initialize when DOM is ready
    const init = () => {
        createStyleElement();
        
        // Create main enhancement manager
        const enhancementManager = new VisualEnhancementManager();
        
        // Export for external use
        window.particleManager = enhancementManager.particleManager;
    };
    
    // Execute when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Make sure block container is properly positioned after a short delay
    setTimeout(() => {
        const blocksContainer = document.getElementById('blocks-container');
        if (blocksContainer) {
            blocksContainer.style.left = '50%';
            blocksContainer.style.transform = 'translateX(-50%)';
            blocksContainer.style.marginTop = '20px';
        }
    }, 500);
})();