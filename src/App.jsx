import React, { useRef, useState, useEffect } from 'react';
import { useDrag } from 'react-use-gesture';
import Matter from 'matter-js';

const App = () => {
  let arr = [
    'about us',
    'e comm',
    'digital marketing',
    'creative',
    'outdoor marketing',
    'electronic media',
    'production studio',
    'print'
  ];

  const wheelRef = useRef(null);
  const [intensity, setIntensity] = useState(0); // Rotation intensity (no longer used for item selection)
  const [inertia, setInertia] = useState(0); // Track inertia
  const [showItems, setShowItems] = useState(false); // State to control when to update items
  const [isMoving, setIsMoving] = useState(false); // Track if the wheel is moving
  const engineRef = useRef(null);
  const wheelBodyRef = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
    // Initialize Matter.js engine
    engineRef.current = Matter.Engine.create();
    const engine = engineRef.current;

    wheelBodyRef.current = Matter.Bodies.circle(0, 0, 100, {
      inertia: 1000, // High inertia to simulate real wheel spin
      frictionAir: 0.02, // Air friction to slow down the wheel gradually
    });

    Matter.World.add(engine.world, wheelBodyRef.current);

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    return () => {
      Matter.World.remove(engine.world, wheelBodyRef.current);
      Matter.Engine.clear(engine);
      Matter.Runner.stop(runner);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  const bind = useDrag(
    ({ down, velocity, direction: [dx] }) => {
      if (down) {
        // When dragging, set the wheel to be moving and hide items
        setIsMoving(true);
      } else {
        // Once drag ends, calculate inertia and show updated items based on it
        const currentInertia = Math.abs(wheelBodyRef.current.angularVelocity) * 10;
        setInertia(currentInertia);
        setShowItems(true); // Show items when the wheel stops
        setIsMoving(false); // Reset moving state
      }

      // Adjust multiplier for smoother movement and prevent fast spinning
      const scaleFactor = 0.2; // Decrease this value to make the spin slower
      const angularVelocity = velocity * dx * scaleFactor; // Apply drag velocity as angular velocity
      Matter.Body.setAngularVelocity(wheelBodyRef.current, angularVelocity);
    },
    {
      axis: 'x', // Constrain drag to the x-axis
      preventDefault: true,
    }
  );

  useEffect(() => {
    const wheelElement = wheelRef.current;
    if (!wheelElement) return;

    const updateRotation = () => {
      const angle = wheelBodyRef.current.angle;
      const degrees = (angle * 180) / Math.PI;

      // Apply rotation to the wheel element in the DOM
      wheelElement.style.transform = `rotate(${degrees}deg)`;

      animationFrameId.current = requestAnimationFrame(updateRotation);
    };

    updateRotation();

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  // Determine which set of 3 items to show based on inertia
  const itemsToShow = showItems
    ? arr.slice(Math.floor(inertia * 3) % arr.length, Math.floor(inertia * 3) % arr.length + 3)
    : []; // Default to no items while moving

  // Positions for each item (center top, 45°, -45°)
  const positions = [
    { rotate: '0deg', top: '20px', left: '41%' , al : "center"}, // Center top
    { rotate: '0deg', top: '150px', left: '62.5%', al : "left" }, // 45° clockwise
    { rotate: '0deg', top: '150px', left: '22.5%', al : "right" }, // 45° counterclockwise
  ];

  return (
    <>
      <div className="wheel-spinner">
        <div {...bind()} ref={wheelRef} className="wheel">
          <img src="./wheel.png" alt="Wheel" />
        </div>
        <div className="wheel-items">
          {!isMoving && // Only show items when the wheel is not moving
            itemsToShow.map((item, index) => (
              <div
                key={index}
                className="wheel-item"
                style={{
                  position: 'absolute',
                  transform: `rotate(${positions[index].rotate})`,
                  top: positions[index].top,
                  left: positions[index].left,
                  textAlign: positions[index].al,
                  transformOrigin: 'center',
                }}
              >
                <span>{item}</span>
              </div>
            ))}
        </div>
      </div>
      <div className="row">
        <p>Inertia: {inertia.toFixed(2)}</p>
      </div>
    </>
  );
};

export default App;
