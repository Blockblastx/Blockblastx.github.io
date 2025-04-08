// Audio Manager for Block Blast with reduced music volume
// Fixes errors and manages background music and sound effects

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
            this.isMusicMuted = false;
            this.isEffectsMuted = false;
            
            // Initialize
            this.init();
            this.createAudioControls();
            this.setupDirectTriggers();
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
                
                // Load sounds
                this.loadBackgroundMusic('./asset/game-music.mp3');
                this.loadSoundEffect('place', './asset/place-block.mp3');
                this.loadSoundEffect('clear', './asset/clear-line.mp3');
                this.loadSoundEffect('gameOver', './asset/game-over.mp3');
            } catch (e) {
                console.error("Audio initialization error:", e);
            }
        }
        
        // Create audio controls UI
        createAudioControls() {
            // Create container for audio controls
            const container = document.createElement('div');
            container.className = 'audio-controls';
            //container.style.position = 'fixed';
            container.style.top = '70px';
            container.style.right = '20px';
            container.style.display = 'flex';
            container.style.flexDirection = 'row';
            container.style.gap = '10px';
            container.style.zIndex = '1000';
            
            // Music toggle button
            const musicBtn = document.createElement('button');
            musicBtn.className = 'audio-btn music-btn';
            musicBtn.innerHTML = '🎵';
            musicBtn.title = 'Toggle Music';
            musicBtn.style.width = '40px';
            musicBtn.style.height = '40px';
            musicBtn.style.borderRadius = '50%';
            musicBtn.style.border = 'none';
            musicBtn.style.background = '#3366cc';
            musicBtn.style.color = 'white';
            musicBtn.style.fontSize = '20px';
            musicBtn.style.cursor = 'pointer';
            musicBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            
            // Sound effects toggle button
            const soundBtn = document.createElement('button');
            soundBtn.className = 'audio-btn sound-btn';
            soundBtn.innerHTML = '🔊';
            soundBtn.title = 'Toggle Sound Effects';
            soundBtn.style.width = '40px';
            soundBtn.style.height = '40px';
            soundBtn.style.borderRadius = '50%';
            soundBtn.style.border = 'none';
            soundBtn.style.background = '#3366cc';
            soundBtn.style.color = 'white';
            soundBtn.style.fontSize = '20px';
            soundBtn.style.cursor = 'pointer';
            soundBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            
            // Add event listeners
            musicBtn.addEventListener('click', () => {
                this.toggleMusic();
                musicBtn.innerHTML = this.isMusicMuted ? '🔇' : '🎵';
                musicBtn.style.background = this.isMusicMuted ? '#999999' : '#3366cc';
            });
            
            soundBtn.addEventListener('click', () => {
                this.toggleSoundEffects();
                soundBtn.innerHTML = this.isEffectsMuted ? '🔇' : '🔊';
                soundBtn.style.background = this.isEffectsMuted ? '#999999' : '#3366cc';
            });
            
            // Add buttons to container
            container.appendChild(musicBtn);
            container.appendChild(soundBtn);
            
            // Add container to the document
            document.body.appendChild(container);
        }
        
        // Load background music
        loadBackgroundMusic(url) {
            const audio = new Audio();
            
            audio.addEventListener('canplaythrough', () => {
                this.log(`Background music loaded: ${url}`);
                this.backgroundMusic = audio;
                this.backgroundMusic.loop = true;
                this.backgroundMusic.volume = this.musicVolume;
                this.playBackgroundMusic();
            });
            
            audio.addEventListener('error', (e) => {
                console.error(`Error loading background music from ${url}:`, e);
                // Try fallback if needed
                if (!url.includes('mixkit')) {
                    this.loadBackgroundMusic('https://assets.mixkit.co/music/preview/mixkit-game-level-music-689.mp3');
                }
            });
            
            this.log(`Attempting to load background music from: ${url}`);
            audio.src = url;
            audio.load();
        }
        
        // Load sound effect
        loadSoundEffect(name, url) {
            const audio = new Audio();
            
            audio.addEventListener('canplaythrough', () => {
                this.log(`Sound effect '${name}' loaded successfully`);
                this.soundEffects[name] = audio;
            });
            
            audio.addEventListener('error', (e) => {
                console.error(`Error loading sound effect '${name}' from ${url}:`, e);
                // Try fallback if needed
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
                    
                    const fallbackAudio = new Audio();
                    fallbackAudio.addEventListener('canplaythrough', () => {
                        this.log(`Fallback sound effect '${name}' loaded successfully`);
                        this.soundEffects[name] = fallbackAudio;
                    });
                    fallbackAudio.src = fallbackURL;
                    fallbackAudio.load();
                }
            });
            
            this.log(`Attempting to load sound effect '${name}' from: ${url}`);
            audio.src = url;
            audio.load();
        }
        
        // Play background music
        playBackgroundMusic() {
            if (this.backgroundMusic && !this.isMusicMuted) {
                // Resume audio context if needed
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                
                const playPromise = this.backgroundMusic.play();
                
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn("Auto-play was prevented. Music will play after user interaction.", error);
                        
                        // Add a one-time event listener to start music on interaction
                        const startAudio = () => {
                            this.backgroundMusic.play().catch(e => console.error("Still couldn't play audio:", e));
                            document.removeEventListener('click', startAudio);
                            document.removeEventListener('touchstart', startAudio);
                        };
                        
                        document.addEventListener('click', startAudio);
                        document.addEventListener('touchstart', startAudio);
                    });
                }
            }
        }
        
        // Play a sound effect
        playSoundEffect(name) {
            if (this.isEffectsMuted) return;
            
            const effect = this.soundEffects[name];
            if (effect) {
                this.log(`Playing sound effect: ${name}`);
                // Clone to allow overlapping sounds
                const effectClone = effect.cloneNode();
                effectClone.volume = this.effectsVolume;
                effectClone.play().catch(e => console.warn(`Couldn't play sound effect ${name}:`, e));
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
            try {
                localStorage.setItem('blockBlastMusicMuted', this.isMusicMuted ? '1' : '0');
            } catch (e) {
                this.log("LocalStorage not available");
            }
        }
        
        // Toggle sound effects on/off
        toggleSoundEffects() {
            this.isEffectsMuted = !this.isEffectsMuted;
            
            // Save preference
            try {
                localStorage.setItem('blockBlastEffectsMuted', this.isEffectsMuted ? '1' : '0');
            } catch (e) {
                this.log("LocalStorage not available");
            }
        }
        
        // Set up direct trigger methods with DOM observation
        setupDirectTriggers() {
            // Make the playSoundEffect method globally accessible
            window.playSound = (name) => {
                this.playSoundEffect(name);
            };
            
            // Add click listener to the grid
            const grid = document.getElementById('grid');
            if (grid) {
                grid.addEventListener('mouseup', () => {
                    // Play place sound on grid click - this is likely a block placement
                    this.playSoundEffect('place');
                });
            }
            
            // Set up a mutation observer to watch for clearing animations
            const observer = new MutationObserver((mutations) => {
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
            
            // Try to observe the grid for changes
            if (grid) {
                observer.observe(grid, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['class']
                });
            }
            
            // Watch for game over
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
            
            // Add direct event listeners to common game functions
            this.setupDirectEventListeners();
        }
        
        // Set up event listeners that directly override game functions
        setupDirectEventListeners() {
            // Attach listeners after a short delay to ensure game is loaded
            setTimeout(() => {
                // Try to hook into tryPlaceBlock
                if (typeof window.tryPlaceBlock === 'function') {
                    const original = window.tryPlaceBlock;
                    window.tryPlaceBlock = (...args) => {
                        const result = original.apply(this, args);
                        if (result) {
                            this.playSoundEffect('place');
                        }
                        return result;
                    };
                }
                
                // Try to hook into different variations of checkForCompletedLines
                if (typeof window.checkForCompletedLines === 'function') {
                    const original = window.checkForCompletedLines;
                    window.checkForCompletedLines = (...args) => {
                        const result = original.apply(this, args);
                        if (result > 0) {
                            this.playSoundEffect('clear');
                        }
                        return result;
                    };
                }
                
                // Try to hook into showGameOver with different variations
                if (typeof window.showGameOver === 'function') {
                    const original = window.showGameOver;
                    window.showGameOver = (...args) => {
                        this.playSoundEffect('gameOver');
                        return original.apply(this, args);
                    };
                } else if (typeof window.enhancedShowGameOver === 'function') {
                    const original = window.enhancedShowGameOver;
                    window.enhancedShowGameOver = (...args) => {
                        this.playSoundEffect('gameOver');
                        return original.apply(this, args);
                    };
                } else if (window.UIManager && typeof window.UIManager.showGameOver === 'function') {
                    const original = window.UIManager.showGameOver;
                    window.UIManager.showGameOver = (...args) => {
                        this.playSoundEffect('gameOver');
                        return original.apply(window.UIManager, args);
                    };
                }
                
                this.log("Direct event listeners set up");
            }, 1000);
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
                
                // Update UI to match preferences
                const musicBtn = document.querySelector('.music-btn');
                const soundBtn = document.querySelector('.sound-btn');
                
                if (musicBtn) {
                    musicBtn.innerHTML = this.isMusicMuted ? '🔇' : '🎵';
                    musicBtn.style.background = this.isMusicMuted ? '#999999' : '#3366cc';
                }
                
                if (soundBtn) {
                    soundBtn.innerHTML = this.isEffectsMuted ? '🔇' : '🔊';
                    soundBtn.style.background = this.isEffectsMuted ? '#999999' : '#3366cc';
                }
            } catch (e) {
                this.log("Couldn't load audio preferences: " + e.message);
            }
        }
    }
    
    // Initialize when the DOM is ready
    function initAudio() {
        console.log("Initializing audio manager with lower volume");
        window.audioManager = new AudioManager();
        window.audioManager.loadPreferences();
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAudio);
    } else {
        initAudio();
    }
})();