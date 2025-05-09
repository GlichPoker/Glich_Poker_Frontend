# Glich Poker Special Rules

This document outlines the special rules for our poker game, which are determined by the weather conditions of the lobby owner's location. These weather-based rules add a unique and dynamic element to the gameplay experience.

## Weather-Based Map Types

Our game uses a weather API to determine the current weather conditions of the lobby owner. The location is determined at the lobby creation and could later be changed by voting. Based on this data, the game will load one of the different map types, each with its own set of special rules:

### 1. Tear Map (Rainy Weather)
When the lobby owner's location is experiencing rain, the game loads the "Tear Map" with the following special rules:
- **Slippery Cards**: Each player may exchange one card from their hand once per round. (should work)

- Maybe later: Flood Insurance: If a player loses with a flush, they receive 25% of their bet back.


### 2. Dry Map (Sunny Weather)
When the lobby owner's location is sunny, the game loads the "Dry Map" with the following special rules:
- **Mirage**: Once every 5 rounds, a player can bluff by showing a false or real card to one opponent. (will do tmrw)
- **Drought Tax**: The big blind increases by 5% every third round. (should work)

- Maybe later: Heat Wave: High card values (Jack, Queen, King, Ace) are worth 1.5x during showdown comparisons.


### 3. Cloud Map (Cloudy Weather)
When the lobby owner's location is cloudy, the game loads the "Cloud Map" with the following special rules:
- **Fog of War**: Two community cards remain face down until the showdown. (should work)

- Maybe later: Lightning Strike: Once every 10 rounds, any player can force another player to reveal one of their cards.

### 4. Frozen Map (Snowy Weather)
When the lobby owner's location is experiencing snow, the game loads the "Frozen Map" with the following special rules:
- **Blanket**: Players receive 3 hand cards instead of 2. (should work)

Maybe later: 
- **Frozen Assets**: Players can "freeze" one of their hole cards, preventing it from being affected by any special abilities.
- **Ice Shield**: Once every 10 rounds, a player can block a raise, the player does not have to raise this round and can simply check. 
- **Avalanche**: If a player wins three hands in a row, the blinds double for that player only in the next round.

### 5. Void Map (Special)
This is a special map type that may be triggered under specific conditions or as a random event:
- **Void Discard**: Each player may discard their entire hand once at the start of each round and receive a new hand.
- **Black Hole**: The pot occasionally "absorbs" small blind amounts, adding them to the next round's pot.
- **Event Horizon**: Once per game, the dealer can reshuffle all cards and deal new hands to everyone.

## Idea foundry

In addition to the five main map types there could also be more, here is the space for inspiration and maybe future development:

### 6. Windy Map
When the lobby owner's location is experiencing windy conditions, the game loads the "Windy Map" with the following special rules:
- **Gust**: Once every 10 rounds, a player can "blow away" one of the first 3 community card, replacing it with a new card from the deck.
- **Windfall**: If a player has been card-dead (no playable hands) for three consecutive rounds, they receive an extra card on the next deal (must discard one after seeing it).
- **Futuresight**: The player with the least amount of funds gets to see the next card that would be dealt before deciding to check, bet, or fold.

### 7. Extreme Map (Tornadoes, Hurricanes, etc. only for the very dedicated players...)
When the lobby owner's location is experiencing extreme weather events, the game loads the "Extreme Map" with the following special rules:
- **Chaos Theory**: At the start of each round, there's a 20% chance that the hand rankings will be inverted (lowest hand wins), this might not be public to screw with players(ultimate gamba).
- **Eye of the Storm**: Once per game, a player can call for a "calm phase" where all special abilities are suspended for one round.
- **Debris Field**: At random intervals, "debris" cards are added to the community cards that have special effects when used in a hand (e.g., multipliers, special actions).

### 8. Foggy Map
When the lobby owner's location is experiencing foggy conditions, the game loads the "Foggy Map" with the following special rules:
- **Blind Navigation**: One of your playing cards is hidden until the round ends; only the total pot amount is visible.
- **Clearing**: Once per 5 rounds, a player can "clear the fog" and see all of his own playing cards propperly for one round.
- **Misty Memory**: Players have 10 seconds to memorize their cards at the beginning of each hand before they are temporarily hidden.

### 9. Thunderstorm Map
When the lobby owner's location is experiencing thunderstorms, the game loads the "Thunderstorm Map" with the following special rules:
- **Lightning Round**: Random "lightning rounds" occur where all actions must be completed within 10 seconds or the hand is automatically folded.
- **Thunder Clap**: Once per game, a player can issue a "thunder clap" that forces all players to make their next decision with only 5 seconds to decide.
- **Power Surge**: When a player wins with a pair of Aces (double A's :DDDD) ("lightning rods"), they get to double their winnings from the pot. This would increase the global amount. 

## Implementation Notes

- Weather conditions should be fetched at the start of each new lobby creation.
- The map type should be prominently displayed to all players.
- Visual cues and animations should reflect the current map type.
- Special rule actions should have dedicated UI components for ease of use.
- Special map types can be toggled in the lobby settings.

## Rule Balancing

These special rules are designed to add variation and strategic depth without fundamentally altering the core poker gameplay. They should be balanced to ensure:

1. No single rule provides an overwhelming advantage
2. Each map type feels distinct and thematically appropriate
3. Special abilities can be countered or played around
4. The rules add fun and variation without excessive complexity

## Future Considerations

- Seasonal special events with additional map types
- Player-voted rule modifications for private lobbies
- Weather combination maps that blend rules from multiple weather conditions
