import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FaPaintBrush, 
  FaEraser, 
  FaShapes, 
  FaEyeDropper, 
  FaMagic, 
  FaSave,
  FaChevronRight,
  FaGithub
} from 'react-icons/fa';
import Iridescence from './Iridescence';
import Magnet from '../Magnet';
import './IntroScreen.css';
import { RiSketching } from "react-icons/ri";

const IntroScreen = ({ onStart }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);
  const featuresGridRef = useRef(null);
  const scrollIntervalRef = useRef(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Check if mobile device
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 576);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Trigger entrance animation after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll functionality for mobile
  useEffect(() => {
    if (isMobile && featuresGridRef.current && autoScrollEnabled && !isScrolling) {
      const featureCards = featuresGridRef.current.querySelectorAll('.feature-card');
      
      if (featureCards.length > 0) {
        // Start auto scrolling
        scrollIntervalRef.current = setInterval(() => {
          // Calculate next card index
          const nextCardIndex = (currentCardIndex + 1) % featureCards.length;
          setCurrentCardIndex(nextCardIndex);
          
          // Scroll to the next card
          featureCards[nextCardIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }, 3000); // Scroll every 3 seconds
      }
    }
    
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [isMobile, autoScrollEnabled, currentCardIndex, isScrolling]);

  // Pause auto-scroll when user interacts with the grid
  const handleInteraction = () => {
    setIsScrolling(true);
    setAutoScrollEnabled(false);
    
    // Resume auto-scroll after 1 second of inactivity
    setTimeout(() => {
      setIsScrolling(false);
      setAutoScrollEnabled(true);
    }, 1000);
  };

  // Memoize the Iridescence component to prevent unnecessary re-renders
  const iridescenceBackground = useMemo(() => (
    <Iridescence 
      mouseReact={false}
      amplitude={4} 
      speed={0.9} 
    />
  ), []);

  return (
    <div className="intro-screen">
      {iridescenceBackground}
      
      <div className={`intro-content ${isLoaded ? 'loaded' : ''}`}>
        <div className="logo-container">
          <div className="logo-icon">
            <FaPaintBrush />
          </div>
          <h1 className="app-title">
            <span style={{color: 'white'}} data-text="Digital Art Canvas">Digital Art Canvas</span>
          </h1>
        </div>
        
        <p className="app-tagline">
          Create stunning digital artwork with a powerful, intuitive design suite
        </p>
        
        <div className="features-container">
          <div 
            className={`features-grid ${autoScrollEnabled ? 'auto-scroll' : ''}`}
            ref={featuresGridRef}
            onTouchStart={handleInteraction}
            onMouseDown={handleInteraction}
            onScroll={handleInteraction}
          >
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <RiSketching className="feature-icon" />
              </div>
              <div className="feature-content">
                <h3>Professional Brushes</h3>
                <p>Multiple brush styles with customizable size and dynamic effects</p>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaShapes className="feature-icon" />
              </div>
              <div className="feature-content">
                <h3>Shape Tools</h3>
                <p>Various shapes and line tools for creating perfect geometric designs</p>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaEyeDropper className="feature-icon" />
              </div>
              <div className="feature-content">
                <h3>Color Controls</h3>
                <p>Advanced color picker to select any color from your canvas or color palette</p>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaMagic className="feature-icon" />
              </div>
              <div className="feature-content">
                <h3>Magic Effects</h3>
                <p>Rainbow brush and dynamic size effects for creating unique artistic styles</p>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaEraser className="feature-icon" />
              </div>
              <div className="feature-content">
                <h3>Precision Editing</h3>
                <p>Undo, redo, eraser, and fill tools for complete control over your artwork</p>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaSave className="feature-icon" />
              </div>
              <div className="feature-content">
                <h3>Export Options</h3>
                <p>Save your creations as PNG with a single click and share with the world</p>
              </div>
            </div>
          </div>
          {isMobile && autoScrollEnabled && 
            <div className="auto-scroll-indicator">Auto-scrolling</div>
          }
        </div>
        
        <Magnet padding={40} magnetStrength={2}>
          <button className="start-button" onClick={onStart}>
            <span style={{color: 'white'}}>Start Creating</span>
            <FaChevronRight className="arrow-icon" />
            <div className="button-background"></div>
          </button>
        </Magnet>
        
        <footer className="intro-footer">
          <p><a href="https://github.com/mighty-phoenix/digital-art-canvas" target="_blank" rel="noopener noreferrer"><FaGithub /> Source Code</a></p>
          <p>Created with ❤️ by <a href="https://www.linkedin.com/in/rakshit-kumar-a8b11914b/" target="_blank" rel="noopener noreferrer">Rakshit Kumar</a></p>
        </footer>
      </div>
    </div>
  );
};

export default IntroScreen; 