import React, { useState } from 'react';
import IntroScreen from './components/IntroScreen/IntroScreen';
import AdvancedCanvas from './components/Canvas/AdvancedCanvas';
import './App.css';
import { Analytics } from '@vercel/analytics/react';


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
      <Analytics />
    </div>
  );
}

export default App;
