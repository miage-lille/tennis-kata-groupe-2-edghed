import { some, none, match as matchOpt, Option } from 'fp-ts/Option';
import { pipe } from 'fp-ts/lib/function';
import { isSamePlayer, Player } from './player';

// Définitions des points valides (sans Forty)
export type Love = { kind: 'LOVE' };
export type Fifteen = { kind: 'FIFTEEN' };
export type Thirty = { kind: 'THIRTY' };
export type Point = Love | Fifteen | Thirty;

// Constructeurs de points
export const love = (): Love => ({ kind: 'LOVE' });
export const fifteen = (): Fifteen => ({ kind: 'FIFTEEN' });
export const thirty = (): Thirty => ({ kind: 'THIRTY' });

// Structure pour les scores normaux
export type PointsData = {
  playerOne: Point;
  playerTwo: Point;
};

// Structure Forty corrigée
export type FortyData = {
  player: Player;
  otherPoint: Point;
};

export type Forty = {
  kind: 'FORTY';
  fortyData: FortyData;
};

// Autres états du jeu
export type Deuce = { kind: 'DEUCE' };
export type Advantage = { kind: 'ADVANTAGE'; player: Player };
export type Game = { kind: 'GAME'; player: Player };
export type Points = {
  kind: 'POINTS';
  pointsData: PointsData;
};

export type Score = Points | Forty | Deuce | Advantage | Game;



export const points = (p1: Point, p2: Point): Score => ({
  kind: 'POINTS',
  pointsData: { playerOne: p1, playerTwo: p2 }
});

export const forty = (player: Player, otherPoint: Point): Forty => ({
  kind: 'FORTY',
  fortyData: { player, otherPoint }
});

export const deuce = (): Deuce => ({ kind: 'DEUCE' });
export const advantage = (player: Player): Advantage => ({ kind: 'ADVANTAGE', player });
export const game = (player: Player): Game => ({ kind: 'GAME', player });


export const incrementPoint = (point: Point): Option<Point> => {
  switch (point.kind) {
    case 'LOVE': return some(fifteen());
    case 'FIFTEEN': return some(thirty());
    case 'THIRTY': return none;
  }
};


export const scoreWhenForty = (currentForty: FortyData, winner: Player): Score => {
  if (isSamePlayer(currentForty.player, winner)) return game(winner);

  return pipe(
    incrementPoint(currentForty.otherPoint),
    matchOpt(
      () => deuce() as Score,  
      (newPoint) => forty(currentForty.player, newPoint)
    )
  );
};




export const scoreWhenPoint = (current: PointsData, winner: Player): Score => {
  const winnerPoint = current[winner === 'PLAYER_ONE' ? 'playerOne' : 'playerTwo'];
  
  return pipe(
    incrementPoint(winnerPoint),
    matchOpt(
      () => forty(winner, getOtherPoint(current, winner)),
      (newPoint) => updatePoints(current, winner, newPoint)
    )
  );
};


const updatePoints = (current: PointsData, winner: Player, newPoint: Point): Score => {
  return points(
    winner === 'PLAYER_ONE' ? newPoint : current.playerOne,
    winner === 'PLAYER_TWO' ? newPoint : current.playerTwo
  );
};

const getOtherPoint = (current: PointsData, winner: Player): Point => {
  return winner === 'PLAYER_ONE' ? current.playerTwo : current.playerOne;
};

export const scoreWhenDeuce = (winner: Player): Score => advantage(winner);

export const scoreWhenAdvantage = (advantagedPlayer: Player, winner: Player): Score => {
  return isSamePlayer(advantagedPlayer, winner) ? game(winner) : deuce();
};


export const score = (currentScore: Score, winner: Player): Score => {
  switch (currentScore.kind) {
    case 'POINTS': return scoreWhenPoint(currentScore.pointsData, winner);
    case 'FORTY': return scoreWhenForty(currentScore.fortyData, winner);
    case 'DEUCE': return scoreWhenDeuce(winner);
    case 'ADVANTAGE': return scoreWhenAdvantage(currentScore.player, winner);
    case 'GAME': return game(winner);
  }
};


export const newGame: Score = points(love(), love());


export const pointToString = (point: Point): string => {
  switch (point.kind) {
    case 'LOVE': return '0';
    case 'FIFTEEN': return '15';
    case 'THIRTY': return '30';
  }
};

export const scoreToString = (score: Score): string => {
  switch (score.kind) {
    case 'POINTS': 
      return `${pointToString(score.pointsData.playerOne)}-${pointToString(score.pointsData.playerTwo)}`;
    case 'FORTY':
      return `40-${pointToString(score.fortyData.otherPoint)}`;
    case 'DEUCE': return 'Deuce';
    case 'ADVANTAGE': return `Advantage ${score.player}`;
    case 'GAME': return `Game ${score.player}`;
  }
};