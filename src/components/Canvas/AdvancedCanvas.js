import React, { useRef, useState, useEffect } from 'react';
import CanvasTools from './CanvasTools';
import KeyboardShortcuts from './KeyboardShortcuts';
import './AdvancedCanvas.css';

const AdvancedCanvas = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  // Drawing settings
  const [tool, setTool] = useState('brush');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [opacity, setOpacity] = useState(1);
  
  // Text tool state
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState(20);
  const [fontFamily, setFontFamily] = useState('Arial');
  
  // Dynamic brush settings
  const [isDynamicColor, setIsDynamicColor] = useState(false);
  const hueRef = useRef(0);
  const [saturation] = useState(100);
  const [lightness] = useState(50);
  
  // Dynamic width settings
  const [isDynamicWidth, setIsDynamicWidth] = useState(false);
  const [minWidth] = useState(1);
  const [maxWidth] = useState(15);
  const widthRef = useRef(5);
  const widthDirectionRef = useRef(1);
  
  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Help panel state
  const [showHelp, setShowHelp] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Shape fill setting
  const [fillShape, setFillShape] = useState(false);
  
  // Detect mobile devices
  useEffect(() => {
    const checkIfMobile = () => {
      const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
      setIsMobile(mobileCheck);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Set canvas dimensions with DPI awareness
    canvas.width = windowWidth * 2;
    canvas.height = windowHeight * 2;
    canvas.style.width = `${windowWidth}px`;
    canvas.style.height = `${windowHeight}px`;
    
    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    context.globalAlpha = opacity;
    contextRef.current = context;
    
    // Initialize canvas with white background
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save initial state to history
    saveToHistory();

    // Handle window resize
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      canvas.width = newWidth * 2;
      canvas.height = newHeight * 2;
      canvas.style.width = `${newWidth}px`;
      canvas.style.height = `${newHeight}px`;
      
      context.scale(2, 2);
      context.putImageData(imageData, 0, 0);
      
      // Reset drawing settings after resize
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = color;
      context.lineWidth = brushSize;
      context.globalAlpha = opacity;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update canvas context when settings change
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = brushSize;
      contextRef.current.globalAlpha = opacity;
    }
  }, [color, brushSize, opacity]);

  // Reset brush width when dynamic width is disabled
  useEffect(() => {
    if (!isDynamicWidth && contextRef.current) {
      // Reset the current width ref to match the brush size
      widthRef.current = brushSize;
      // Ensure the context lineWidth is set to the brushSize
      contextRef.current.lineWidth = brushSize;
    }
  }, [isDynamicWidth, brushSize]);

  // Display a visual marker when text tool is selected
  useEffect(() => {
    if (tool === 'text' && !showTextInput && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = contextRef.current;
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Save current state
      ctx.save();
      
      // Draw a crosshair at the center
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.lineWidth = 1;
      
      // Horizontal line
      ctx.moveTo(centerX - 10, centerY);
      ctx.lineTo(centerX + 10, centerY);
      
      // Vertical line
      ctx.moveTo(centerX, centerY - 10);
      ctx.lineTo(centerX, centerY + 10);
      
      // Small circle
      ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
      
      ctx.stroke();
      
      // Restore previous state
      ctx.restore();
      
      // Clean up the marker when tool changes or text input shows
      return () => {
        if (historyIndex >= 0 && history.length > 0) {
          const img = new Image();
          img.src = history[historyIndex];
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2);
          };
        }
      };
    }
  }, [tool, showTextInput, historyIndex, history]);

  // Save canvas state to history
  const saveToHistory = () => {
    const canvas = canvasRef.current;
    
    // Ensure any pending draws are completed
    if (contextRef.current) {
      contextRef.current.beginPath();
    }
    
    // Trim history if we're not at the end
    if (historyIndex !== history.length - 1) {
      setHistory(history.slice(0, historyIndex + 1));
    }
    
    // Add current state to history
    const currentState = canvas.toDataURL();
    setHistory(prevHistory => [...prevHistory, currentState]);
    setHistoryIndex(prevIndex => prevIndex + 1);
  };

  // Update dynamic brush settings
  const updateDynamicBrush = () => {
    if (isDynamicColor) {
      hueRef.current = (hueRef.current + 1) % 360;
      contextRef.current.strokeStyle = `hsl(${hueRef.current}, ${saturation}%, ${lightness}%)`;
    }
    
    if (isDynamicWidth) {
      widthRef.current += 0.5 * widthDirectionRef.current;
      
      if (widthRef.current >= maxWidth) {
        widthDirectionRef.current = -1;
      } else if (widthRef.current <= minWidth) {
        widthDirectionRef.current = 1;
      }
      
      contextRef.current.lineWidth = widthRef.current;
    }
  };

  // Handle eyedropper tool
  const pickColor = (x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Account for high DPI display scaling
    const scale = 2; // We're using a 2x scale
    
    try {
      // Make sure coordinates are within canvas bounds
      const width = canvas.width / scale;
      const height = canvas.height / scale;
      
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x >= width) x = width - 1;
      if (y >= height) y = height - 1;
      
      // Get pixel data at the clicked position (scaled appropriately)
      const pixelData = ctx.getImageData(Math.floor(x * scale), Math.floor(y * scale), 1, 1).data;
      
      // Properly format each color component as hex with leading zero if needed
      const r = pixelData[0].toString(16).padStart(2, '0');
      const g = pixelData[1].toString(16).padStart(2, '0');
      const b = pixelData[2].toString(16).padStart(2, '0');
      
      // Create properly formatted hex color
      const hexColor = `#${r}${g}${b}`;
      
      // Log for debugging
      console.log(`Picked color: ${hexColor} at position (${x}, ${y})`);
      
      // Set the color and switch back to brush
      setColor(hexColor);
      setTool('brush');
    } catch (error) {
      console.error("Error picking color:", error);
      
      // Check for security error (might be a tainted canvas)
      if (error.name === 'SecurityError') {
        alert("Cannot access pixel data due to security restrictions. Try saving and reloading the canvas.");
      }
      
      // Default to black if there's an error
      setColor('#000000');
      setTool('brush');
    }
  };

  // Get correct coordinates regardless of event type
  const getCoordinates = (event) => {
    // Handle null or undefined event
    if (!event) {
      console.warn("Received null or undefined event");
      return { x: 0, y: 0 };
    }
    
    let clientX, clientY;
    
    // Debug info
    const eventType = event.type || 'unknown';
    
    // Touch event
    if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
      console.log(`Touch event: type=${eventType}, clientX=${clientX}, clientY=${clientY}`);
    } 
    // Mouse event
    else if (event.clientX !== undefined) {
      clientX = event.clientX;
      clientY = event.clientY;
      console.log(`Mouse event: type=${eventType}, clientX=${clientX}, clientY=${clientY}`);
    }
    // Converted event (from our handlers)
    else {
      console.warn(`Unknown event type: ${eventType}`, event);
      return { x: 0, y: 0 }; // Fallback
    }
    
    // Convert client coordinates to canvas coordinates
    if (!canvasRef.current) {
      console.warn("Canvas reference is null");
      return { x: 0, y: 0 };
    }
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    console.log(`Canvas coordinates: x=${x}, y=${y}, rect.left=${rect.left}, rect.top=${rect.top}`);
    
    return { x, y };
  };

  // Start drawing
  const startDrawing = (event) => {
    if (!event) return;
    
    try {
      event.preventDefault(); // Prevent default behavior
      
      const realEvent = event.nativeEvent || event;
      const { x: offsetX, y: offsetY } = getCoordinates(realEvent);
      const ctx = contextRef.current;
      
      // Handle different tools on mouse down
      if (tool === 'eyedropper') {
        pickColor(offsetX, offsetY);
        return; // Don't start drawing
      } else if (tool === 'fill') {
        // Fill the entire canvas with the selected color
        fillEntireCanvas(color);
        return; // Don't start drawing
      } else if (tool === 'text' && !showTextInput) {
        setShowTextInput(true);
        // Set position to the center of the canvas rather than click position
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        setStartPos({ x: centerX, y: centerY });
        return; // Don't start drawing
      }
      
      // Begin a new drawing path
      ctx.beginPath();
      
      // For brush and eraser, start the path at the current position
      if (tool === 'brush' || tool === 'eraser') {
        ctx.moveTo(offsetX, offsetY);
      }
      
      // Set start position for all tools
      setStartPos({ x: offsetX, y: offsetY });
      setIsDrawing(true);
    } catch (err) {
      console.error("Error in startDrawing:", err);
    }
  };

  // Handle drawing based on current tool
  const draw = (event) => {
    if (!isDrawing || !event) return;
    
    try {
      event.preventDefault(); // Prevent default behavior like scrolling
      
      const realEvent = event.nativeEvent || event;
      const { x: offsetX, y: offsetY } = getCoordinates(realEvent);
      const ctx = contextRef.current;
      
      switch (tool) {
        case 'brush':
          updateDynamicBrush();
          ctx.lineTo(offsetX, offsetY);
          ctx.stroke();
          break;
          
        case 'eraser':
          ctx.globalCompositeOperation = 'destination-out';
          ctx.lineTo(offsetX, offsetY);
          ctx.stroke();
          ctx.globalCompositeOperation = 'source-over';
          break;
          
        case 'line':
        case 'rectangle':
        case 'circle':
          // Create a temporary in-memory canvas for drawing preview
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvasRef.current.width;
          tempCanvas.height = canvasRef.current.height;
          const tempCtx = tempCanvas.getContext('2d');
          
          // Copy the original state (before this drag operation started)
          const originalImage = new Image();
          if (historyIndex >= 0 && history.length > 0) {
            originalImage.src = history[historyIndex];
            
            // Wait for the image to load before drawing
            if (originalImage.complete) {
              // Clear the canvas and redraw the original image
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              ctx.drawImage(originalImage, 0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2);
              
              // Draw the current shape preview
              drawShapePreview(ctx, startPos, offsetX, offsetY);
            } else {
              originalImage.onload = () => {
                // Clear the canvas and redraw the original image
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                ctx.drawImage(originalImage, 0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2);
                
                // Draw the current shape preview
                drawShapePreview(ctx, startPos, offsetX, offsetY);
              };
            }
          } else {
            // If there's no history yet, just use the current canvas
            tempCtx.drawImage(canvasRef.current, 0, 0);
            
            // Clear the canvas and redraw the original content
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.drawImage(tempCanvas, 0, 0);
            
            // Draw the current shape preview
            drawShapePreview(ctx, startPos, offsetX, offsetY);
          }
          break;
          
        default:
          break;
      }
    } catch (err) {
      console.error("Error in draw:", err);
    }
  };

  // Helper function to draw shape preview based on current tool
  const drawShapePreview = (ctx, startPos, currentX, currentY) => {
    // Ensure we have valid coordinates
    if (isNaN(startPos.x) || isNaN(startPos.y) || 
        isNaN(currentX) || isNaN(currentY)) {
      console.warn("Invalid coordinates in drawShapePreview", 
        {startX: startPos.x, startY: startPos.y, currentX, currentY});
      return;
    }

    ctx.beginPath();
    
    if (tool === 'line') {
      // Draw line from start position to current position
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(currentX, currentY);
    } else if (tool === 'rectangle') {
      // Draw rectangle from start position with width/height to current position
      ctx.rect(
        startPos.x, 
        startPos.y, 
        currentX - startPos.x, 
        currentY - startPos.y
      );
    } else if (tool === 'circle') {
      // Calculate radius and draw circle
      const radius = Math.sqrt(
        Math.pow(currentX - startPos.x, 2) + 
        Math.pow(currentY - startPos.y, 2)
      );
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
    }
    
    if (fillShape && (tool === 'rectangle' || tool === 'circle')) {
      ctx.fillStyle = color;
      ctx.fill();
    }
    ctx.stroke();
  };

  // Finish drawing and save to history
  const finishDrawing = (event) => {
    try {
      if (event) {
        event.preventDefault(); // Prevent default browser behavior
      }
      
      if (!isDrawing) return;
      
      const ctx = contextRef.current;
      
      // For shape tools, we need to ensure the final shape is drawn correctly
      if (tool === 'rectangle' || tool === 'circle' || tool === 'line') {
        // No need to close the path for shape tools as they're already handled in draw()
        // Just ensure we end up in a clean state
        ctx.beginPath();
      } else {
        // For brush and eraser tools, close the path
        ctx.closePath();
      }
      
      setIsDrawing(false);
      
      // Save current state to history
      saveToHistory();
    } catch (error) {
      console.error("Error in finishDrawing:", error);
      setIsDrawing(false); // Ensure drawing state is reset even if there's an error
    }
  };

  // Add text to canvas
  const addText = () => {
    if (!textInput) return;
    
    const ctx = contextRef.current;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    
    // Measure text width for horizontal centering
    const textWidth = ctx.measureText(textInput).width;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate centered position
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Draw text centered horizontally, at the specified vertical position
    ctx.fillText(textInput, centerX - (textWidth / 2), centerY);
    
    setShowTextInput(false);
    setTextInput('');
    setTool('brush');
    saveToHistory();
  };

  // Clear canvas
  const clearCanvas = () => {
    if (!window.confirm('Are you sure you want to clear the canvas?')) {
      return;
    }
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  // Save canvas as image
  const saveCanvas = () => {
    const canvas = canvasRef.current;
    
    // Create a temporary canvas to ensure white background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Fill with white background first
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw the original canvas content on top
    tempCtx.drawImage(canvas, 0, 0);
    
    // Get the image data from the temp canvas with white background
    const image = tempCanvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.href = image;
    link.download = 'masterpiece.png';
    link.click();
  };

  // Undo action
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      
      const img = new Image();
      img.src = history[newIndex];
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2);
      };
    }
  };

  // Redo action
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      
      const img = new Image();
      img.src = history[newIndex];
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2);
      };
    }
  };

  // Fill the entire canvas with color (replacing all content)
  const fillEntireCanvas = (fillColor) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Save the current state
    context.save();
    
    // Reset the transformation
    context.setTransform(1, 0, 0, 1, 0, 0);
    
    // Clear and fill the entire canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = fillColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Restore the original scale for future operations
    context.restore();
    
    // Save to history
    saveToHistory();
  };

  // Update font size limit
  useEffect(() => {
    if (fontSize > 50) {
      setFontSize(50);
    }
  }, [fontSize]);

  return (
    <div className="advanced-canvas-container">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        onMouseLeave={finishDrawing}
        onTouchStart={startDrawing}
        onTouchEnd={finishDrawing}
        onTouchCancel={finishDrawing}
        onTouchMove={draw}
        className={`drawing-canvas ${tool === 'eyedropper' ? 'eyedropper' : ''} ${tool === 'text' ? 'text-tool' : ''} ${tool === 'fill' ? 'fill' : ''} ${tool === 'eraser' ? 'eraser' : ''}`}
      />
      
      <CanvasTools
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        opacity={opacity}
        setOpacity={setOpacity}
        isDynamicColor={isDynamicColor}
        setIsDynamicColor={setIsDynamicColor}
        isDynamicWidth={isDynamicWidth}
        setIsDynamicWidth={setIsDynamicWidth}
        saturation={saturation}
        lightness={lightness}
        clearCanvas={clearCanvas}
        saveCanvas={saveCanvas}
        setShowTextInput={setShowTextInput}
        fillEntireCanvas={fillEntireCanvas}
        fillShape={fillShape}
        setFillShape={setFillShape}
      />
      
      <KeyboardShortcuts
        setTool={setTool}
        undo={undo}
        redo={redo}
        clearCanvas={clearCanvas}
        saveCanvas={saveCanvas}
        setIsDynamicColor={setIsDynamicColor}
        isDynamicColor={isDynamicColor}
        setIsDynamicWidth={setIsDynamicWidth}
        isDynamicWidth={isDynamicWidth}
        setFillShape={setFillShape}
        fillShape={fillShape}
        showTextInput={showTextInput}
      />
      
      {showTextInput && (
        <div className="text-input-modal">
          <div className="text-input-container">
            <h3>Add Text</h3>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter text..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addText();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setShowTextInput(false);
                  setTextInput('');
                }
              }}
            />
            
            <div className="text-controls">
              <div className="color-picker-group">
                <label>Text Color</label>
                <div className="color-picker-container">
                  <input 
                    type="color" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="color-picker"
                  />
                  <div className="color-preview" style={{ backgroundColor: color }}></div>
                </div>
                
                {/* Color presets */}
                <div className="color-presets">
                  {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF'].map(
                    (presetColor) => (
                      <div 
                        key={presetColor}
                        className="color-preset"
                        style={{ backgroundColor: presetColor }}
                        onClick={() => setColor(presetColor)}
                        title={presetColor}
                      ></div>
                    )
                  )}
                </div>
              </div>
            
              <div className="slider-group">
                <label>Font Size: {fontSize}px</label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={fontSize > 50 ? 50 : fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                />
              </div>
              
              <div className="select-group">
                <label>Font Family:</label>
                <select 
                  value={fontFamily} 
                  onChange={(e) => setFontFamily(e.target.value)}
                >
                  <option value="Arial">Arial</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
                </select>
              </div>
            </div>

            {/* Text Visualizer */}
            <div className="text-visualizer">
                <div 
                  className="text-preview" 
                  style={{ 
                    fontFamily, 
                    fontSize: `${fontSize}px`,
                    color: color
                  }}
                >
                  {textInput || "Preview Text"}
                </div>
                <div className="font-indicator">{fontFamily}</div>
              </div>
            
            <div className="button-group">
              <button onClick={() => setShowTextInput(false)}>Cancel</button>
              <button onClick={addText} className="primary">Add Text</button>
            </div>
          </div>
        </div>
      )}
      
      <div className="history-controls-centered">
        <button className="history-button large-button" onClick={undo} disabled={historyIndex <= 0} title="Undo">Undo</button>
        <button className="history-button large-button" onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo">Redo</button>
      </div>
      
      {!isMobile && (
        <div className="shortcuts-help">
          <button className="help-toggle" onMouseOver={() => setShowHelp(true)} onMouseOut={() => setShowHelp(false)}>?</button>
          {showHelp && (
            <div className="shortcuts-panel">
              <h3>Keyboard Shortcuts</h3>
              <div className="shortcuts-grid">
                <div className="shortcut-item">
                  <span className="key">B</span>
                  <span>Brush</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">E</span>
                  <span>Eraser</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">L</span>
                  <span>Line</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">R</span>
                  <span>Rectangle</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">C</span>
                  <span>Circle</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">T</span>
                  <span>Text</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">I</span>
                  <span>Color Picker</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">F</span>
                  <span>Fill Canvas</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">M</span>
                  <span>Toggle Rainbow Brush</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">W</span>
                  <span>Toggle Dynamic Size</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">D</span>
                  <span>Toggle Fill Shape</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">Ctrl+Z</span>
                  <span>Undo</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">Ctrl+Shift+Z</span>
                  <span>Redo</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">Ctrl+S</span>
                  <span>Save Image</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">Esc</span>
                  <span>Clear Canvas</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedCanvas; 