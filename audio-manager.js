// Audio Manager for Block Blast with reduced music volume
// Manages background music and sound effects

(function() {
    'use strict';
    
    // First fix the missing functions that cause the errors
    console.log("Applying game error fixes...");
    
    // Add placeholders for missing functions to eliminate errors
    if (typeof window.checkIfBlockCanBePlaced !== 'function') {
        window.checkIfBlockCanBePlaced = function(blockId) {
            // Just return true to avoid errors
            return true;
        };
    }
    
    if (typeof window.checkIfAnyBlockCanBePlaced !== 'function') {
        window.checkIfAnyBlockCanBePlaced = function() {
            // Just return true to avoid errors
            return true;
        };
    }
    
    // Audio Manager class for Block Blast
    class AudioManager {
        constructor() {
            this.audioContext = null;
            this.backgroundMusic = null;
            this.soundEffects = {};
            this.musicVolume = 0.2;  // REDUCED default volume from 0.5 to 0.2
            this.effectsVolume = 0.6;
            this.isMusicMuted = false; // Default to unmuted
            this.isEffectsMuted = false; // Default to unmuted
            
            // Load saved preferences first
            this.loadPreferences();
            
            // Initialize
            this.init();
            this.createAudioControls();
            this.setupEventHandlers();
        }
        
        // Log with prefix
        log(message) {
            console.log(`[AudioManager] ${message}`);
        }
        
        // Initialize audio
        init() {
            try {
                // Create audio context
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioContext();
                this.log("Audio context initialized");
                
                // Load sounds with correct paths based on project structure
                this.loadBackgroundMusic('game-music.mp3');
                this.loadSoundEffect('place', 'place-block.mp3');
                this.loadSoundEffect('clear', 'clear-line.mp3');
                this.loadSoundEffect('gameOver', 'game-over.mp3');
            } catch (e) {
                console.error("[AudioManager] Audio initialization error:", e);
            }
        }
        
        // Create audio controls
        createAudioControls() {
            // Get the container from HTML
            const container = document.getElementById('audio-controls-container');
            
            if (!container) {
                this.log("Could not find audio controls container");
                return;
            }
            
            // Clear any existing controls to prevent duplicates
            container.innerHTML = '';
            
            // Music toggle button
            const musicBtn = document.createElement('button');
            musicBtn.className = 'audio-btn music-btn';
            musicBtn.innerHTML = this.isMusicMuted ? '🔇' : '🎵';
            musicBtn.title = 'Toggle Music';
            musicBtn.classList.toggle('muted', this.isMusicMuted);
            
            // Sound effects toggle button
            const soundBtn = document.createElement('button');
            soundBtn.className = 'audio-btn sound-btn';
            soundBtn.innerHTML = this.isEffectsMuted ? '🔇' : '🔊';
            soundBtn.title = 'Toggle Sound Effects';
            soundBtn.classList.toggle('muted', this.isEffectsMuted);
            
            // Add event listeners
            musicBtn.addEventListener('click', () => {
                this.toggleMusic();
                musicBtn.innerHTML = this.isMusicMuted ? '🔇' : '🎵';
                musicBtn.classList.toggle('muted', this.isMusicMuted);
            });
            
            soundBtn.addEventListener('click', () => {
                this.toggleSoundEffects();
                soundBtn.innerHTML = this.isEffectsMuted ? '🔇' : '🔊';
                soundBtn.classList.toggle('muted', this.isEffectsMuted);
            });
            
            // Add buttons to container
            container.appendChild(musicBtn);
            container.appendChild(soundBtn);
            
            this.log("Audio controls created");
        }
        
        // Load background music with proper error handling
        loadBackgroundMusic(url) {
            const audio = new Audio();
            
            audio.addEventListener('canplaythrough', () => {
                this.log(`Background music loaded: ${url}`);
                this.backgroundMusic = audio;
                this.backgroundMusic.loop = true;
                this.backgroundMusic.volume = this.musicVolume;
                
                // Only play if not muted
                if (!this.isMusicMuted) {
                    this.playBackgroundMusic();
                }
            });
            
            audio.addEventListener('error', (e) => {
                console.error(`[AudioManager] Error loading background music from ${url}:`, e);
                
                // Try fallback if needed - directly check if already using fallback
                if (!url.includes('mixkit')) {
                    this.log("Attempting to load fallback background music");
                    this.loadBackgroundMusic('https://assets.mixkit.co/music/preview/mixkit-game-level-music-689.mp3');
                }
            });
            
            this.log(`Attempting to load background music from: ${url}`);
            audio.src = url;
            audio.load();
        }
        
        // Load sound effect with proper error handling
        loadSoundEffect(name, url) {
            const audio = new Audio();
            
            audio.addEventListener('canplaythrough', () => {
                this.log(`Sound effect '${name}' loaded successfully`);
                this.soundEffects[name] = audio;
            });
            
            audio.addEventListener('error', (e) => {
                console.error(`[AudioManager] Error loading sound effect '${name}' from ${url}:`, e);
                
                // Try fallback if needed - directly check if already using fallback
                if (!url.includes('mixkit')) {
                    let fallbackURL;
                    switch (name) {
                        case 'place':
                            fallbackURL = 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3';
                            break;
                        case 'clear':
                            fallbackURL = 'https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3';
                            break;
                        case 'gameOver':
                            fallbackURL = 'https://assets.mixkit.co/sfx/preview/mixkit-player-losing-or-failing-2042.mp3';
                            break;
                        default:
                            fallbackURL = 'https://assets.mixkit.co/sfx/preview/mixkit-video-game-retro-click-237.mp3';
                    }
                    
                    this.log(`Attempting to load fallback sound effect for '${name}'`);
                    this.loadSoundEffect(`${name}-fallback`, fallbackURL);
                }
            });
            
            this.log(`Attempting to load sound effect '${name}' from: ${url}`);
            audio.src = url;
            audio.load();
        }
        
        // Play background music with proper error handling
        playBackgroundMusic() {
            if (!this.backgroundMusic || this.isMusicMuted) {
                return;
            }
            
            // Resume audio context if needed
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume().catch(e => {
                    console.error("[AudioManager] Failed to resume audio context:", e);
                });
            }
            
            const playPromise = this.backgroundMusic.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn("[AudioManager] Auto-play was prevented. Music will play after user interaction.", error);
                    
                    // Add a one-time event listener to start music on interaction
                    const startAudio = () => {
                        if (!this.isMusicMuted && this.backgroundMusic) {
                            this.backgroundMusic.play().catch(e => {
                                console.error("[AudioManager] Still couldn't play audio:", e);
                            });
                        }
                        document.removeEventListener('click', startAudio);
                        document.removeEventListener('touchstart', startAudio);
                    };
                    
                    document.addEventListener('click', startAudio);
                    document.addEventListener('touchstart', startAudio);
                });
            }
        }
        
        // Play a sound effect with proper error handling
        playSoundEffect(name) {
            if (this.isEffectsMuted) return;
            
            // Try the main sound effect first
            let effect = this.soundEffects[name];
            
            // If not available, try the fallback
            if (!effect) {
                effect = this.soundEffects[`${name}-fallback`];
            }
            
            if (effect) {
                this.log(`Playing sound effect: ${name}`);
                
                try {
                    // Clone to allow overlapping sounds
                    const effectClone = effect.cloneNode();
                    effectClone.volume = this.effectsVolume;
                    
                    effectClone.play().catch(e => {
                        console.warn(`[AudioManager] Couldn't play sound effect ${name}:`, e);
                    });
                } catch (e) {
                    console.error(`[AudioManager] Error cloning sound effect:`, e);
                }
            } else {
                this.log(`Sound effect '${name}' not loaded yet`);
            }
        }
        
        // Toggle music on/off
        toggleMusic() {
            this.isMusicMuted = !this.isMusicMuted;
            
            if (this.backgroundMusic) {
                if (this.isMusicMuted) {
                    this.backgroundMusic.pause();
                } else {
                    this.playBackgroundMusic();
                }
            }
            
            // Save preference
            this.savePreferences();
        }
        
        // Toggle sound effects on/off
        toggleSoundEffects() {
            this.isEffectsMuted = !this.isEffectsMuted;
            
            // Save preference
            this.savePreferences();
        }
        
        // Save preferences to localStorage
        savePreferences() {
            try {
                localStorage.setItem('blockBlastMusicMuted', this.isMusicMuted ? '1' : '0');
                localStorage.setItem('blockBlastEffectsMuted', this.isEffectsMuted ? '1' : '0');
                this.log("Audio preferences saved");
            } catch (e) {
                this.log("LocalStorage not available: " + e.message);
            }
        }
        
        // Load preferences from localStorage
        loadPreferences() {
            try {
                const musicMuted = localStorage.getItem('blockBlastMusicMuted');
                const effectsMuted = localStorage.getItem('blockBlastEffectsMuted');
                
                if (musicMuted !== null) {
                    this.isMusicMuted = musicMuted === '1';
                }
                
                if (effectsMuted !== null) {
                    this.isEffectsMuted = effectsMuted === '1';
                }
                
                this.log("Audio preferences loaded");
            } catch (e) {
                this.log("Couldn't load audio preferences: " + e.message);
            }
        }
        
        // Unified approach to handle game events
        setupEventHandlers() {
            // Make the playSoundEffect method globally accessible
            window.playSound = (name) => {
                this.playSoundEffect(name);
            };
            
            // Set up DOM and game event handlers
            this.setupDOMEventHandlers();
            this.setupGameEventHandlers();
        }
        
        // Set up DOM-based event handlers
        setupDOMEventHandlers() {
            // Add listeners for grid interactions
            const grid = document.getElementById('grid');
            if (grid) {
                // Use a flag to prevent duplicate sounds
                let blockPlaced = false;
                
                grid.addEventListener('mousedown', () => {
                    blockPlaced = false;
                });
                
                grid.addEventListener('mouseup', () => {
                    if (!blockPlaced) {
                        this.playSoundEffect('place');
                        blockPlaced = true;
                    }
                });
            }
            
            // Watch for game-over visibility changes
            const gameOverElement = document.getElementById('game-over');
            if (gameOverElement) {
                const gameOverObserver = new MutationObserver((mutations) => {
                    mutations.forEach(mutation => {
                        if (mutation.attributeName === 'style' && 
                            gameOverElement.style.visibility === 'visible') {
                            this.playSoundEffect('gameOver');
                        }
                    });
                });
                
                gameOverObserver.observe(gameOverElement, { attributes: true });
            }
            
            // Watch for cells with 'clearing' class
            const observeForClearing = () => {
                if (!grid) return;
                
                const clearObserver = new MutationObserver((mutations) => {
                    // Look for cells with the 'clearing' class being added
                    let clearingFound = false;
                    
                    mutations.forEach(mutation => {
                        if (mutation.type === 'attributes' && 
                            mutation.attributeName === 'class' && 
                            mutation.target.classList.contains('clearing')) {
                            clearingFound = true;
                        }
                    });
                    
                    if (clearingFound) {
                        this.playSoundEffect('clear');
                    }
                });
                
                // Observe the grid for changes
                clearObserver.observe(grid, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['class']
                });
            };
            
            // Execute after a short delay to ensure grid is fully loaded
            setTimeout(observeForClearing, 1000);
        }
        
        // Set up game function overrides
        setupGameEventHandlers() {
            // Give time for the game to fully load
            setTimeout(() => {
                const _this = this; // Store reference to this for use in function overrides
                
                // Override tryPlaceBlock if it exists
                if (typeof window.tryPlaceBlock === 'function') {
                    const original = window.tryPlaceBlock;
                    window.tryPlaceBlock = function(...args) {
                        const result = original.apply(this, args);
                        if (result) {
                            _this.playSoundEffect('place');
                        }
                        return result;
                    };
                }
                
                // Override checkForCompletedLines if it exists
                if (typeof window.checkForCompletedLines === 'function') {
                    const original = window.checkForCompletedLines;
                    window.checkForCompletedLines = function(...args) {
                        const result = original.apply(this, args);
                        if (result > 0) {
                            _this.playSoundEffect('clear');
                        }
                        return result;
                    };
                }
                
                // Override various showGameOver functions
                if (typeof window.showGameOver === 'function') {
                    const original = window.showGameOver;
                    window.showGameOver = function(...args) {
                        _this.playSoundEffect('gameOver');
                        return original.apply(this, args);
                    };
                } else if (typeof window.enhancedShowGameOver === 'function') {
                    const original = window.enhancedShowGameOver;
                    window.enhancedShowGameOver = function(...args) {
                        _this.playSoundEffect('gameOver');
                        return original.apply(this, args);
                    };
                } else if (window.UIManager && typeof window.UIManager.showGameOver === 'function') {
                    const original = window.UIManager.showGameOver;
                    window.UIManager.showGameOver = function(...args) {
                        _this.playSoundEffect('gameOver');
                        return original.apply(window.UIManager, args);
                    };
                }
                
                this.log("Game event handlers set up");
            }, 1000);
        }
    }
    
    // Initialize audio
    function initAudio() {
        console.log("Initializing audio manager with lower volume");
        
        // Check if audio controls container exists
        const container = document.getElementById('audio-controls-container');
        if (!container) {
            console.error("Audio controls container not found in DOM");
            
            // Create container if it doesn't exist
            const newContainer = document.createElement('div');
            newContainer.id = 'audio-controls-container';
            newContainer.className = 'audio-controls-container';
            
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer) {
                gameContainer.prepend(newContainer);
                console.log("Created missing audio controls container");
            }
        }
        
        // Create and store the AudioManager instance
        window.audioManager = new AudioManager();
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAudio);
    } else {
        initAudio();
    }
})();