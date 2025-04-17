import React, { useState } from 'react';
import IntroScreen from './components/IntroScreen/IntroScreen';
import AdvancedCanvas from './components/Canvas/AdvancedCanvas';
import './App.css';

function App() {
  const [showIntro, setShowIntro] = useState(true);

  const handleStartDrawing = () => {
    setShowIntro(false);
  };

  return (
    <div className="App">
      {showIntro ? (
        <IntroScreen onStart={handleStartDrawing} />
      ) : (
        <AdvancedCanvas />
      )}
    </div>
  );
}

export default App;
