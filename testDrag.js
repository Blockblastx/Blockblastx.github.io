/**
 * Block Blast - Drag Fix for Responsive Layouts
 * 
 * This file fixes the dragging of blocks in responsive layouts.
 * The drop functionality is now handled by the main implementation.
 */

// Immediately-invoked function expression to avoid polluting the global namespace
(function() {
    'use strict';
    
    // Wait for the document to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log("Drag fix patch loaded");
        
        // Make sure the game is initialized before attempting to patch
        let checkInterval = setInterval(function() {
            // Check if the main drag manager has been initialized
            if (window.currentDrag) {
                console.log("Main game detected, applying drag fix");
                applyDragFix();
                clearInterval(checkInterval);
            }
        }, 500);
    });
    
    // Apply drag fix by patching the DragManager functions
    function applyDragFix() {
        try {
            console.log("Starting to apply drag fix");
            
            // Patch the startDragging function
            patchStartDragging();
            
            // Patch the moveDragElement function
            patchMoveDragElement();
            
            // Fix touch event handling
            patchTouchHandlers();
            
            console.log("Drag fix applied successfully");
        } catch (e) {
            console.error("Failed to apply drag fix:", e);
        }
    }
    
    // Patch the startDragging function
    function patchStartDragging() {
        window.DragManager = window.DragManager || {};
        
        const originalStartDragging = window.DragManager.startDragging;
        window.DragManager.startDragging = function(blockId, element, offsetX, offsetY, clientX, clientY) {
            console.log("Using patched startDragging function");
            
            // If there's already an ongoing drag operation, clean it up first
            if (window.currentDrag.element) {
                window.DragManager.endDragging();
            }
            
            try {
                // Clone the element for dragging
                const clone = element.cloneNode(true);
                clone.classList.add('dragging');
                
                // IMPORTANT FIX: Append directly to body for unrestricted movement
                document.body.appendChild(clone);
                
                // Get the dimensions for proper positioning
                const rect = element.getBoundingClientRect();
                
                // IMPORTANT FIX: Fixed position relative to viewport instead of parent container
                clone.style.position = 'fixed'; // Changed from 'absolute' to 'fixed'
                clone.style.left = (clientX - rect.width / 2) + 'px';
                clone.style.top = (clientY - rect.height / 2) + 'px';
                clone.style.zIndex = '10000'; // Ensure it's above everything
                
                // Add ARIA for accessibility
                clone.setAttribute('aria-grabbed', 'true');
                
                // Hide original element
                element.style.visibility = 'hidden';
                
                // Store drag information
                window.currentDrag.blockId = blockId;
                window.currentDrag.element = clone;
                window.currentDrag.originalElement = element;
                window.currentDrag.offsetX = rect.width / 2;
                window.currentDrag.offsetY = rect.height / 2;
                
                // Fire custom event for screen readers
                const dragStartEvent = new CustomEvent('blockdragstart', { 
                    detail: { blockId, clientX, clientY } 
                });
                document.dispatchEvent(dragStartEvent);
                
                return window.currentDrag;
            } catch (error) {
                console.error("Error in patched startDragging:", error);
                // Ensure original element is visible if an error occurs
                if (element) {
                    element.style.visibility = 'visible';
                }
                return null;
            }
        };
    }
    
    // Patch the moveDragElement function
    function patchMoveDragElement() {
        window.DragManager.moveDragElement = function(clientX, clientY) {
            if (!window.currentDrag.element) return;
            
            // Cancel any existing animation frame
            if (window.movementAnimationFrame) {
                cancelAnimationFrame(window.movementAnimationFrame);
            }
            
            // Schedule the movement for the next frame
            window.movementAnimationFrame = requestAnimationFrame(() => {
                if (window.currentDrag.element) {
                    // IMPORTANT FIX: Use fixed positioning for viewport-relative coordinates
                    window.currentDrag.element.style.left = (clientX - window.currentDrag.offsetX) + 'px';
                    window.currentDrag.element.style.top = (clientY - window.currentDrag.offsetY) + 'px';
                }
                window.movementAnimationFrame = null;
            });
        };
    }
    
    // Fix touch event handling
    function patchTouchHandlers() {
        // Create a new touchmove handler that doesn't rely on BLOCKS
        const fixedTouchMoveHandler = function(e) {
            if (window.GameState && window.GameState.gameOver) return;
            
            // IMPORTANT FIX: Only prevent default and handle events if we have an active drag
            if (window.currentDrag && window.currentDrag.element) {
                const touch = e.touches[0];
                
                window.DragManager.moveDragElement(touch.clientX, touch.clientY);
                
                // Prevent scrolling while dragging
                e.preventDefault();
            }
        };
        
        // Remove existing touchmove handlers that might be causing issues
        const oldHandler = document.ontouchmove;
        document.ontouchmove = null;
        
        // Add our improved touchmove handler
        document.addEventListener('touchmove', fixedTouchMoveHandler, { passive: false });
    }
})();