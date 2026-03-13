# Night Shift Escape

Static browser prototype for a solo horror-defense run.

## What is in this prototype

- Claim one vacant room.
- Earn gold while standing on the bed.
- Spend gold on random guardian summons.
- Spend gold on random intel to reveal escape progress.
- Survive blackouts and repair the generator.
- Handle infected hiders and room breaches if you camp too long.
- Escape after collecting enough map fragments and both sigils.
- Use `Insert` as the only admin power to add gold.

## Run locally

Open [index.html](/Users/hong/main/test/game/index.html) in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Controls

- `WASD`: move in keyboard mode
- `Tab`: toggle keyboard / click-to-move
- `E`: context interact
- `R`: reinforce your room door
- `F1`: toggle admin mode
- `Insert`: add gold when admin mode is on

## Vercel

This project is plain static HTML/CSS/JS, so it can be deployed directly on Vercel without build tooling.
