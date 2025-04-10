
        document.addEventListener('DOMContentLoaded', function() {
            // Wait for game to initialize
            setTimeout(function() {
                console.log("Adding direct touch handling");
                
                // Add direct touch end handler to the document
                document.addEventListener('touchend', function(e) {
                    console.log("Touch end detected");
                    
                    // Check if we're in an active drag
                    if (window.currentDrag && window.currentDrag.blockId) {
                        console.log("Active drag detected on touchend");
                        
                        // Get grid element
                        const grid = document.getElementById('grid');
                        if (!grid) return;
                        
                        // Get grid position
                        const gridRect = grid.getBoundingClientRect();
                        
                        // Get last touch position
                        const lastTouch = e.changedTouches[0];
                        const touchX = lastTouch.clientX;
                        const touchY = lastTouch.clientY;
                        
                        // Check if touch ended over grid
                        if (touchX >= gridRect.left && touchX <= gridRect.right && 
                            touchY >= gridRect.top && touchY <= gridRect.bottom) {
                            
                            console.log("Touch ended over grid");
                            
                            // Calculate grid cell position
                            const GRID_SIZE = 8;
                            const cellSize = gridRect.width / GRID_SIZE;
                            
                            const relX = touchX - gridRect.left;
                            const relY = touchY - gridRect.top;
                            
                            const gridX = Math.floor(relX / cellSize);
                            const gridY = Math.floor(relY / cellSize);
                            
                            console.log(`Grid position: ${gridX}, ${gridY}`);
                            
                            // Get block ID
                            const blockId = window.currentDrag.blockId;
                            console.log(`Block ID: ${blockId}`);
                            
                            // Try to place block
                            // Method 1: Try using GameLogic directly
                            if (window.GameLogic && window.GameLogic.tryPlaceBlock) {
                                console.log("Using GameLogic.tryPlaceBlock");
                                window.GameLogic.tryPlaceBlock(blockId, gridX, gridY);
                            } 
                            // Method 2: Forward to the game's event handler
                            else {
                                console.log("Creating synthetic mouseup event");
                                // Create a synthetic mouseup event
                                const event = new MouseEvent('mouseup', {
                                    bubbles: true,
                                    cancelable: true,
                                    clientX: touchX,
                                    clientY: touchY
                                });
                                
                                // Dispatch event on grid
                                grid.dispatchEvent(event);
                            }
                        }
                        
                        // End dragging regardless
                        if (window.DragManager && window.DragManager.endDragging) {
                            window.DragManager.endDragging();
                        }
                        
                        // Show the original block
                        if (window.currentDrag.originalElement) {
                            window.currentDrag.originalElement.style.visibility = 'visible';
                        }
                        
                        // Clear drag state manually as backup
                        window.currentDrag.blockId = null;
                        window.currentDrag.element = null;
                        window.currentDrag.originalElement = null;
                        window.currentDrag.gridX = undefined;
                        window.currentDrag.gridY = undefined;
                    }
                }, true);
                
            }, 2000); // Give game time to initialize
        });
        