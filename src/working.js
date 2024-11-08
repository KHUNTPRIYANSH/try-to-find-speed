import React, { useRef, useState, useEffect } from 'react';
import { useDrag } from 'react-use-gesture';
import Matter from 'matter-js';
import './App.css';

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
  const [intensity, setIntensity] = useState(0); // Rotation intensity
  const [maxInertia, setMaxInertia] = useState(0); // Max inertia (angular velocity) recorded
  const [dragging, setDragging] = useState(false); // Track if the wheel is being dragged
  const [showItems, setShowItems] = useState(false); // State to track when to show items
  const engineRef = useRef(null);
  const wheelBodyRef = useRef(null);
  const animationFrameId = useRef(null);
  const initialAngleRef = useRef(0);

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
      setDragging(down); // Track if dragging is happening

      if (!down) {
        // Adjust multiplier for smoother movement and prevent fast spinning
        const scaleFactor = 0.2; // Decrease this value to make the spin slower
        const angularVelocity = velocity * dx * scaleFactor; // Apply drag velocity as angular velocity
        Matter.Body.setAngularVelocity(wheelBodyRef.current, angularVelocity);

        // Reset initial angle and max inertia for each new drag event
        initialAngleRef.current = wheelBodyRef.current.angle;
        setMaxInertia(Math.abs(angularVelocity));

        // Once drag ends, show the items based on intensity
        setShowItems(true);
      }
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

      // Calculate cumulative angle change since spin start
      const angleDiff = Math.abs((angle - initialAngleRef.current) * (180 / Math.PI));
      const rotationIntensity = Math.min(Math.floor(angleDiff / 45), 8); // Map to 0-8 scale

      // Update rotation intensity while dragging
      if (!dragging) {
        setIntensity(rotationIntensity);
      }

      // Track maximum inertia reached
      const currentInertia = Math.abs(wheelBodyRef.current.angularVelocity);
      if (currentInertia > maxInertia) {
        setMaxInertia(currentInertia); // Update max inertia if current is higher
      }

      animationFrameId.current = requestAnimationFrame(updateRotation);
    };

    updateRotation();

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [maxInertia, dragging]);

  // Only show items after the drag has ended
  const itemsToShow = showItems ? arr.slice(intensity * 3, intensity * 3 + 3) : [];

  // Positions for each item (center top, 45°, -45°)
  const positions = [
    { rotate: '0deg', top: '20px', left: '47.5%' }, // Center top
    { rotate: '0deg', top: '150px', left: '60%' }, // 45° clockwise
    { rotate: '0deg', top: '150px', left: '25%' }, // 45° counterclockwise
  ];

  return (
    <>
      <div className="wheel-spinner">
        <div {...bind()} ref={wheelRef} className="wheel">
          <img src="./wheel.png" alt="Wheel" />
        </div>
        <div className="wheel-items">
          {itemsToShow.map((item, index) => (
            <div
              key={index}
              className="wheel-item"
              style={{
                position: 'absolute',
                transform: `rotate(${positions[index].rotate})`,
                top: positions[index].top,
                left: positions[index].left,
                transformOrigin: 'center',
              }}
            >
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="row">
        <p>Spin Intensity: {intensity}</p>
        <p>Max Inertia: {maxInertia.toFixed(2) * 10}</p>
      </div>
    </>
  );
};

export default App;
