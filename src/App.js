import './App.css';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

import ReactLogo from './logo.svg';

const GLOBAL_WIDTH = window.innerWidth;
const GLOBAL_HEIGHT = window.innerHeight;

function createQuadTree(x, y, width, height, capacity) {
  return {
    x,
    y,
    width,
    height,
    capacity,
    logos: [],
    divided: false,
    northwest: null,
    northeast: null,
    southwest: null,
    southeast: null,
  };
}

function subdivide(quadTree) {
  const x = quadTree.x;
  const y = quadTree.y;
  const width = quadTree.width;
  const height = quadTree.height;

  quadTree.divided = true;
  quadTree.northwest = createQuadTree(x, y, width / 2, height / 2, quadTree.capacity);
  quadTree.northeast = createQuadTree(x + width / 2, y, width / 2, height / 2, quadTree.capacity);
  quadTree.southwest = createQuadTree(x, y + height / 2, width / 2, height / 2, quadTree.capacity);
  quadTree.southeast = createQuadTree(
    x + width / 2,
    y + height / 2,
    width / 2,
    height / 2,
    quadTree.capacity
  );
}

function insert(quadTree, logo) {
  if (!boundary(quadTree, logo)) {
    return false;
  }

  if (quadTree.logos.length < quadTree.capacity) {
    quadTree.logos.push(logo);
    return true;
  }

  if (!quadTree.divided) {
    subdivide(quadTree);
  }

  return (
    insert(quadTree.northwest, logo) ||
    insert(quadTree.northeast, logo) ||
    insert(quadTree.southwest, logo) ||
    insert(quadTree.southeast, logo)
  );
}

function boundary(quadTree, logo) {
  return (
    logo.x >= quadTree.x &&
    logo.x + logo.width <= quadTree.x + quadTree.width &&
    logo.y >= quadTree.y &&
    logo.y + logo.height <= quadTree.y + quadTree.height
  );
}

function query(quadTree, range) {
  const logos = [];

  if (!boundary(quadTree, range)) {
    return logos;
  }

  for (const logo of quadTree.logos) {
    if (intersects(logo, range)) {
      logos.push(logo);
    }
  }

  if (quadTree.divided) {
    logos.push(...query(quadTree.northwest, range));
    logos.push(...query(quadTree.northeast, range));
    logos.push(...query(quadTree.southwest, range));
    logos.push(...query(quadTree.southeast, range));
  }

  return logos;
}

function intersects(logo, range) {
  return (
    logo.x < range.x + range.width &&
    logo.x + logo.width > range.x &&
    logo.y < range.y + range.height &&
    logo.y + logo.height > range.y
  );
}

// const quadTree = createQuadTree(0, 0, window.innerWidth, window.innerHeight, 2);

// const logo1 = { x: 10, y: 10, width: 300, height: 300 };
// const logo2 = { x: 20, y: 20, width: 300, height: 300 };

// insert(quadTree, logo1);
// insert(quadTree, logo2);
// insert(quadTree, logo3);

// const range = { x: 15, y: 15, width: 20, height: 20 };

// const logos = query(quadTree, range);

// console.log(logos); // [logo1, logo2]

const App = () => {
  const [logoAProps, logoAApi] = useSpring(() => ({
    x: 200,
    y: 200,
    zIndex: 1,
    scale: 1
  }));

  const bindLogoAProps = useDrag((params) => {
    const logoAx = logoAProps.x.get();
    const logoAy = logoAProps.y.get();

    // console.log(params, 'params')
    // console.log(params.xy)
    // console.log((((params.xy[0])^2 + (params.xy[1])^2)^(1/2))/2, 'square')
    // console.log(logoAProps.x.get(), 'logoAProps')

    logoAApi.start({ x: (200 + params.offset[0]), y: (200 + params.offset[1]), zIndex: params.down ? 100 : 1});
    // logoAApi.start({ zIndex: params.down ? 100 : 1, immediate: params.down })



    const quadTree = createQuadTree(0, 0, window.innerWidth, window.innerHeight, 2);

    const logo1 = { x: logoAx, y: logoAy, width: 300, height: 300 };
    const logo2 = { x: logoBProps.x.get(), y: logoBProps.y.get(), width: 300, height: 300 };

    insert(quadTree, logo1);
    insert(quadTree, logo2);

    const range = { x: logoAx, y: logoAy, width: 300, height: 300 };

    const logos = query(quadTree, range);

    // console.log(logos, "LOGOS");

    if (logos.length > 1) { 
      logoAProps.x.set(logoBProps.x.get())
    }

  }, { bounds: { left: 0 - 200, right: GLOBAL_WIDTH - 300 - 200, top: 0 - 200, bottom: (GLOBAL_HEIGHT - 300 - 200 - 20) } });

  const [logoBProps, logoBApi] = useSpring(() => ({
    x: 300,
    y: 600,
    zIndex: 1
  }));
  const bindLogoBProps = useDrag(({ offset: [x, y], down }) => {
    logoBApi.start({ x, y, zIndex: down ? 100 : 1 });
  }, { bounds: { left: 0, right: GLOBAL_WIDTH - 300, top: 0, bottom: (GLOBAL_HEIGHT - 300 - 20) } });

  return (
    <div className="App">
      <header className="App-header">
        <animated.div className="logo-container" {...bindLogoAProps()} style={{ ...logoAProps, touchAction: 'none', backgroundColor: 'red', userSelect: 'none' }}>
          <img style={{ touchAction: 'none' }} src={ReactLogo} className="App-logo" alt="logo" />
        </animated.div>
        <animated.div className="logo-container" {...bindLogoBProps()} style={{ ...logoBProps, touchAction: 'none', backgroundColor: 'green', userSelect: 'none' }}>
          <img style={{ touchAction: 'none' }} src={ReactLogo} className="App-logo" alt="logo" />
        </animated.div>
      </header>
    </div>
  );
};

export default App;
