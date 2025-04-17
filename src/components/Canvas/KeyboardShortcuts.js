import { useEffect } from 'react';

const KeyboardShortcuts = ({
  setTool,
  undo,
  redo,
  clearCanvas,
  saveCanvas,
  setIsDynamicColor,
  isDynamicColor,
  setIsDynamicWidth,
  isDynamicWidth,
  setFillShape,
  fillShape,
  showTextInput
}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Skip all shortcuts if text input is active
      if (showTextInput) {
        return;
      }
      
      // Prevent default behavior for certain key combinations
      if ((event.ctrlKey || event.metaKey) && (
        event.key.toLowerCase() === 'z' || 
        (event.shiftKey && event.key.toLowerCase() === 'z') ||
        event.key.toLowerCase() === 'y' || 
        event.key.toLowerCase() === 's' ||
        event.key.toLowerCase() === 'c'
      )) {
        event.preventDefault();
      }
      
      // Handle keyboard shortcuts
      switch (true) {
        // Tools
        case event.key.toLowerCase() === 'b':
          setTool('brush');
          break;
        case event.key.toLowerCase() === 'e':
          setTool('eraser');
          break;
        case event.key.toLowerCase() === 'l':
          setTool('line');
          break;
        case event.key.toLowerCase() === 'r':
          setTool('rectangle');
          break;
        case event.key.toLowerCase() === 'c':
          setTool('circle');
          break;
        case event.key.toLowerCase() === 't':
          setTool('text');
          break;
        case event.key.toLowerCase() === 'i':
          setTool('eyedropper');
          break;
        case event.key.toLowerCase() === 'f':
          setTool('fill');
          break;
        
        // Actions
        case (event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'z':
          redo();
          break;
        case (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z':
          undo();
          break;
        case (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's':
          saveCanvas();
          break;
        case event.key === 'Delete' || event.key === 'Escape':
          if (window.confirm('Are you sure you want to clear the canvas?')) {
            clearCanvas();
          }
          break;
        
        // Effects
        case event.key.toLowerCase() === 'm':
          setIsDynamicColor(!isDynamicColor);
          break;
        case event.key.toLowerCase() === 'w':
          setIsDynamicWidth(!isDynamicWidth);
          break;
        case event.key.toLowerCase() === 'd':
          setFillShape(!fillShape);
          break;
          
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    setTool, 
    undo, 
    redo, 
    clearCanvas, 
    saveCanvas, 
    setIsDynamicColor, 
    isDynamicColor, 
    setIsDynamicWidth, 
    isDynamicWidth,
    setFillShape,
    fillShape,
    showTextInput
  ]);
  
  // This is a utility component that doesn't render anything
  return null;
};

export default KeyboardShortcuts; 