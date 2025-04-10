// Debug Color Effects for Block Blast
// Identifies block shapes and shows available placements

(function() {
    'use strict';
    
    // Debug mode
    const DEBUG = false;
    
    // Helper function for logging
    function log(message) {
        if (DEBUG) console.log('%c[ColorFX]', 'color: #ff6600; font-weight: bold;', message);
    }
    
    log('Starting Debug Color Effects module');
    
    // Keep track of original functions
    let originalCheckForCompletedLines = null;
    
    // Grid element reference
    let gridElement = null;
    
    // Constants
    const GRID_SIZE = 8;
    
    // Store original classes
    const originalClasses = new Map();
    
    // Define all possible shape types just like in BlockGenerator
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
    
    // Map block colors to shape names for better logging
    const SHAPE_NAMES = {
        0: "Single cell",
        1: "Horizontal line (2 cells)",
        2: "Vertical line (2 cells)",
        3: "Small square (2x2)",
        4: "L shape",
        5: "Reverse L shape",
        6: "Horizontal line (3 cells)",
        7: "Vertical line (3 cells)",
        8: "T shape",
        9: "Plus shape",
        10: "Z shape",
        11: "S shape",
        12: "Rectangle (3x2)",
        13: "U shape"
    };
    
    // Get nearby empty cells at a grid position
    function getEmptyCellsAround(gridX, gridY, radius = 1) {
        const emptyCells = [];
        
        for (let y = gridY - radius; y <= gridY + radius; y++) {
            for (let x = gridX - radius; x <= gridX + radius; x++) {
                // Skip out of bounds
                if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) continue;
                
                // If the cell is empty, add it to the list
                if (!isCellOccupied(x, y)) {
                    emptyCells.push({ x, y });
                }
            }
        }
        
        return emptyCells;
    }
    
    // Get cell from grid
    function getCell(x, y) {
        if (!gridElement) {
            gridElement = document.getElementById('grid');
            if (!gridElement) return null;
        }
        
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return null;
        
        const index = y * GRID_SIZE + x;
        if (index >= 0 && index < gridElement.children.length) {
            return gridElement.children[index];
        }
        
        return null;
    }
    
    // Get all cells in a row
    function getRowCells(rowIndex) {
        const cells = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = getCell(x, rowIndex);
            if (cell) cells.push(cell);
        }
        return cells;
    }
    
    // Get all cells in a column
    function getColumnCells(colIndex) {
        const cells = [];
        for (let y = 0; y < GRID_SIZE; y++) {
            const cell = getCell(colIndex, y);
            if (cell) cells.push(cell);
        }
        return cells;
    }
    
    // Check if a cell is occupied (has a color)
    function isCellOccupied(x, y) {
        const cell = getCell(x, y);
        return cell && cell.className.includes('-cell');
    }
    
    // Visualize a block shape in the console
    function logBlockShape(shape) {
        if (!shape || !shape.length) return;
        
        let shapeStr = '';
        for (let y = 0; y < shape.length; y++) {
            let row = '';
            for (let x = 0; x < shape[0].length; x++) {
                row += shape[y][x] ? '■ ' : '□ ';
            }
            shapeStr += row + '\n';
        }
        
        console.log(shapeStr);
    }
    
    // Get the current block ID
    function getCurrentBlockId() {
        if (window.currentDrag && window.currentDrag.blockId) {
            return window.currentDrag.blockId;
        }
        return null;
    }
    
    // Try to get the correct block shape for a given block ID
    function getBlockShape(blockId) {
        // First, try to get shape from BLOCKS object (game state)
        if (window.BLOCKS && window.BLOCKS[blockId] && window.BLOCKS[blockId].shape) {
            const shape = window.BLOCKS[blockId].shape;
            return { shape, index: -1, name: 'Custom' };
        }
        
        // Extract color from blockId
        const color = blockId.split('-')[0];
        log(`Block color: ${color}`);
        
        // Try to determine shape from the element's structure
        if (window.currentDrag && window.currentDrag.originalElement) {
            const element = window.currentDrag.originalElement;
            const cells = element.querySelectorAll('.block-cell');
            const cellCount = cells.length;
            
            log(`Block ${blockId} has ${cellCount} cells`);
            
            // Try to determine block position and shape based on cell positions
            if (cellCount > 1) {
                const cellPositions = [];
                let minX = Infinity, minY = Infinity;
                
                // Get relative positions of all cells
                cells.forEach(cell => {
                    const rect = cell.getBoundingClientRect();
                    cellPositions.push({ x: rect.left, y: rect.top });
                    minX = Math.min(minX, rect.left);
                    minY = Math.min(minY, rect.top);
                });
                
                // Normalize positions relative to the top-left cell
                const normalizedPositions = cellPositions.map(pos => {
                    return {
                        x: Math.round((pos.x - minX) / 20), // Assuming cell width is approximately 20px
                        y: Math.round((pos.y - minY) / 20)  // Assuming cell height is approximately 20px
                    };
                });
                
                // Find the dimensions
                let maxX = 0, maxY = 0;
                normalizedPositions.forEach(pos => {
                    maxX = Math.max(maxX, pos.x);
                    maxY = Math.max(maxY, pos.y);
                });
                
                // Create an empty shape grid
                const width = maxX + 1;
                const height = maxY + 1;
                const shape = Array(height).fill().map(() => Array(width).fill(0));
                
                // Fill in the cells
                normalizedPositions.forEach(pos => {
                    shape[pos.y][pos.x] = 1;
                });
                
                log(`Detected shape with dimensions ${width}x${height}:`);
                logBlockShape(shape);
                
                // Try to match with known shapes
                for (let i = 0; i < SHAPE_TYPES.length; i++) {
                    const knownShape = SHAPE_TYPES[i];
                    if (shape.length === knownShape.length && shape[0].length === knownShape[0].length) {
                        let match = true;
                        for (let y = 0; y < shape.length; y++) {
                            for (let x = 0; x < shape[0].length; x++) {
                                if (shape[y][x] !== knownShape[y][x]) {
                                    match = false;
                                    break;
                                }
                            }
                            if (!match) break;
                        }
                        
                        if (match) {

                            return { shape: knownShape, index: i, name: SHAPE_NAMES[i] };
                        }
                    }
                }
                
                // If we got here, it's a custom shape
                return { shape, index: -1, name: 'Custom' };
            }
            
            // Simple cases based on cell count
            if (cellCount === 1) {
                
                return { shape: SHAPE_TYPES[0], index: 0, name: SHAPE_NAMES[0] };
            } else if (cellCount === 4) {
                if (color === 'purple') {
                    // Purple is often a Z shape in this game
                  
                    return { shape: SHAPE_TYPES[10], index: 10, name: SHAPE_NAMES[10] };
                } else {
                  
                    return { shape: SHAPE_TYPES[3], index: 3, name: SHAPE_NAMES[3] };
                }
            }
        }
        
        // Default fallback based on color
        switch (color) {
            case 'yellow':
                return { shape: SHAPE_TYPES[2], index: 2, name: SHAPE_NAMES[2] };
            case 'purple':
                return { shape: SHAPE_TYPES[10], index: 10, name: SHAPE_NAMES[10] };
            case 'blue':
            
                return { shape: SHAPE_TYPES[7], index: 7, name: SHAPE_NAMES[7] };
            case 'green':
      
                return { shape: SHAPE_TYPES[0], index: 0, name: SHAPE_NAMES[0] };
            case 'red':
   
                return { shape: SHAPE_TYPES[3], index: 3, name: SHAPE_NAMES[3] };
            default:
    
                return { shape: SHAPE_TYPES[0], index: 0, name: SHAPE_NAMES[0] };
        }
    }
    
    // Get color from cell
    function getColorFromCell(cell) {
        if (!cell) return null;
        
        const cellClasses = cell.className.split(' ');
        for (const cls of cellClasses) {
            if (cls.endsWith('-cell')) {
                return cls.split('-')[0];
            }
        }
        
        return null;
    }
    
    // Get color from block ID
    function getColorFromBlockId(blockId) {
        if (!blockId) return null;
        return blockId.split('-')[0];
    }
    
    // Apply color to cells
    function applyColorToCells(cells, color, isPreview = false) {
        if (!cells || cells.length === 0 || !color) return;
        
        cells.forEach(cell => {
            // Only change cells that already have color
            if (!cell.className.includes('-cell')) return;
            
            // Store original class
            // if (!originalClasses.has(cell)) {
            //     originalClasses.set(cell, cell.className);
            // }
            
            //new update
            if (isPreview) {
                // Store original class
                if (!originalClasses.has(cell)) {
                    originalClasses.set(cell, cell.className);
                }
            }
            
            // Apply the appropriate class
            const className = isPreview ? 
                `cell ${color}-cell potential-completion` : 
                `cell ${color}-cell pre-clearing`;
                
            cell.className = className;
        });
    }
    
    // Restore original cell classes
    function restoreOriginalClasses() {
        originalClasses.forEach((className, cell) => {
            cell.className = className;
        });
        originalClasses.clear();
    }
    
    // Create a virtual grid with current state
    function createGridSnapshot() {
        const grid = [];
        
        for (let y = 0; y < GRID_SIZE; y++) {
            grid[y] = [];
            for (let x = 0; x < GRID_SIZE; x++) {
                grid[y][x] = isCellOccupied(x, y) ? 1 : 0;
            }
        }
        
        return grid;
    }
    
    // Calculate block placement based on shape and cursor position
   
    function calculatePlacement(gridX, gridY, blockInfo) {
        const shape = blockInfo.shape;
        const width = shape[0].length;
        const height = shape.length;
        
        log(`Block shape info: ${blockInfo.name}, dimensions: ${width}x${height}`);
        
        // Tìm ô chiếm đầu tiên trong shape
        let firstOccupiedX = 0, firstOccupiedY = 0;
        let found = false;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (shape[y][x] === 1) {
                    firstOccupiedX = x;
                    firstOccupiedY = y;
                    found = true;
                    break;
                }
            }
            if (found) break;
        }

        // Đặt placement là ô chiếm đầu tiên
        const placementX = gridX;
        const placementY = gridY;
        
        log(`Placement at (${placementX}, ${placementY}) for ${blockInfo.name}`);
        return { x: placementX, y: placementY, offsetX: firstOccupiedX, offsetY: firstOccupiedY };
    }


    // Check if placing a block would complete any rows or columns
    // function checkPotentialCompletions(gridX, gridY) {
    //     // Get the current block ID
    //     const blockId = getCurrentBlockId();
    //     if (!blockId) {
    //         log('No current block being dragged');
    //         return { valid: false, rows: [], cols: [] };
    //     }
        
    //     // Get block shape info
    //     const blockInfo = getBlockShape(blockId);
    //     if (!blockInfo || !blockInfo.shape || !blockInfo.shape.length) {
    //         log(`No shape found for ${blockId}`);
    //         return { valid: false, rows: [], cols: [] };
    //     }
        
        
    //     // Calculate placement
    //     const placement = calculatePlacement(gridX, gridY, blockInfo);        
    //     // Create a copy of the current grid
    //     const grid = createGridSnapshot();
        
    //     // Placement validity check and track affected cells
    //     let placementValid = true;
    //     const shapeCells = [];
        
    //     // Log the empty cells around the cursor for debugging
    //     const emptyCells = getEmptyCellsAround(gridX, gridY, 2);
    //     log(`Empty cells around (${gridX}, ${gridY}):`);
    //     log(emptyCells.map(c => `(${c.x}, ${c.y})`).join(', '));
        
    //     // Check each cell of the block shape
    //     for (let y = 0; y < blockInfo.shape.length; y++) {
    //         for (let x = 0; x < blockInfo.shape[0].length; x++) {
    //             if (blockInfo.shape[y][x]) {
    //                 const targetX = placement.x + x;
    //                 const targetY = placement.y + y;
                    
    //                 // Check if out of bounds
    //                 if (targetX < 0 || targetX >= GRID_SIZE || targetY < 0 || targetY >= GRID_SIZE) {
    //                     log(`Invalid placement: Out of bounds at (${targetX}, ${targetY})`);
    //                     placementValid = false;
    //                     break;
    //                 }
                    
    //                 // Check if already occupied
    //                 if (grid[targetY][targetX] === 1) {
    //                     log(`Invalid placement: Cell (${targetX}, ${targetY}) already occupied`);
    //                     placementValid = false;
    //                     break;
    //                 }
                    
    //                 // Valid cell, track it
    //                 shapeCells.push({ x: targetX, y: targetY });
                    
    //                 // Mark as filled in our simulation
    //                 grid[targetY][targetX] = 1;
    //             }
    //         }
            
    //         if (!placementValid) break;
    //     }
        
    //     // If placement isn't valid, return early
    //     if (!placementValid) {
    //         return { valid: false, rows: [], cols: [] };
    //     }
        
    //     // Affected rows and columns
    //     const affectedRows = [];
    //     const affectedCols = [];
        
    //     // Track which rows and columns are affected by this placement
    //     shapeCells.forEach(cell => {
    //         if (!affectedRows.includes(cell.y)) {
    //             affectedRows.push(cell.y);
    //         }
    //         if (!affectedCols.includes(cell.x)) {
    //             affectedCols.push(cell.x);
    //         }
    //     });
        
    //     // Check which rows and columns would be completed
    //     const completedRows = [];
    //     const completedCols = [];
        
    //     // Check affected rows
    //     affectedRows.forEach(rowIndex => {
    //         let rowComplete = true;
    //         for (let x = 0; x < GRID_SIZE; x++) {
    //             if (grid[rowIndex][x] !== 1) {
    //                 rowComplete = false;
    //                 break;
    //             }
    //         }
    //         if (rowComplete) {
    //             completedRows.push(rowIndex);
    //             log(`Row ${rowIndex} would be completed exactly`);
    //         }
    //     });
        
    //     // Check affected columns
    //     affectedCols.forEach(colIndex => {
    //         let colComplete = true;
    //         for (let y = 0; y < GRID_SIZE; y++) {
    //             if (grid[y][colIndex] !== 1) {
    //                 colComplete = false;
    //                 break;
    //             }
    //         }
    //         if (colComplete) {
    //             completedCols.push(colIndex);
    //             log(`Column ${colIndex} would be completed exactly`);
    //         }
    //     });
        
    //     return { 
    //         valid: placementValid, 
    //         rows: completedRows, 
    //         cols: completedCols,
    //         cells: shapeCells,
    //         placement
    //     };
    // }
    
    function checkPotentialCompletions(gridX, gridY) {
        const blockId = getCurrentBlockId();
        if (!blockId) {
            log('No current block being dragged');
            return { valid: false, rows: [], cols: [] };
        }
        
        const blockInfo = getBlockShape(blockId);
        if (!blockInfo || !blockInfo.shape || !blockInfo.shape.length) {
            log(`No shape found for ${blockId}`);
            return { valid: false, rows: [], cols: [] };
        }
        
        log(`Shape for ${blockId}: ${blockInfo.name}`);
        
        const placement = calculatePlacement(gridX, gridY, blockInfo);
        log(`Calculated placement at (${placement.x}, ${placement.y}) for block ${blockId}`);
        
        const grid = createGridSnapshot();
        
        let placementValid = true;
        const shapeCells = [];
        
        const emptyCells = getEmptyCellsAround(gridX, gridY, 2);
        log(`Empty cells around (${gridX}, ${gridY}): ${emptyCells.map(c => `(${c.x}, ${c.y})`).join(', ')}`);
        
        // Kiểm tra ô tại placement (placement giờ là ô chiếm)
        if (grid[placement.y][placement.x] === 1) {
            log(`Invalid placement: Placement cell (${placement.x}, ${placement.y}) already occupied`);
            placementValid = false;
        }
        
        if (placementValid) {
            for (let y = 0; y < blockInfo.shape.length; y++) {
                for (let x = 0; x < blockInfo.shape[0].length; x++) {
                    if (blockInfo.shape[y][x]) {
                        const targetX = placement.x + (x - placement.offsetX);
                        const targetY = placement.y + (y - placement.offsetY);
                        
                        if (targetX < 0 || targetX >= GRID_SIZE || targetY < 0 || targetY >= GRID_SIZE) {
                            log(`Invalid placement: Out of bounds at (${targetX}, ${targetY})`);
                            placementValid = false;
                            break;
                        }
                        
                        if (grid[targetY][targetX] === 1) {
                            log(`Invalid placement: Cell (${targetX}, ${targetY}) already occupied`);
                            placementValid = false;
                            break;
                        }
                        
                        shapeCells.push({ x: targetX, y: targetY });
                        grid[targetY][targetX] = 1;
                    }
                }
                if (!placementValid) break;
            }
        }
        
        if (!placementValid) return { valid: false, rows: [], cols: [] };
        
        const affectedRows = [];
        const affectedCols = [];
        
        shapeCells.forEach(cell => {
            if (!affectedRows.includes(cell.y)) affectedRows.push(cell.y);
            if (!affectedCols.includes(cell.x)) affectedCols.push(cell.x);
        });
        
        const completedRows = [];
        const completedCols = [];
        
        affectedRows.forEach(rowIndex => {
            let rowComplete = true;
            for (let x = 0; x < GRID_SIZE; x++) {
                if (grid[rowIndex][x] !== 1) {
                    rowComplete = false;
                    break;
                }
            }
            if (rowComplete) {
                completedRows.push(rowIndex);
                log(`Row ${rowIndex} would be completed`);
            }
        });
        
        affectedCols.forEach(colIndex => {
            let colComplete = true;
            for (let y = 0; y < GRID_SIZE; y++) {
                if (grid[y][colIndex] !== 1) {
                    colComplete = false;
                    break;
                }
            }
            if (colComplete) {
                completedCols.push(colIndex);
                log(`Column ${colIndex} would be completed`);
            }
        });
        
        log(`Debug: Placement valid with ${completedRows.length} rows and ${completedCols.length} cols completed`);
        return { 
            valid: placementValid, 
            rows: completedRows, 
            cols: completedCols,
            cells: shapeCells,
            placement
        };
    }

    
    // Handle mouse movement for preview
    function handleMouseMove(e) {
        // Restore original classes
        restoreOriginalClasses();
        
        // Only proceed if we have an active drag
        if (!window.currentDrag || !window.currentDrag.blockId) {
            return;
        }
        
        try {
            // Ensure grid element is available
            if (!gridElement) {
                gridElement = document.getElementById('grid');
                if (!gridElement) return;
            }
            
            // Get block color and id
            const blockId = window.currentDrag.blockId;
            const color = getColorFromBlockId(blockId);
            
            if (!color) {
                log('No color found for block: ' + blockId);
                return;
            }
            
            // Get mouse position relative to grid
            const rect = gridElement.getBoundingClientRect();
            const mouseX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
            const mouseY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
            
            // Only proceed if mouse is over grid
            if (mouseX < rect.left || mouseX > rect.right || mouseY < rect.top || mouseY > rect.bottom) {
                return;
            }
            
            // Calculate grid position
            const cellSize = rect.width / GRID_SIZE;
            const gridX = Math.floor((mouseX - rect.left) / cellSize);
            const gridY = Math.floor((mouseY - rect.top) / cellSize);
            
            log(`Mouse over grid at (${gridX}, ${gridY})`);
            
            // Check if the placement is valid and would complete any rows or columns
            const result = checkPotentialCompletions(gridX, gridY);
            
            log(`Valid: ${result.valid}, Completions: ${result.rows.length} rows, ${result.cols.length} columns`);
            
            //If DEBUG mode, visualize the placement
            if (DEBUG && result.valid) {
                result.cells.forEach(cell => {
                    const cellElem = getCell(cell.x, cell.y);
                    if (cellElem) {
                        cellElem.style.outline = '2px dashed yellow';
                        setTimeout(() => {
                            cellElem.style.outline = '';
                        }, 100);
                    }
                });
            }
            
            // Only change colors if placement is valid and would complete lines
            if (result.valid && (result.rows.length > 0 || result.cols.length > 0)) {
                // Change color of cells in completed rows
                result.rows.forEach(rowIndex => {
                    const cells = getRowCells(rowIndex);
                    applyColorToCells(cells, color, true);
                });
                
                // Change color of cells in completed columns (avoiding duplicates)
                result.cols.forEach(colIndex => {
                    const cells = getColumnCells(colIndex).filter(cell => {
                        // Skip cells in completed rows to avoid changing them twice
                        const cellIndex = Array.from(gridElement.children).indexOf(cell);
                        const y = Math.floor(cellIndex / GRID_SIZE);
                        return !result.rows.includes(y);
                    });
                    
                    applyColorToCells(cells, color, true);
                });
            }
        } catch (error) {
            console.error('Error in handleMouseMove:', error);
            restoreOriginalClasses();
        }
    }
    
    //Enhanced line clearing with color change
    function enhancedCheckForCompletedLines() {
        log('Enhanced checkForCompletedLines called');
        
        try {
            // Find completed rows and columns
            const completedRows = [];
            const completedCols = [];
            
            // Check rows
            for (let y = 0; y < GRID_SIZE; y++) {
                let rowComplete = true;
                for (let x = 0; x < GRID_SIZE; x++) {
                    if (!isCellOccupied(x, y)) {
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
                    if (!isCellOccupied(x, y)) {
                        colComplete = false;
                        break;
                    }
                }
                if (colComplete) {
                    completedCols.push(x);
                }
            }
            
            // Total completed lines
            const totalCompletions = completedRows.length + completedCols.length;
            
            // If there are completions, apply color change effect
            if (totalCompletions > 0) {
                log(`Found completions: ${completedRows.length} rows, ${completedCols.length} columns`);
                
                // Find dominant color
                const colorCounts = {};
                let dominantColor = null;
                
                // Check rows
                completedRows.forEach(rowIndex => {
                    const cells = getRowCells(rowIndex);
                    cells.forEach(cell => {
                        const color = getColorFromCell(cell);
                        if (color) {
                            colorCounts[color] = (colorCounts[color] || 0) + 1;
                            if (!dominantColor || colorCounts[color] > colorCounts[dominantColor]) {
                                dominantColor = color;
                            }
                        }
                    });
                });
                
                // Check columns
                completedCols.forEach(colIndex => {
                    const cells = getColumnCells(colIndex);
                    cells.forEach(cell => {
                        const color = getColorFromCell(cell);
                        if (color) {
                            colorCounts[color] = (colorCounts[color] || 0) + 1;
                            if (!dominantColor || colorCounts[color] > colorCounts[dominantColor]) {
                                dominantColor = color;
                            }
                        }
                    });
                });
                
                log(`Dominant color: ${dominantColor}`);
                
                if (dominantColor) {
                    // Apply color change
                    const cellsToChange = [];
                    
                    // Add cells from completed rows
                    completedRows.forEach(rowIndex => {
                        const cells = getRowCells(rowIndex);
                        cellsToChange.push(...cells);
                    });
                    
                    // Add cells from completed columns (avoiding duplicates)
                    completedCols.forEach(colIndex => {
                        const cells = getColumnCells(colIndex);
                        cells.forEach(cell => {
                            const index = Array.from(gridElement.children).indexOf(cell);
                            const y = Math.floor(index / GRID_SIZE);
                            if (!completedRows.includes(y)) {
                                cellsToChange.push(cell);
                            }
                        });
                    });
                    
                    // Apply color change
                    applyColorToCells(cellsToChange, dominantColor, false);
                    
                    
                    // Add clearing animation after a delay
                    setTimeout(() => {
                        const cellsToAnimate = document.querySelectorAll('.pre-clearing');
                        
                        cellsToAnimate.forEach(cell => {
                            cell.classList.remove('pre-clearing');
                            cell.classList.add('clearing');
                        });
                        
                        // Call original function after animation
                        setTimeout(() => {
                            if (originalCheckForCompletedLines) {
                                originalCheckForCompletedLines();
                            }
                        }, 400);
                    }, 200);
                    
                    return totalCompletions;
                }
            }
            
            // Fall back to original function
            if (originalCheckForCompletedLines) {
                return originalCheckForCompletedLines();
            }
            
            return 0;
        } catch (error) {
            console.error('Error in enhancedCheckForCompletedLines:', error);
            if (originalCheckForCompletedLines) {
                return originalCheckForCompletedLines();
            }
            return 0;
        }
    }
    
    
    // Add CSS styles
    function addStyles() {
        const styleId = 'debug-effects-style';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .potential-completion {
                filter: brightness(1.5) !important;
                animation: color-pulse 0.8s infinite alternate !important;
                z-index: 10 !important;
            }
            
            .pre-clearing {
                filter: brightness(1.3) !important;
                transform: scale(1.05) !important;
                z-index: 5 !important;
                transition: all 0.2s ease !important;
            }
            
            @keyframes color-pulse {
                0% { filter: brightness(1.3); }
                100% { filter: brightness(1.7); }
            }
            
            .clearing {
                animation: clear-animation 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
                z-index: 5 !important;
            }
            
            @keyframes clear-animation {
                0% { transform: scale(1.05); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.8; }
                100% { transform: scale(0); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        log('Added styles');
    }
    
    // Initialize the module
    function init() {
        log('Initializing...');
        
        // Get grid element
        gridElement = document.getElementById('grid');
        if (!gridElement) {
            log('Grid element not found, will try again later');
            setTimeout(init, 500);
            return;
        }
        
        // Add styles
        addStyles();
        
        // Hook checkForCompletedLines
        if (window.checkForCompletedLines) {
            originalCheckForCompletedLines = window.checkForCompletedLines;
            window.checkForCompletedLines = enhancedCheckForCompletedLines;
            log('Successfully overrode window.checkForCompletedLines');
        } else if (window.GameLogic && window.GameLogic.checkForCompletedLines) {
            originalCheckForCompletedLines = window.GameLogic.checkForCompletedLines;
            window.GameLogic.checkForCompletedLines = enhancedCheckForCompletedLines;
            log('Successfully overrode GameLogic.checkForCompletedLines');
        } else {
            log('checkForCompletedLines not found, only preview effects might work');
        }
        
        // Add event listeners
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('touchmove', handleMouseMove);
        
        // Add listeners to restore classes
        document.addEventListener('mouseup', restoreOriginalClasses);
        document.addEventListener('touchend', restoreOriginalClasses);
        
        log('Initialization complete');
    }
    
    // Expose functions for debugging
    window.debugColorEffects = {
        getBlockShape,
        checkPotentialCompletions,
        getEmptyCellsAround,
        calculatePlacement,
        enhancedCheckForCompletedLines,
        restoreOriginalClasses
    };
    
    // Start when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 500);
    }

    // Function to log and visualize block cells
function logBlockCells(blockInfo, placement) {
    if (!blockInfo || !blockInfo.shape || !placement) {
        log("Cannot log block cells: Invalid block info or placement");
        return;
    }
    
    const shape = blockInfo.shape;
    const width = shape[0].length;
    const height = shape.length;
    
    log(`Logging cells for ${blockInfo.name} (index: ${blockInfo.index}) at position (${placement.x}, ${placement.y}):`);
    
    // Create a visual representation of the block in the grid
    const gridVisual = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill('⬜'));
    const occupiedCells = [];
    
    // Mark cells on the grid
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (shape[y][x]) {
                const gridX = placement.x + x;
                const gridY = placement.y + y;
                
                // Check if within grid bounds
                if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE) {
                    gridVisual[gridY][gridX] = '🟦'; // Fill in occupied cells
                    occupiedCells.push({ x: gridX, y: gridY });
                } else {
                    // Mark out of bounds cells with red
                    log(`Cell (${gridX}, ${gridY}) is out of bounds!`);
                }
            }
        }
    }
    
    // Print the grid visualization
    let gridStr = "  ";
    for (let x = 0; x < GRID_SIZE; x++) {
        gridStr += x + " ";
    }
    gridStr += "\n";
    
    for (let y = 0; y < GRID_SIZE; y++) {
        gridStr += y + " ";
        for (let x = 0; x < GRID_SIZE; x++) {
            gridStr += gridVisual[y][x];
        }
        gridStr += "\n";
    }
    
    log(gridStr);
    log(`Total occupied cells: ${occupiedCells.length}`);
    log(`Occupied cell coordinates: ${occupiedCells.map(c => `(${c.x},${c.y})`).join(', ')}`);
    
    return occupiedCells;
}

// Modify checkPotentialCompletions to include visualization
function checkPotentialCompletions(gridX, gridY) {
    // Get the current block ID
    const blockId = getCurrentBlockId();
    if (!blockId) {
        log('No current block being dragged');
        return { valid: false, rows: [], cols: [] };
    }
    
    // Get block shape info
    const blockInfo = getBlockShape(blockId);
    if (!blockInfo || !blockInfo.shape || !blockInfo.shape.length) {
        log(`No shape found for ${blockId}`);
        return { valid: false, rows: [], cols: [] };
    }
    
    log(`Shape for ${blockId}: ${blockInfo.name}`);
    
    // Calculate placement
    const placement = calculatePlacement(gridX, gridY, blockInfo);
    
    log(`Calculated placement at (${placement.x}, ${placement.y}) for block ${blockId}`);
    
    // Visualize the block cells
    logBlockCells(blockInfo, placement);
    
    // Continue with the original function...
    const grid = createGridSnapshot();
    
    // Placement validity check and track affected cells
    let placementValid = true;
    const shapeCells = [];
    
    // Log the empty cells around the cursor for debugging
    const emptyCells = getEmptyCellsAround(gridX, gridY, 2);
    log(`Empty cells around (${gridX}, ${gridY}):`);
    log(emptyCells.map(c => `(${c.x}, ${c.y})`).join(', '));
    
    // Check each cell of the block shape
    for (let y = 0; y < blockInfo.shape.length; y++) {
        for (let x = 0; x < blockInfo.shape[0].length; x++) {
            if (blockInfo.shape[y][x]) {
                const targetX = placement.x + x;
                const targetY = placement.y + y;
                
                // Check if out of bounds
                if (targetX < 0 || targetX >= GRID_SIZE || targetY < 0 || targetY >= GRID_SIZE) {
                    log(`Invalid placement: Out of bounds at (${targetX}, ${targetY})`);
                    placementValid = false;
                    break;
                }
                
                // Check if already occupied
                if (grid[targetY][targetX] === 1) {
                    log(`Invalid placement: Cell (${targetX}, ${targetY}) already occupied`);
                    placementValid = false;
                    break;
                }
                
                // Valid cell, track it
                shapeCells.push({ x: targetX, y: targetY });
                
                // Mark as filled in our simulation
                grid[targetY][targetX] = 1;
            }
        }
        
        if (!placementValid) break;
    }
    
    // If placement isn't valid, return early
    if (!placementValid) {
        return { valid: false, rows: [], cols: [] };
    }
    
    // Affected rows and columns
    const affectedRows = [];
    const affectedCols = [];
    
    // Track which rows and columns are affected by this placement
    shapeCells.forEach(cell => {
        if (!affectedRows.includes(cell.y)) {
            affectedRows.push(cell.y);
        }
        if (!affectedCols.includes(cell.x)) {
            affectedCols.push(cell.x);
        }
    });
    
    // Check which rows and columns would be completed
    const completedRows = [];
    const completedCols = [];
    
    // Check affected rows
    affectedRows.forEach(rowIndex => {
        let rowComplete = true;
        for (let x = 0; x < GRID_SIZE; x++) {
            if (grid[rowIndex][x] !== 1) {
                rowComplete = false;
                break;
            }
        }
        if (rowComplete) {
            completedRows.push(rowIndex);
            log(`Row ${rowIndex} would be completed exactly`);
        }
    });
    
    // Check affected columns
    affectedCols.forEach(colIndex => {
        let colComplete = true;
        for (let y = 0; y < GRID_SIZE; y++) {
            if (grid[y][colIndex] !== 1) {
                colComplete = false;
                break;
            }
        }
        if (colComplete) {
            completedCols.push(colIndex);
            log(`Column ${colIndex} would be completed exactly`);
        }
    });
    
    return { 
        valid: placementValid, 
        rows: completedRows, 
        cols: completedCols,
        cells: shapeCells,
        placement
    };
}
})();