import React, { useRef, useState, useEffect } from 'react';
import { useDrag } from 'react-use-gesture';
import Matter from 'matter-js';
import gsap from 'gsap';

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
  const [intensity, setIntensity] = useState(0);
  const [inertia, setInertia] = useState(0);
  const [showItems, setShowItems] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const engineRef = useRef(null);
  const wheelBodyRef = useRef(null);
  const animationFrameId = useRef(null);
  const itemsRefs = useRef([]); // References for GSAP animations

  useEffect(() => {
    engineRef.current = Matter.Engine.create();
    const engine = engineRef.current;

    wheelBodyRef.current = Matter.Bodies.circle(0, 0, 100, {
      inertia: 1000,
      frictionAir: 0.02,
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
        setIsMoving(true);
      } else {
        const currentInertia = parseInt((Math.abs(wheelBodyRef.current.angularVelocity) * 100) % 8);
        setInertia(currentInertia);
        setShowItems(true);
        setIsMoving(false);
      }

      const scaleFactor = 0.2;
      const angularVelocity = velocity * dx * scaleFactor;
      Matter.Body.setAngularVelocity(wheelBodyRef.current, angularVelocity);
    },
    {
      axis: 'x',
      preventDefault: true,
    }
  );

  useEffect(() => {
    const wheelElement = wheelRef.current;
    if (!wheelElement) return;

    const updateRotation = () => {
      const angle = wheelBodyRef.current.angle;
      const degrees = (angle * 180) / Math.PI;

      wheelElement.style.transform = `rotate(${degrees}deg)`;

      animationFrameId.current = requestAnimationFrame(updateRotation);
    };

    updateRotation();

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  const startIndex = Math.floor(inertia) % arr.length;
  const itemsToShow = [
    ...arr.slice(startIndex, startIndex + 3),
    ...arr.slice(0, Math.max(0, startIndex + 3 - arr.length))
  ];

  const positions = [
    { rotate: '0deg', top: '50px', left: '41%', al: "center" },
    { rotate: '0deg', top: '150px', left: '62.5%', al: "left" },
    { rotate: '0deg', top: '150px', left: '22.5%', al: "right" },
  ];

  // Trigger GSAP animation when items appear with unique animations per item
  useEffect(() => {
    if (showItems && !isMoving) {
      itemsRefs.current.forEach((item, index) => {
        if (!item) return;
        
        // Apply different animations based on the item index
        switch(index) {
          case 0:
            gsap.from(item, {
              y: 250,
              x:0,
              opacity: 0,
              scale: 1,
              duration: 0.9,
              ease: "expo.out"
            });
            break;
          case 1:
            gsap.from(item, {
              y: 100,
              x:-150,
              opacity: 0,
              scale: 1,
              duration: 0.9,
              ease: "expo.out"
            });
            break;
            case 2:
              gsap.from(item, {
                y: 100,
              x:150,
              opacity: 0,
              scale: 1,
              duration: 0.9,
              ease: "expo.out"
            });
            break;
          default:
            gsap.from(item, {
              opacity: 0,
              scale: 0,
              y: 250,
              duration: 0.5,
              ease: "back.out(1.7)"
            });
            break;
        }
      });
    }
  }, [showItems, isMoving]);

  return (
    <>
      <div className="wheel-spinner">
        <div {...bind()} ref={wheelRef} className="wheel">
          <img src="./wheel.png" alt="Wheel" />
        </div>
        <div className="wheel-items">
          {!isMoving && showItems &&
            itemsToShow.map((item, index) => (
              <div
                key={index}
                ref={(el) => (itemsRefs.current[index] = el)}
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
        <p>Inertia: {inertia}</p>
      </div>
    </>
  );
};

export default App;
