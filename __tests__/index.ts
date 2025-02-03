import { describe, expect, test } from '@jest/globals';
import { otherPlayer, Player, isSamePlayer } from '../types/player';

import { 
  Point, 
  Score, 
  deuce, 
  forty, 
  advantage, 
  game, 
  fifteen, 
  thirty, 
  scoreWhenForty
} from '../types/score';

import * as fc from 'fast-check';

describe('Tests for scoreWhenForty', () => {
  
  test('Given a player at 40 when the same player wins, score is Game for this player', () => {
    fc.assert(
      fc.property(
        fc.tuple(fc.constant<Player>('PLAYER_ONE'), fc.constant<Player>('PLAYER_TWO')),
        fc.constantFrom(fifteen(), thirty()), 
        ([winner, _], otherPoint) => { // `_` est ignoré ici
          const fortyData = { player: winner, otherPoint }; // ✅ Correction : FortyData bien formé
          const isValidPrecondition: boolean = isSamePlayer(fortyData.player, winner);

          if (!isValidPrecondition) return; // ✅ Remplace `fc.pre()` pour éviter l'erreur TS2775

          const score = scoreWhenForty(fortyData, winner);
          const expectedScore = game(winner);

          expect(score).toStrictEqual(expectedScore);
        }
      )
    );
  });

  test('Given player at 40 and other at 30 when other wins, score is Deuce', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<Player>('PLAYER_ONE', 'PLAYER_TWO'),
        (winner) => {
          const fortyData = { player: otherPlayer(winner), otherPoint: thirty() }; 
          const isValidPrecondition: boolean = !isSamePlayer(fortyData.player, winner) && fortyData.otherPoint.kind === 'THIRTY';

          if (!isValidPrecondition) return; 

          const score = scoreWhenForty(fortyData, winner);
          const expectedScore = deuce();

          expect(score).toStrictEqual(expectedScore);
        }
      )
    );
  });

  test('Given player at 40 and other at 15 when other wins, score is 40 - 30', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<Player>('PLAYER_ONE', 'PLAYER_TWO'),
        (winner) => {
          const fortyData = { player: otherPlayer(winner), otherPoint: fifteen() }; 
          const isValidPrecondition: boolean = !isSamePlayer(fortyData.player, winner) && fortyData.otherPoint.kind === 'FIFTEEN';

          if (!isValidPrecondition) return; 

          const score = scoreWhenForty(fortyData, winner);
          const expectedScore = forty(fortyData.player, thirty());

          expect(score).toStrictEqual(expectedScore);
        }
      )
    );
  });

});
