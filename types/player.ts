export type Player = 'PLAYER_ONE' | 'PLAYER_TWO';

export const isSamePlayer = (p1: Player, p2: Player) => p1 === p2;


export const playerToString = (player: Player): string => {
  return player === 'PLAYER_ONE' ? 'Player 1' : 'Player 2';
};


export const otherPlayer = (player: Player): Player => {
  return player === 'PLAYER_ONE' ? 'PLAYER_TWO' : 'PLAYER_ONE';
};
