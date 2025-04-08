// Optimized Block Blast Game Script
// Game constants
const GRID_SIZE = 8;
const BLOCK_TYPES = ['yellow', 'purple', 'blue', 'green', 'red'];

// Global error handler for better recovery
window.addEventListener('error', function(event) {
    console.error("Global error:", event.error);
    
    // Attempt to recover any drag operations
    if (window.currentDrag && window.currentDrag.originalElement) {
        window.currentDrag.originalElement.style.visibility = 'visible';
        
        // Reset drag state
        window.currentDrag = {
            blockId: null,
            element: null,
            originalElement: null,
            offsetX: 0,
            offsetY: 0,
            gridX: undefined,
            gridY: undefined
        };
    }
});

// Game state module - Manages the internal game state
const GameState = (function() {
    'use strict';
    
    let grid = [];
    let score = 0;
    let highScore = 2755; // Default high score
    let availableBlocks = ['yellow', 'purple', 'blue']; // Default starting blocks
    let gameOver = false;
    let selectedBlockIndex = 0; // For keyboard accessibility
    
    // Initialize grid with proper bounds checking
    function initGrid() {
        grid = [];
        for (let y = 0; y < GRID_SIZE; y++) {
            grid[y] = Array(GRID_SIZE).fill(0);
        }
        return grid;
    }
    
    // Reset game state
    function resetGame() {
        initGrid();
        score = 0;
        gameOver = false;
        // Reset blocks with random order - only take 3 blocks
        availableBlocks = BlockGenerator.getRandomBlockTypes(3);
        
        // Clean up any game over effects
        if (typeof window.cleanupGameOverEffects === 'function') {
            window.cleanupGameOverEffects();
        }
    }
    
    // Update score with error handling
    function updateScore(points) {
        try {
            score += points;
            
            // Update high score if needed
            if (score > highScore) {
                highScore = score;
                // Try-catch to handle sandboxed environments
                try {
                    localStorage.setItem('blockBlastHighScore', highScore);
                } catch (e) {
                    console.log('localStorage not available in this environment');
                }
            }
            
            return {
                score,
                highScore
            };
        } catch (e) {
            console.error("Error updating score:", e);
            return { score, highScore };
        }
    }
    
    // Load high score from storage with error handling
    function loadHighScore() {
        try {
            const savedHighScore = localStorage.getItem('blockBlastHighScore');
            if (savedHighScore) {
                const parsedScore = parseInt(savedHighScore);
                if (!isNaN(parsedScore)) {
                    highScore = parsedScore;
                }
            }
        } catch (e) {
            console.log('localStorage not available');
        }
        return highScore;
    }
    
    // Set game over state
    function setGameOver(isOver) {
        gameOver = isOver;
    }
    
    // Get/Set available blocks with validation
    function setAvailableBlocks(blocks) {
        if (Array.isArray(blocks)) {
            availableBlocks = blocks.filter(block => BLOCK_TYPES.includes(block));
        }
    }
    
    function getAvailableBlocks() {
        return [...availableBlocks]; // Return copy to prevent external modification
    }
    
    // Check if a position in the grid is occupied with bounds checking
    function isOccupied(x, y) {
        if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) {
            return true; // Out of bounds is considered occupied
        }
        
        // Ensure the grid cell exists
        if (!grid[y]) {
            grid[y] = Array(GRID_SIZE).fill(0);
        }
        
        return grid[y][x] === 1;
    }
    
    // Set a grid position with validation
    function setGridPosition(x, y, value) {
        // Validate coordinates
        if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) {
            return false;
        }
        
        // Ensure the row exists
        if (!grid[y]) {
            grid[y] = Array(GRID_SIZE).fill(0);
        }
        
        grid[y][x] = value;
        return true;
    }
    
    // Select next block (for keyboard accessibility)
    function selectNextBlock() {
        if (availableBlocks.length === 0) return null;
        
        selectedBlockIndex = (selectedBlockIndex + 1) % availableBlocks.length;
        return availableBlocks[selectedBlockIndex];
    }
    
    // Get currently selected block
    function getSelectedBlock() {
        if (availableBlocks.length === 0) return null;
        return availableBlocks[selectedBlockIndex];
    }
    
    // Public API
    return {
        initGrid,
        resetGame,
        updateScore,
        loadHighScore,
        setGameOver,
        setAvailableBlocks,
        getAvailableBlocks,
        isOccupied,
        setGridPosition,
        selectNextBlock,
        getSelectedBlock,
        
        // Properties with getters
        get grid() { return grid; },
        get score() { return score; },
        get highScore() { return highScore; },
        get gameOver() { return gameOver; }
    };
})();

// Block generator module - Creates different block shapes
// Modified Block Generator module with decoupled shapes and colors
const BlockGenerator = (function() {
    'use strict';
    
    // Define all possible shape types independent of color
    const SHAPE_TYPES = [
        // Single cell
        [
            [1]
        ],
        // Horizontal line (2 cells)
        [
            [1, 1]
        ],
        // Vertical line (2 cells)
        [
            [1],
            [1]
        ],
        // Small square (2x2)
        [
            [1, 1],
            [1, 1]
        ],
        // L shape
        [
            [1, 0],
            [1, 1]
        ],
        // Reverse L shape
        [
            [0, 1],
            [1, 1]
        ],
        // Horizontal line (3 cells)
        [
            [1, 1, 1]
        ],
        // Vertical line (3 cells)
        [
            [1],
            [1],
            [1]
        ],
        // T shape
        [
            [1, 1, 1],
            [0, 1, 0]
        ],
        // Plus shape
        [
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 0]
        ],
        // Z shape
        [
            [1, 1, 0],
            [0, 1, 1]
        ],
        // S shape
        [
            [0, 1, 1],
            [1, 1, 0]
        ],
        // Rectangle (3x2)
        [
            [1, 1, 1],
            [1, 1, 1]
        ],
        // U shape
        [
            [1, 0, 1],
            [1, 1, 1]
        ]
    ];
    
    // Define colors (same as your original BLOCK_TYPES)
    const BLOCK_COLORS = ['yellow', 'purple', 'blue', 'green', 'red'];
    
    // Function to generate blocks with random shapes
    function generateRandomBlockShapes() {
        // Select random shapes for this round
        const selectedShapes = getRandomShapes(Math.min(5, SHAPE_TYPES.length));
        
        // Create blocks object
        const blocks = {};
        
        // Assign each color a random shape
        BLOCK_COLORS.forEach((color, index) => {
            // Select a shape from available shapes
            const shapeIndex = index % selectedShapes.length;
            const shape = selectedShapes[shapeIndex];
            
            blocks[color] = {
                shape: shape,
                class: `${color}-cell`
            };
        });
        
        return blocks;
    }
    
    // Get random shapes from the shape collection
    function getRandomShapes(count) {
        return shuffleArray([...SHAPE_TYPES]).slice(0, count);
    }
    
    // Shuffle array function - Fisher-Yates algorithm (same as your original)
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    // Get random block types (colors)
    function getRandomBlockTypes(count) {
        if (count <= 0 || count > BLOCK_COLORS.length) {
            count = Math.min(3, BLOCK_COLORS.length);
        }
        return shuffleArray(BLOCK_COLORS).slice(0, count);
    }
    
    // Rotate a block shape 90 degrees clockwise (same as your original)
    function rotateBlockShape(shape) {
        if (!Array.isArray(shape) || shape.length === 0) {
            return [[1]]; // Return default shape if invalid
        }
        
        const rows = shape.length;
        const cols = shape[0].length;
        
        // Create a new array for the rotated shape
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
        
        // Fill the rotated array
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                rotated[x][rows - y - 1] = shape[y][x];
            }
        }
        
        return rotated;
    }
    
    // Public API
    return {
        generateRandomBlockShapes,
        shuffleArray,
        getRandomBlockTypes,
        rotateBlockShape,
        SHAPE_TYPES,      // Export shape types
        BLOCK_COLORS      // Export color list
    };
})();


// UI Manager module - Handles all DOM manipulations
const UIManager = (function() {
    'use strict';
    
    // DOM elements
    let gridElement;
    let blocksContainer;
    let currentScoreElement;
    let highScoreElement;
    let gameOverElement;
    let restartButton;
    
    // Cache DOM elements
    function cacheElements() {
        gridElement = document.getElementById('grid');
        blocksContainer = document.getElementById('blocks-container');
        currentScoreElement = document.getElementById('current-score');
        highScoreElement = document.getElementById('high-score');
        gameOverElement = document.getElementById('game-over');
        restartButton = document.getElementById('restart-button');
    }
    
    // Create grid UI
    function createGrid() {
        if (!gridElement) return;
        
        gridElement.innerHTML = '';
        
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                cell.setAttribute('aria-label', `Cell at row ${y + 1}, column ${x + 1}`);  // Accessibility
                gridElement.appendChild(cell);
            }
        }
        
        // Add keyboard accessibility
        gridElement.setAttribute('tabindex', '0');
        gridElement.setAttribute('aria-label', 'Game grid');
    }
    
    // Update scores in UI with error handling
    function updateScoreDisplay(score, highScore) {
        try {
            if (currentScoreElement) {
                currentScoreElement.textContent = score;
            }
            
            if (highScoreElement) {
                highScoreElement.textContent = highScore;
            }
        } catch (e) {
            console.error("Error updating score display:", e);
        }
    }
    
    // Show game over screen
    function showGameOver() {
        if (gameOverElement) {
            //gameOverElement.style.visibility = 'visible';
            if (typeof window.showGameOverWithEffect === 'function') {
                window.showGameOverWithEffect();
            } else {
                gameOverElement.style.visibility = 'visible';
            }
            
            gameOverElement.setAttribute('aria-hidden', 'false');
            
            // Set focus on restart button for keyboard accessibility
            if (restartButton) {
                setTimeout(() => {
                    restartButton.focus();
                }, 100);
            }
            
            // Add game statistics to game over screen
            const finalScoreElem = gameOverElement.querySelector('.final-score') || document.createElement('div');
            finalScoreElem.className = 'final-score';
            finalScoreElem.textContent = `Final Score: ${GameState.score}`;
            
            const statsElem = gameOverElement.querySelector('.stats') || document.createElement('div');
            statsElem.className = 'stats';
            statsElem.innerHTML = `
                <div>High Score: ${GameState.highScore}</div>
            `;
            
            if (!gameOverElement.querySelector('.final-score')) {
                if (restartButton) {
                    gameOverElement.insertBefore(finalScoreElem, restartButton);
                    gameOverElement.insertBefore(statsElem, restartButton);
                } else {
                    gameOverElement.appendChild(finalScoreElem);
                    gameOverElement.appendChild(statsElem);
                }
            }
        }
    }
    
    // Hide game over screen
    function hideGameOver() {
        if (gameOverElement) {
            gameOverElement.style.visibility = 'hidden';
            gameOverElement.setAttribute('aria-hidden', 'true');
        }
    }
    
    // Helper function to safely get a grid cell element
    function getGridCell(x, y) {
        // Check bounds
        if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) {
            return null;
        }
        
        if (!gridElement) return null;
        
        const cellIndex = y * GRID_SIZE + x;
        if (cellIndex < 0 || cellIndex >= gridElement.children.length) {
            return null;
        }
        
        return gridElement.children[cellIndex];
    }
    
            // Find this function in your UIManager module
        function clearHighlights() {
            if (!gridElement) return;
            
            const cells = gridElement.children;
            for (let i = 0; i < cells.length; i++) {
                cells[i].classList.remove(
                    'highlight', 'invalid', 
                    'yellow-highlight', 'purple-highlight', 
                    'blue-highlight', 'green-highlight', 'red-highlight'
                );
            }
        }
    // Update block appearance to match its shape
    function updateBlockAppearance(blockElement, shape) {
        if (!blockElement || !Array.isArray(shape)) return;
        
        blockElement.innerHTML = '';
        
        // Add ARIA attributes for accessibility
        blockElement.setAttribute('aria-label', `${blockElement.id.split('-')[0]} block`);
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[0].length; x++) {
                if (shape[y][x]) {
                    const cell = document.createElement('div');
                    cell.className = 'block-cell ' + blockElement.id.split('-')[0] + '-cell';
                    blockElement.appendChild(cell);
                } else {
                    const emptyCell = document.createElement('div');
                    emptyCell.className = 'block-cell-empty';
                    blockElement.appendChild(emptyCell);
                }
            }
        }
        
        blockElement.style.display = 'grid';
        blockElement.style.gridTemplateColumns = `repeat(${shape[0].length}, 1fr)`;
        blockElement.style.gridTemplateRows = `repeat(${shape.length}, 1fr)`;
        
        const cellSize = 24; // Cell size
        blockElement.style.width = `${shape[0].length * cellSize}px`;
        blockElement.style.height = `${shape.length * cellSize}px`;
        blockElement.style.gap = '1px';
    }
    
    // Update grid cell states based on the internal grid array
    function updateGridDisplay(grid) {
        if (!grid || !gridElement) return;
        
        // Update each cell in the grid
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const cell = getGridCell(x, y);
                if (cell) {
                    // Reset cell class
                    cell.className = 'cell';
                    
                    // If occupied, add the appropriate color class
                    if (grid[y] && grid[y][x] === 1) {
                        // Look for the block that was placed here
                        // This would need additional state tracking in a real implementation
                        cell.classList.add('occupied');
                    }
                }
            }
        }
    }
    
    // Show placement preview
        // Find this function in your UIManager module
    function showPlacementPreview(blockId, shape, gridX, gridY) {
        if (!gridElement || !Array.isArray(shape)) return false;
        
        clearHighlights();
        
        let canPlace = true;
        
        // Determine which color highlight to use based on blockId
        const highlightClass = `${blockId}-highlight`;
        
        // Check if placement is valid
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[0].length; x++) {
                if (shape[y][x]) {
                    const targetX = gridX + x;
                    const targetY = gridY + y;
                    
                    // Check if out of bounds or already occupied
                    if (GameState.isOccupied(targetX, targetY)) {
                        canPlace = false;
                    }
                    
                    // Highlight cell
                    const cell = getGridCell(targetX, targetY);
                    if (cell) {
                        if (canPlace) {
                            cell.classList.add(highlightClass);
                        } else {
                            cell.classList.add('invalid');
                        }
                        
                        // Add ARIA attributes for accessibility
                        cell.setAttribute('aria-label', canPlace ? 'Valid placement' : 'Invalid placement');
                    }
                }
            }
        }
        
        return canPlace;
    }
    
    // Generate a CSS class for a variation with specific colors
    function generateBlockCSS() {
        // Check if style already exists
        if (document.getElementById('block-game-styles')) {
            return;
        }
        
        const styleSheet = document.createElement("style");
        styleSheet.id = 'block-game-styles';
        document.head.appendChild(styleSheet);
        
        const blockColors = {
            'red-cell': { base: '#ff5555', highlight: '#ff7777', shadow: '#cc3333' },
            'blue-cell': { base: '#5588ff', highlight: '#77aaff', shadow: '#3366cc' },
            'green-cell': { base: '#55cc55', highlight: '#77dd77', shadow: '#339933' },
            'yellow-cell': { base: '#ffcc33', highlight: '#ffdd55', shadow: '#cc9922' },
            'purple-cell': { base: '#cc55cc', highlight: '#dd77dd', shadow: '#993399' }
        };
        
        let cssRules = '';
        
        // Generate styles for each block color
        for (const colorClass in blockColors) {
            const color = blockColors[colorClass];
            cssRules += `
            .${colorClass} {
                background-color: ${color.base};
                box-shadow: inset 2px 2px 3px ${color.highlight}88,
                           inset -2px -2px 3px ${color.shadow}88;
            }
            `;
        }
        
        // Add animation keyframes and other styles
        cssRules += `        
        .block-cell {
            width: 20px;
            height: 20px;
            border-radius: 2px;
            transition: all 0.15s ease;
        }
        
        .block-cell-empty {
            width: 20px;
            height: 20px;
        }
        
        .dragging {
            cursor: grabbing;
            z-index: 1000;
            transform: translate(-50%, -50%) scale(1.1);
            pointer-events: none;
        }
        
        /* Block with keyboard focus */
        .block:focus {
            outline: 2px solid white;
            z-index: 10;
        }
        
        /* Highlight when block is selected with keyboard */
        .block.keyboard-selected {
            transform: translate(-50%, 0) scale(1.1);
            box-shadow: 0 0 10px white;
            z-index: 5;
        }
        
        /* Visually hidden content for screen readers */
        .visually-hidden {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            border: 0;
        }
        
        /* Block states */
        .block.unplaceable {
            opacity: 0.5;
            position: relative;
            cursor: not-allowed;
        }
        
        /* Shake animation for unplaceable blocks */
        @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(1px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-2px, 0, 0); }
            40%, 60% { transform: translate3d(2px, 0, 0); }
        }
        
        .block.shake {
            animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
            will-change: transform;
        }
        `;
        
        styleSheet.textContent = cssRules;
    }
    

        function updateBlockVisualState() {
            try {
                const availableBlocks = GameState.getAvailableBlocks();
                const canPlaceMap = {};
                availableBlocks.forEach(blockId => {
                    canPlaceMap[blockId] = checkIfBlockCanBePlaced(blockId);
                });
                
                return checkIfAnyBlockCanBePlaced();
            } catch (error) {
                console.error("Error updating block visual state:", error);
                return false;
            }
        }
    

function displayBlocks(blocks, blockShapes) {
    if (!blocksContainer) return;
    
    // Calculate positions for blocks - using fixed positions
    const blockPositions = {};
    const containerWidth = blocksContainer.clientWidth;
    
    // Create fixed positions regardless of how many blocks
    const positions = [
        containerWidth * 0.15,  // Left position at 25%
        containerWidth * 0.55,   // Center position at 50%
        containerWidth * 0.95   // Right position at 75%
    ];
    
    // Assign positions based on index
    blocks.forEach((blockId, index) => {
        // Get position from the fixed array
        blockPositions[blockId] = positions[index];
    });
    
    // Update block visibility based on available blocks
    document.querySelectorAll('.block').forEach(block => {
        const blockId = block.id.split('-')[0];
        
        block.classList.remove('fade-in', 'unplaceable', 'shake', 'keyboard-selected');
        
        // Only show blocks that are in the available blocks array
        if (blocks.includes(blockId)) {
            // Position the block
            const blockPosition = blockPositions[blockId];
            // block.style.position = 'absolute';
            // block.style.left = `${blockPosition}px`;
            // block.style.top = '50%';
            // block.style.transform = 'translate(-50%, -50%)';
            // Don't modify position since we're using CSS for layout
                block.style.position = 'relative';
                block.style.left = 'auto';
                block.style.top = 'auto';
                block.style.transform = 'none';
            
            // Update the block appearance to match its shape
            if (blockShapes[blockId]) {
                updateBlockAppearance(block, blockShapes[blockId].shape);
            }
            
            block.style.visibility = 'visible';
            block.style.display = 'grid';
            
            // Add animation class
            block.classList.add('fade-in');
            setTimeout(() => {
                block.classList.remove('fade-in');
            }, 500);
        } else {
            block.style.visibility = 'hidden';
            block.style.display = 'none';
        }
    });
}
    // Hide loading screen
    function hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = 0;
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }
    
    // Public API
    return {
        cacheElements,
        createGrid,
        updateScoreDisplay,
        showGameOver,
        hideGameOver,
        getGridCell,
        clearHighlights,
        updateBlockAppearance,
        updateGridDisplay,
        showPlacementPreview,
        generateBlockCSS,
        updateBlockVisualState,
        displayBlocks,
        hideLoadingScreen
    };
})();

// Drag and Drop Manager module - Handles drag interactions
const DragManager = (function() {
    'use strict';
    
    // Current drag state
    const currentDrag = {
        blockId: null,
        element: null,
        originalElement: null,
        offsetX: 0,
        offsetY: 0,
        gridX: undefined,
        gridY: undefined
    };
    
    // Make drag state available globally for error recovery
    window.currentDrag = currentDrag;
    
    // Track animation frame for movement
    let movementAnimationFrame = null;
    
    // Start dragging a block
    function startDragging(blockId, element, offsetX, offsetY, clientX, clientY) {
        // If there's already an ongoing drag operation, clean it up first
        if (currentDrag.element) {
            endDragging();
        }
        
        try {
            // Clone the element for dragging
            const clone = element.cloneNode(true);
            clone.classList.add('dragging');
            document.body.appendChild(clone);
            
            // Get the center point of the block
            const rect = element.getBoundingClientRect();
            
            // Position the dragged element with the center at the cursor
            clone.style.left = (clientX - rect.width / 2) + 'px';
            clone.style.top = (clientY - rect.height / 2) + 'px';
            
            // Add ARIA for accessibility
            clone.setAttribute('aria-grabbed', 'true');
            
            // Hide original element
            element.style.visibility = 'hidden';
            
            // Store drag information
            currentDrag.blockId = blockId;
            currentDrag.element = clone;
            currentDrag.originalElement = element;
            currentDrag.offsetX = rect.width / 2;
            currentDrag.offsetY = rect.height / 2;
            
            // Fire custom event for screen readers
            const dragStartEvent = new CustomEvent('blockdragstart', { 
                detail: { blockId, clientX, clientY } 
            });
            document.dispatchEvent(dragStartEvent);
            
            return currentDrag;
        } catch (error) {
            console.error("Error in startDragging:", error);
            // Ensure original element is visible if an error occurs
            if (element) {
                element.style.visibility = 'visible';
            }
            return null;
        }
    }
    
    // Move drag element using requestAnimationFrame for smoother performance
    function moveDragElement(clientX, clientY) {
        if (!currentDrag.element) return;
        
        // Cancel any existing animation frame
        if (movementAnimationFrame) {
            cancelAnimationFrame(movementAnimationFrame);
        }
        
        // Schedule the movement for the next frame
        movementAnimationFrame = requestAnimationFrame(() => {
            if (currentDrag.element) {
                // Move the element centered on the cursor
                currentDrag.element.style.left = (clientX - currentDrag.offsetX) + 'px';
                currentDrag.element.style.top = (clientY - currentDrag.offsetY) + 'px';
            }
            movementAnimationFrame = null;
        });
    }
    
    // Track debounce timeout for grid highlight
    let highlightTimeout = null;
    
    // Update grid highlight with debouncing
    function updateGridHighlight(clientX, clientY, blocks, onHighlight) {
        if (!currentDrag.blockId) return;
        
        // Clear existing timeout
        if (highlightTimeout) {
            clearTimeout(highlightTimeout);
        }
        
        // Set new timeout
        highlightTimeout = setTimeout(() => {
            try {
                // Get grid coordinates
                const gridElement = document.getElementById('grid');
                if (!gridElement) return;
                
                const rect = gridElement.getBoundingClientRect();
                const relX = clientX - rect.left;
                const relY = clientY - rect.top;
                
                // Check if cursor is over grid
                if (relX >= 0 && relY >= 0 && relX < rect.width && relY < rect.height) {
                    const cellSize = rect.width / GRID_SIZE;
                    
                    // Get shape dimensions
                    const shape = blocks[currentDrag.blockId].shape;
                    if (!Array.isArray(shape)) return;
                    
                    const shapeWidth = shape[0].length;
                    const shapeHeight = shape.length;
                    
                    // Calculate grid position for center-based placement
                    // Subtract half the shape size to center it
                    const gridX = Math.floor(relX / cellSize) - Math.floor(shapeWidth / 2);
                    const gridY = Math.floor(relY / cellSize) - Math.floor(shapeHeight / 2);
                    
                    // Store these values for use when dropping
                    currentDrag.gridX = gridX;
                    currentDrag.gridY = gridY;
                    
                    // Call the highlight callback
                    if (onHighlight) {
                        onHighlight(currentDrag.blockId, shape, gridX, gridY);
                    }
                }
            } catch (error) {
                console.error("Error in updateGridHighlight:", error);
            }
        }, 16); // 60fps
    }
    
    // End dragging with improved error handling
    function endDragging(onEndDrag) {
        if (!currentDrag.element) return false;
        
        try {
            // Create a copy of the current drag state
            const dragResult = {
                blockId: currentDrag.blockId,
                gridX: currentDrag.gridX,
                gridY: currentDrag.gridY
            };
            
            // Remove clone safely
            if (document.body.contains(currentDrag.element)) {
                document.body.removeChild(currentDrag.element);
            }
            
            // Fire custom event for screen readers
            const dragEndEvent = new CustomEvent('blockdragend', { 
                detail: { blockId: currentDrag.blockId, gridX: currentDrag.gridX, gridY: currentDrag.gridY } 
            });
            document.dispatchEvent(dragEndEvent);
            
            // If block wasn't placed, show original
            if (currentDrag.originalElement) {
                currentDrag.originalElement.style.visibility = 'visible';
            }
            
            // Reset drag state
            const tempDrag = {...currentDrag};
            currentDrag.blockId = null;
            currentDrag.element = null;
            currentDrag.originalElement = null;
            currentDrag.gridX = undefined;
            currentDrag.gridY = undefined;
            
            // Clear any animation frame
            if (movementAnimationFrame) {
                cancelAnimationFrame(movementAnimationFrame);
                movementAnimationFrame = null;
            }
            
            // Clear highlight timeout
            if (highlightTimeout) {
                clearTimeout(highlightTimeout);
                highlightTimeout = null;
            }
            
            // Call the callback
            if (onEndDrag) {
                onEndDrag(dragResult);
            }
            
            return dragResult;
        } catch (error) {
            console.error("Error in endDragging:", error);
            
            // Recovery: ensure original block visibility is restored
            if (currentDrag.originalElement) {
                currentDrag.originalElement.style.visibility = 'visible';
            }
            
            // Clear drag state
            currentDrag.blockId = null;
            currentDrag.element = null;
            currentDrag.originalElement = null;
            currentDrag.gridX = undefined;
            currentDrag.gridY = undefined;
            
            return false;
        }
    }
    
    // Clear current drag state (e.g., on game reset)
    function clearDragState() {
        if (currentDrag.element) {
            if (document.body.contains(currentDrag.element)) {
                document.body.removeChild(currentDrag.element);
            }
            
            if (currentDrag.originalElement) {
                currentDrag.originalElement.style.visibility = 'visible';
            }
        }
        
        // Reset drag state
        currentDrag.blockId = null;
        currentDrag.element = null;
        currentDrag.originalElement = null;
        currentDrag.gridX = undefined;
        currentDrag.gridY = undefined;
        
        // Clear any animation frame
        if (movementAnimationFrame) {
            cancelAnimationFrame(movementAnimationFrame);
            movementAnimationFrame = null;
        }
        
        // Clear highlight timeout
        if (highlightTimeout) {
            clearTimeout(highlightTimeout);
            highlightTimeout = null;
        }
    }
    
    // Utility function: debounce
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    // Utility function: throttle
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Public API
    return {
        startDragging,
        moveDragElement,
        updateGridHighlight,
        endDragging,
        clearDragState,
        
        // Expose the current drag state
        getCurrentDrag: function() {
            return { ...currentDrag };
        }
    };
})();

// Game logic module - Core game mechanics
const GameLogic = (function() {
    'use strict';
    
    // Internal state
    let BLOCKS = {};
    
    // Initialize the game
    function initGame() {
        try {
            // Generate new block shapes
            BLOCKS = BlockGenerator.generateRandomBlockShapes();
            
            // Create UI elements
            UIManager.cacheElements();
            UIManager.createGrid();
            UIManager.generateBlockCSS();
            
            // Initialize game state
            GameState.initGrid();
            const highScore = GameState.loadHighScore();
            UIManager.updateScoreDisplay(0, highScore);
            
            // Set up event listeners
            setupEventListeners();
            
            // Reset the game
            resetGame();
        } catch (error) {
            console.error("Error initializing game:", error);
        }
    }
    
    // Set up event listeners for drag and drop
    function setupEventListeners() {
        try {
            // Set up drag and drop for blocks
            document.querySelectorAll('.block').forEach(block => {
                const blockId = block.id.split('-')[0];
                
                // Mouse events for dragging
                block.addEventListener('mousedown', function(e) {
                    if (!GameState.getAvailableBlocks().includes(blockId) || GameState.gameOver) return;
                    
                    const rect = this.getBoundingClientRect();
                    const offsetX = e.clientX - rect.left;
                    const offsetY = e.clientY - rect.top;
                    
                    DragManager.startDragging(blockId, this, offsetX, offsetY, e.clientX, e.clientY);
                });
                
                // Touch events for mobile
                block.addEventListener('touchstart', function(e) {
                    if (!GameState.getAvailableBlocks().includes(blockId) || GameState.gameOver) return;
                    // e.preventDefault();
                    
                    const touch = e.touches[0];
                    const rect = this.getBoundingClientRect();
                    const offsetX = touch.clientX - rect.left;
                    const offsetY = touch.clientY - rect.top;
                    
                    DragManager.startDragging(blockId, this, offsetX, offsetY, touch.clientX, touch.clientY);
                });
                
                // Keyboard events for accessibility
                block.addEventListener('keydown', function(e) {
                    if (!GameState.getAvailableBlocks().includes(blockId) || GameState.gameOver) return;
                    
                    // Space or Enter to pick up or place
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        
                        // Toggle block selection
                        if (this.classList.contains('keyboard-selected')) {
                            // Try to place at current position (would need grid position tracking)
                            this.classList.remove('keyboard-selected');
                        } else {
                            // Select this block
                            document.querySelectorAll('.block').forEach(b => {
                                b.classList.remove('keyboard-selected');
                            });
                            this.classList.add('keyboard-selected');
                        }
                    }
                    
                    // Arrow keys to move selected block
                    if (this.classList.contains('keyboard-selected')) {
                        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                            e.preventDefault();
                            // Would implement grid navigation here
                        }
                    }
                    
                    // R to rotate block
                    if (e.key === 'r' || e.key === 'R') {
                        e.preventDefault();
                        rotateBlock(blockId);
                    }
                });
            });
            
            // Grid events for dropping blocks
            const gridElement = document.getElementById('grid');
            if (gridElement) {
                gridElement.addEventListener('mouseup', function(e) {
                    const dragInfo = DragManager.endDragging();
                    if (dragInfo && dragInfo.blockId) {
                        // Try to place the block
                        tryPlaceBlock(dragInfo.blockId, dragInfo.gridX, dragInfo.gridY);
                    }
                    
                    UIManager.clearHighlights();
                });
                
                gridElement.addEventListener('touchend', function(e) {
                    const dragInfo = DragManager.endDragging();
                    if (dragInfo && dragInfo.blockId) {
                        // Try to place the block
                        tryPlaceBlock(dragInfo.blockId, dragInfo.gridX, dragInfo.gridY);
                    }
                    
                    UIManager.clearHighlights();
                });
                
                // Keyboard navigation for the grid
                gridElement.addEventListener('keydown', function(e) {
                    // Handle keyboard navigation within the grid
                    // (Would implement a selected cell and movement)
                });
            }
            
            // Global mouse/touch move and up/end events with error protection
            const handleMouseMove = function(e) {
                if (GameState.gameOver) return;
                
                DragManager.moveDragElement(e.clientX, e.clientY);
                DragManager.updateGridHighlight(e.clientX, e.clientY, BLOCKS, UIManager.showPlacementPreview);
            };
            
            const handleTouchMove = function(e) {
                if (GameState.gameOver) return;
                
                const touch = e.touches[0];
                DragManager.moveDragElement(touch.clientX, touch.clientY);
                DragManager.updateGridHighlight(touch.clientX, touch.clientY, BLOCKS, UIManager.showPlacementPreview);
                    // e.preventDefault(); // Prevent scrolling while dragging
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('touchmove', handleTouchMove, { passive: true }); // Important for preventing scrolling
            
            document.addEventListener('mouseup', function() {
                DragManager.endDragging();
                UIManager.clearHighlights();
            });
            
            document.addEventListener('touchend', function() {
                DragManager.endDragging();
                UIManager.clearHighlights();
            });
            
            // Restart button
            const restartButton = document.getElementById('restart-button');
            if (restartButton) {
                restartButton.addEventListener('click', function() {
                    resetGame();
                    UIManager.hideGameOver();
                });
                
                // Keyboard accessibility
                restartButton.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        resetGame();
                        UIManager.hideGameOver();
                    }
                });
            }
        } catch (error) {
            console.error("Error setting up event listeners:", error);
        }
    }
    
    // Reset the game
    function resetGame() {
        try {
            // Generate new block shapes
            BLOCKS = BlockGenerator.generateRandomBlockShapes();
            
            // Reset game state
            GameState.resetGame();
            UIManager.updateScoreDisplay(GameState.score, GameState.highScore);
            
            // Reset grid appearance
            UIManager.updateGridDisplay(GameState.grid);
            
            // Generate new blocks and display them
            const availableBlocks = BlockGenerator.getRandomBlockTypes(3);
            GameState.setAvailableBlocks(availableBlocks);
            UIManager.displayBlocks(availableBlocks, BLOCKS);
            
            // Reset drag state
            DragManager.clearDragState();
            
            // Clear highlights
            UIManager.clearHighlights();
            
            // Update block visual states
            updateBlockVisualState();
        } catch (error) {
            console.error("Error resetting game:", error);
        }
    }
    
    // Rotate a block
    function rotateBlock(blockId) {
        try {
            if (!BLOCKS[blockId]) return;
            
            // Rotate the shape
            BLOCKS[blockId].shape = BlockGenerator.rotateBlockShape(BLOCKS[blockId].shape);
            
            // Update the block appearance
            const blockElement = document.getElementById(blockId + '-block');
            if (blockElement) {
                UIManager.updateBlockAppearance(blockElement, BLOCKS[blockId].shape);
            }
            
            // Update the block's visual state (can it be placed?)
            updateBlockVisualState();
        } catch (error) {
            console.error("Error rotating block:", error, blockId);
        }
    }
    
    // Check if a block can be placed anywhere on the grid
    function checkIfBlockCanBePlaced(blockId) {
        try {
            if (!BLOCKS[blockId]) return false;
            
            const shape = BLOCKS[blockId].shape;
            
            // Try placing at each grid position
            for (let y = 0; y <= GRID_SIZE - shape.length; y++) {
                for (let x = 0; x <= GRID_SIZE - shape[0].length; x++) {
                    let canPlace = true;
                    
                    // Check if shape fits at this position
                    for (let shapeY = 0; shapeY < shape.length && canPlace; shapeY++) {
                        for (let shapeX = 0; shapeX < shape[0].length && canPlace; shapeX++) {
                            if (shape[shapeY][shapeX]) {
                                if (GameState.isOccupied(x + shapeX, y + shapeY)) {
                                    canPlace = false;
                                }
                            }
                        }
                    }
                    
                    // If can place at this position, return true
                    if (canPlace) {
                        return true;
                    }
                }
            }
            
            // No valid placement found for this block
            return false;
        } catch (error) {
            console.error("Error checking if block can be placed:", error);
            return false;
        }
    }
    
    // Check if any of the available blocks can be placed
    function checkIfAnyBlockCanBePlaced() {
        try {
            const availableBlocks = GameState.getAvailableBlocks();
            
            // For each available block
            for (const blockId of availableBlocks) {
                if (checkIfBlockCanBePlaced(blockId)) {
                    return true;
                }
            }
            
            // No blocks can be placed
            return false;
        } catch (error) {
            console.error("Error checking if any block can be placed:", error);
            return false;
        }
    }
    
    // Update the visual state of blocks (can they be placed?)
    function updateBlockVisualState() {
        try {
            const availableBlocks = GameState.getAvailableBlocks();
            
            // Track which blocks can be placed
            const canPlaceMap = {};
            
            // For each available block
            availableBlocks.forEach(blockId => {
                canPlaceMap[blockId] = checkIfBlockCanBePlaced(blockId);
            });
            
            // Update UI
            UIManager.updateBlockVisualState(availableBlocks, canPlaceMap);
            
            return checkIfAnyBlockCanBePlaced();
        } catch (error) {
            console.error("Error updating block visual state:", error);
            return false;
        }
    }
    
    // Try to place block with improved error handling
    function tryPlaceBlock(blockId, gridX, gridY) {
        if (!blockId || !GameState.getAvailableBlocks().includes(blockId)) return false;
        
        try {
            const shape = BLOCKS[blockId].shape;
            const cellClass = BLOCKS[blockId].class;
            
            // Check if placement is valid
            let canPlace = true;
            
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[0].length; x++) {
                    if (shape[y][x]) {
                        const targetX = gridX + x;
                        const targetY = gridY + y;
                        
                        if (GameState.isOccupied(targetX, targetY)) {
                            canPlace = false;
                            break;
                        }
                    }
                }
                
                if (!canPlace) break;
            }
            
            if (canPlace) {
                // Place block on grid
                for (let y = 0; y < shape.length; y++) {
                    for (let x = 0; x < shape[0].length; x++) {
                        if (shape[y][x]) {
                            const targetX = gridX + x;
                            const targetY = gridY + y;
                            
                            // Update grid state
                            GameState.setGridPosition(targetX, targetY, 1);
                            
                            // Update cell appearance
                            const cell = UIManager.getGridCell(targetX, targetY);
                            if (cell) {
                                cell.className = 'cell ' + cellClass;
                            }
                        }
                    }
                }
                
                // Remove block from available blocks AFTER successful placement
                const availableBlocks = GameState.getAvailableBlocks();
                GameState.setAvailableBlocks(availableBlocks.filter(b => b !== blockId));
                
                const blockElement = document.getElementById(blockId + '-block');
                if (blockElement) {
                    blockElement.style.visibility = 'hidden';
                    blockElement.style.display = 'none';
                }
                
                // Check for completed lines 
                setTimeout(() => {
                    const linesCleared = checkForCompletedLines();
                    console.log(`Lines cleared: ${linesCleared}`);
                }, 100);
                
                // Check if any available blocks can be placed
                setTimeout(() => {
                    // If no more blocks, generate new ones
                    if (GameState.getAvailableBlocks().length === 0) {
                        // Check if there's any space at all for new blocks
                        const anyBlockCanBePlaced = Object.keys(BLOCKS).some(blockType => 
                            checkIfBlockCanBePlaced(blockType)
                        );
                        
                        if (!anyBlockCanBePlaced) {
                            // No space for any new blocks, game over
                            console.log("Game over: Grid is full, no space for any blocks");
                            setTimeout(() => {
                                GameState.setGameOver(true);
                                if (typeof window.enhancedShowGameOver === 'function') {
                                    window.enhancedShowGameOver();
                                } else {
                                    UIManager.showGameOver();
                                }
                            }, 300);
                        } else {
                            // Still space for new blocks, generate them
                            setTimeout(generateNewBlocks, 500);
                        }
                    } else {
                        // Check if any of the remaining blocks can be placed
                        const anyRemainingBlockCanBePlaced = GameState.getAvailableBlocks().some(blockId => 
                            checkIfBlockCanBePlaced(blockId)
                        );
                        
                        if (!anyRemainingBlockCanBePlaced) {
                            // No space for any remaining blocks, game over
                            console.log("Game over: No space for any remaining blocks");
                            setTimeout(() => {
                                GameState.setGameOver(true);
                                if (typeof window.enhancedShowGameOver === 'function') {
                                    window.enhancedShowGameOver();
                                } else {
                                    UIManager.showGameOver();
                                }
                            }, 300);
                        }
                    }
                }, 200);
                
                return true;
            } else {
                // Make sure the block is still visible if placement failed
                const blockElement = document.getElementById(blockId + '-block');
                if (blockElement) {
                    blockElement.style.visibility = 'visible';
                    blockElement.style.display = 'grid';
                }
            }
        } catch (error) {
            console.error("Error placing block:", error);
            
            // Recovery: ensure block visibility is restored
            const blockElement = document.getElementById(blockId + '-block');
            if (blockElement) {
                blockElement.style.visibility = 'visible';
                blockElement.style.display = 'grid';
            }
        }
        
        return false;
    }
    
    // Generate new blocks
    function generateNewBlocks() {
        try {
            // Generate new block shapes and select random types
            BLOCKS = BlockGenerator.generateRandomBlockShapes();
            const availableBlocks = BlockGenerator.getRandomBlockTypes(3);
            GameState.setAvailableBlocks(availableBlocks);
            
            // Display the new blocks
            UIManager.displayBlocks(availableBlocks, BLOCKS);
            
            // After blocks have been displayed, update their visual state
            setTimeout(() => {
                updateBlockVisualState();
            }, 700);
        } catch (error) {
            console.error("Error generating new blocks:", error);
        }
    }
    
    // Check for completed lines with improved error handling
    function checkForCompletedLines() {
        try {
            const grid = GameState.grid;
            
            const completedRows = [];
            const completedCols = [];
            
            // Ensure all rows exist and are properly initialized
            for (let y = 0; y < GRID_SIZE; y++) {
                if (!grid[y]) {
                    grid[y] = Array(GRID_SIZE).fill(0);
                } else if (grid[y].length < GRID_SIZE) {
                    // Make sure row has the correct length
                    for (let i = grid[y].length; i < GRID_SIZE; i++) {
                        grid[y][i] = 0;
                    }
                }
            }
            
            // Check rows
            for (let y = 0; y < GRID_SIZE; y++) {
                let rowComplete = true;
                for (let x = 0; x < GRID_SIZE; x++) {
                    if (grid[y][x] !== 1) { // Check explicitly for 1, not just truthy values
                        rowComplete = false;
                        break;
                    }
                }
                
                if (rowComplete) {
                    completedRows.push(y);
                }
            }
            
            // Check columns
            for (let x = 0; x < GRID_SIZE; x++) {
                let colComplete = true;
                
                for (let y = 0; y < GRID_SIZE; y++) {
                    // At this point all rows should exist and be properly initialized
                    // Check explicitly for cell value 1
                    if (grid[y][x] !== 1) {
                        colComplete = false;
                        break;
                    }
                }
                
                if (colComplete) {
                    completedCols.push(x);
                }
            }
            
            // If lines were completed, clear them and award points
            if (completedRows.length > 0 || completedCols.length > 0) {
                const totalLines = completedRows.length + completedCols.length;
                
                // Call the enhanced line clearing effects if available
                if (typeof window.enhancedLineClearing === 'function') {
                    window.enhancedLineClearing(completedRows, completedCols);
                }
                
                // Clear rows
                completedRows.forEach(y => {
                    for (let x = 0; x < GRID_SIZE; x++) {
                        GameState.setGridPosition(x, y, 0);
                        const cell = UIManager.getGridCell(x, y);
                        if (cell) {
                            cell.classList.add('clearing');
                            
                            setTimeout(() => {
                                cell.className = 'cell';
                            }, 300);
                        }
                    }
                });
                
                // Clear columns
                completedCols.forEach(x => {
                    for (let y = 0; y < GRID_SIZE; y++) {
                        GameState.setGridPosition(x, y, 0);
                        const cell = UIManager.getGridCell(x, y);
                        if (cell) {
                            cell.classList.add('clearing');
                            
                            setTimeout(() => {
                                cell.className = 'cell';
                            }, 300);
                        }
                    }
                });
                
                // Award points (10 points per cell cleared)
                const pointsPerLine = GRID_SIZE * 10; // 8 cells × 10 points = 80 points per line
                let totalPoints = totalLines * pointsPerLine;
                
                // Bonus for multiple lines (50% extra per additional line)
                if (totalLines > 1) {
                    totalPoints = Math.floor(totalPoints * (1 + (totalLines - 1) * 0.5));
                }
                
                // Update score
                const scoreInfo = GameState.updateScore(totalPoints);
                UIManager.updateScoreDisplay(scoreInfo.score, scoreInfo.highScore);
                
                // After clearing lines, check if blocks can be placed
                setTimeout(() => {
                    updateBlockVisualState();
                }, 350);
                
                return totalLines;
            }
            
            return 0;
        } catch (error) {
            console.error("Error checking for completed lines:", error);
            return 0;
        }
    }
    
    // Public API
    return {
        initGame,
        resetGame,
        rotateBlock,
        generateNewBlocks,
        checkForCompletedLines
    };
})();

// Initialize game when the DOM is fully loaded
window.addEventListener('load', function() {
    // First generate the CSS
    UIManager.generateBlockCSS();
    
    // Initialize the game after a short delay to ensure DOM is fully processed
    setTimeout(() => {
        GameLogic.initGame();
        
        // Hide loading screen
        setTimeout(() => {
            UIManager.hideLoadingScreen();
        }, 800);
    }, 100);
});

// Direct game hooks for compatibility
window.resetGame = function() {
    console.log("Enhanced resetGame called");
    GameLogic.resetGame();
};

// Setup restart button for direct reset
function setupDirectRestartButton() {
    const restartButton = document.getElementById('restart-button');
    if (!restartButton) return;
    
    restartButton.onclick = function() {
        console.log("Play Again clicked - direct reset");
        
        // Hide game over screen immediately
        const gameOverElement = document.getElementById('game-over');
        if (gameOverElement) {
            gameOverElement.style.visibility = 'hidden';
        }
        
        // Call our enhanced resetGame function
        GameLogic.resetGame();
    };
}

// Make sure the button is set up
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupDirectRestartButton);
} else {
    setupDirectRestartButton();
}

// Also set it up after a delay (in case DOM changes)
setTimeout(setupDirectRestartButton, 1000);