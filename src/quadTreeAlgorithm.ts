/* eslint-disable @typescript-eslint/no-unused-expressions */
import { CARD_HEIGHT, CARD_WIDTH } from './appConfig';

interface ICreateQuadTreeParams {
  x: number;
  y: number;
  width?: number;
  height?: number;
  capacity: number;
}

interface QuadTree {
  x: number;
  y: number;
  width: number;
  height: number;
  capacity: number;
  logos: ICard[];
  divided: boolean;
  northwest: QuadTree | null;
  northeast: QuadTree | null;
  southwest: QuadTree | null;
  southeast: QuadTree | null;
}

interface ICard {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface IQuadRange {
  x: number;
  y: number;
  width: number;
  height: number;
}

const createQuadTree = ({
  x,
  y,
  width = CARD_WIDTH,
  height = CARD_HEIGHT,
  capacity,
}: ICreateQuadTreeParams) => ({
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
});

function subdivide(quadTree: QuadTree) {
  const x = quadTree.x;
  const y = quadTree.y;
  const width = quadTree.width;
  const height = quadTree.height;

  quadTree.divided = true;
  quadTree.northwest = createQuadTree({
    x,
    y,
    width: width / 2,
    height: height / 2,
    capacity: quadTree.capacity,
  });
  quadTree.northeast = createQuadTree({
    x: x + width / 2,
    y,
    width: width / 2,
    height: height / 2,
    capacity: quadTree.capacity,
  });
  quadTree.southwest = createQuadTree({
    x,
    y: y + height / 2,
    width: width / 2,
    height: height / 2,
    capacity: quadTree.capacity,
  });
  quadTree.southeast = createQuadTree({
    x: x + width / 2,
    y: y + height / 2,
    width: width / 2,
    height: height / 2,
    capacity: quadTree.capacity,
  });
}

function insert(quadTree: QuadTree, logo: ICard): any {
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
    (quadTree.northwest !== null && insert(quadTree.northwest, logo)) ||
    (quadTree.northeast !== null && insert(quadTree.northeast, logo)) ||
    (quadTree.southwest !== null && insert(quadTree.southwest, logo)) ||
    (quadTree.southeast !== null && insert(quadTree.southeast, logo))
  );
}

function boundary(quadTree: QuadTree, logo: ICard) {
  return (
    logo.x >= quadTree.x &&
    logo.x + logo.width <= quadTree.x + quadTree.width &&
    logo.y >= quadTree.y &&
    logo.y + logo.height <= quadTree.y + quadTree.height
  );
}

function query(quadTree: QuadTree, range: IQuadRange): ICard[] {
  const logos: ICard[] = [];

  if (!boundary(quadTree, range)) {
    return logos;
  }

  for (const logo of quadTree.logos) {
    if (intersects(logo, range)) {
      logos.push(logo);
    }
  }

  if (quadTree.divided) {
    quadTree.northwest !== null && logos.push(...query(quadTree.northwest, range));
    quadTree.northeast !== null && logos.push(...query(quadTree.northeast, range));
    quadTree.southwest !== null && logos.push(...query(quadTree.southwest, range));
    quadTree.southeast !== null && logos.push(...query(quadTree.southeast, range));
  }

  return logos;
}

function intersects(logo: ICard, range: IQuadRange) {
  return (
    logo.x < range.x + range.width &&
    logo.x + logo.width > range.x &&
    logo.y < range.y + range.height &&
    logo.y + logo.height > range.y
  );
}
