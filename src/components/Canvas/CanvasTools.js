import React, { useState, useEffect } from 'react';
import { 
  FaPaintBrush, FaEraser, FaSlash, FaSquare, FaCircle, FaFont, 
  FaSave, FaTrash, FaMagic, FaEyeDropper, FaFill, FaSquareFull,
  FaChevronRight, FaPalette, FaSlidersH, 
  FaRegObjectGroup, FaPencilRuler 
} from 'react-icons/fa';
import './CanvasTools.css';

const CanvasTools = ({
  tool,
  setTool,
  color,
  setColor,
  brushSize,
  setBrushSize,
  isDynamicColor,
  setIsDynamicColor,
  isDynamicWidth,
  setIsDynamicWidth,
  clearCanvas,
  saveCanvas,
  setShowTextInput,
  fillShape,
  setFillShape
}) => {
  // State to track if color was recently picked
  const [colorPicked, setColorPicked] = useState(false);
  
  // State to track if panel is collapsed
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Toggle panel collapsed state
  const togglePanel = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
  };
  
  // Effect to detect color changes and show animation
  useEffect(() => {
    // When color changes, show the animation
    if (!colorPicked) {
      setColorPicked(true);
      
      // Reset the animation after a delay
      const timer = setTimeout(() => {
        setColorPicked(false);
      }, 500); // Shorter duration for smoother updates in rainbow mode
      
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);
  
  return (
    <div className={`canvas-tools ${isCollapsed ? 'collapsed' : ''}`}>
      <button 
        className={`toggle-panel-btn ${isCollapsed ? 'collapsed' : ''}`} 
        onClick={togglePanel}
        title={isCollapsed ? "Expand Tools" : "Collapse Tools"}
      >
        <FaChevronRight />
      </button>
      
      <div className="tools-section">
        <h3><FaPencilRuler /> Drawing Tools</h3>
        <div className="tools-grid">
          <button 
            className={tool === 'brush' ? 'active' : ''} 
            onClick={() => setTool('brush')}
            title="Brush Tool (B)"
          >
            <FaPaintBrush />
          </button>
          <button 
            className={tool === 'eraser' ? 'active' : ''} 
            onClick={() => setTool('eraser')}
            title="Eraser Tool (E)"
          >
            <FaEraser />
          </button>
          <button 
            className={tool === 'line' ? 'active' : ''} 
            onClick={() => setTool('line')}
            title="Line Tool (L)"
          >
            <FaSlash />
          </button>
          <button 
            className={tool === 'rectangle' ? 'active' : ''} 
            onClick={() => setTool('rectangle')}
            title="Rectangle Tool (R)"
          >
            {fillShape ? <FaSquareFull /> : <FaSquare />}
          </button>
          <button 
            className={tool === 'circle' ? 'active' : ''} 
            onClick={() => setTool('circle')}
            title="Circle Tool (C)"
          >
            <FaCircle />
          </button>
          <button 
            className={tool === 'text' ? 'active' : ''} 
            onClick={() => {
              setTool('text');
              setShowTextInput(true);
            }}
            title="Text Tool (T)"
          >
            <FaFont />
          </button>
          <button 
            className={tool === 'eyedropper' ? 'active' : ''} 
            onClick={() => setTool('eyedropper')}
            title="Color Picker (I)"
          >
            <FaEyeDropper />
          </button>
          <button 
            className={tool === 'fill' ? 'active' : ''} 
            onClick={() => setTool('fill')}
            title="Fill Tool (F)"
          >
            <FaFill />
          </button>
        </div>

        {(tool === 'rectangle' || tool === 'circle') && (
          <div className="shape-options">
            <div className="checkbox-control">
              <label>
                <input 
                  type="checkbox" 
                  checked={fillShape} 
                  onChange={() => setFillShape(!fillShape)} 
                />
                <span>Fill Shape</span>
                <small className="option-hint">{fillShape ? 'Solid shape' : 'Outline only'}</small>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="tools-section" style={{paddingBottom: '5px'}}>
        <h3><FaPalette /> Color & Brush</h3>
        <div className="color-control">
          <div className="color-preview-container">
            <span 
              style={{ backgroundColor: color }} 
              className={`color-preview ${colorPicked ? 'picked' : ''} ${isDynamicColor ? 'rainbow-active' : ''}`}
              title={isDynamicColor ? "Rainbow brush active" : "Current color"}
            ></span>
            <input 
              type="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)} 
              className="color-picker"
              id="colorPicker"
              aria-label="Choose color"
            />
            <label htmlFor="colorPicker" className="color-picker-label">
              Select Color
            </label>
          </div>
        </div>
        
        <div className="slider-group">
          <label>
            <span>Stroke Size:</span> 
            <span className="size-value">{brushSize}px</span>
          </label>
          <input 
            type="range" 
            min="1" 
            max="50" 
            value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))} 
          />
          <div className="brush-preview" style={{ 
            width: brushSize, 
            height: brushSize, 
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}80, 0 0 15px ${color}40`
          }}></div>
        </div>
      </div>

      <div className="tools-section">
        <h3><FaMagic /> Magic Effects</h3>
        <div className="magic-controls">
          <button 
            className={isDynamicColor ? 'active magic-btn' : 'magic-btn'} 
            onClick={() => setIsDynamicColor(!isDynamicColor)}
            title="Rainbow Brush"
          >
            <FaPalette /> Rainbow
          </button>
          
          <button 
            className={isDynamicWidth ? 'active magic-btn' : 'magic-btn'} 
            onClick={() => setIsDynamicWidth(!isDynamicWidth)}
            title="Dynamic Size"
          >
            <FaSlidersH /> Dynamic
          </button>
        </div>
      </div>

      <div className="tools-section">
        <h3><FaRegObjectGroup /> Canvas Actions</h3>
        <div className="action-buttons">
          <button onClick={saveCanvas} className="action-btn primary" title="Save Image">
            <FaSave /> Save
          </button>
          
          <button onClick={clearCanvas} className="action-btn danger" title="Clear Canvas">
            <FaTrash /> Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default CanvasTools; 