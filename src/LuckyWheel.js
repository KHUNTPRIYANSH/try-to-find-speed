import React, { useState, useRef, useEffect } from 'react';
import './LuckyWheel.css';

const LuckyWheel = () => {
  const [spinning, setSpinning] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);
  const startX = useRef(0);
  const currentRotation = useRef(0);
  const spinSpeed = useRef(0);

  const handleMouseDown = (e) => {
    startX.current = e.clientX;
    setSpinning(true);
  };

  const handleMouseMove = (e) => {
    if (!spinning) return;
    const deltaX = e.clientX - startX.current;
    spinSpeed.current = deltaX / 5; // Adjust this divisor to control sensitivity
    const newRotation = (currentRotation.current + spinSpeed.current);
    setRotation(newRotation);
    setSpeed(Math.abs(spinSpeed.current).toFixed(2));
  };

  const handleMouseUp = () => {
    setSpinning(false);
    currentRotation.current = rotation;
  };

  const handleMouseLeave = () => {
    if (spinning) {
      setSpinning(false);
      currentRotation.current = rotation;
    }
  };

  useEffect(() => {
    const wheelElement = wheelRef.current;
    if (wheelElement) {
      wheelElement.addEventListener('mousedown', handleMouseDown);
      wheelElement.addEventListener('mousemove', handleMouseMove);
      wheelElement.addEventListener('mouseup', handleMouseUp);
      wheelElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (wheelElement) {
        wheelElement.removeEventListener('mousedown', handleMouseDown);
        wheelElement.removeEventListener('mousemove', handleMouseMove);
        wheelElement.removeEventListener('mouseup', handleMouseUp);
        wheelElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [spinning, rotation]);

  return (
    <div className="wheel-container">
      <div
        className="lucky-wheel"
        ref={wheelRef}
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
      >
        <img src='./wl.png' />
        {/* <div className="wheel-pointer"></div> */}
      </div>
      <div className="wheel-info">
        <p>Spin Speed / Intensity: {speed} px</p>
      </div>
    </div>
  );
};

export default LuckyWheel;
