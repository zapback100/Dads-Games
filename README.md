# Neon Pac-Man

A modern, neon-styled recreation of the classic arcade game Pac-Man, built with vanilla JavaScript and HTML5 Canvas.

![Pac-Man Screenshot](pacman_screenshot.png)
*(Note: You can add a screenshot here)*

## Features

- **Classic Gameplay**: Authentic movement, ghost AI (Blinky, Pinky, Inky, Clyde), and scoring.
- **Neon Aesthetics**: A vibrant, glowing visual style with a retro-futuristic feel.
- **Polished Mechanics**:
  - **Cruise Elroy**: Blinky speeds up as dots are consumed.
  - **Flashing Power Pellets**: Classic rhythmic blinking.
  - **Extra Life**: Awarded at 10,000 points.
  - **Hollow Walls**: Arcade-accurate double-line wall rendering.
- **Sound Effects**: Synthesized sound effects using the Web Audio API.

## How to Play

1.  Open `pacman.html` in any modern web browser.
2.  Click the **"READY?"** screen to initialize audio.
3.  Press **ANY KEY** to start the game.

## Controls

- **Arrow Keys**: Move Pac-Man (Up, Down, Left, Right).
- **C**: Toggle Color Mode (Classic / Neon).

## Technical Details

- **Engine**: Custom HTML5 Canvas engine.
- **Audio**: Procedural audio generation via `AudioContext` (no external assets).
- **No Dependencies**: Pure vanilla JS, HTML, and CSS.

## License

This project is for educational purposes. Pac-Man is a trademark of Bandai Namco Entertainment.
