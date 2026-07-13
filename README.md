# RANDY FISH — THE CONSCIOUSNESS EXPERIENCE

> Not a website. An interactive journey.

A cinematic, scroll-driven WebGL experience built with **Three.js** and **GSAP ScrollTrigger**.
One camera, one endless dolly through eight rendered worlds — no page sections, no video,
everything generated in real time (including the book covers, the audio, and the egg's cracks).

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # serve the production build
```

## The journey

| Scene | What happens |
|---|---|
| **I — Arrival** | Black screen. Silence. A heartbeat (synthesized, lub-DUB). Millions of stars are born and the camera starts flying. *"Before consciousness… there was silence."* |
| **II — Birth of Consciousness** | A golden seed follows your cursor. Every movement of your hand spawns particles — you are literally creating the universe, live, in WebGL. |
| **III — Randy Materializes** | ~4,200 particles converge (reverse-dust effect) into a holographic figure. His eyes open last and track your cursor. He breathes. *"I've been waiting for you."* — typed live. |
| **IV — Talk to Randy** | A conversational avatar panel with a local persona engine (keyword-matched, typed replies). Swap `randyReply()` in `src/main.js` for a real LLM endpoint + voice API when keys are available — the UI is already wired. |
| **V — Living Books** | The four books are real 3D objects with procedurally painted covers. Hover: they float, tilt, glow and shed golden particles. Click: the world of the book opens. |
| **VI — The Galaxy Library** | A spiral galaxy where every planet is a book. Click one — the camera punches to light speed and the book-world opens. |
| **VII — DNA Timeline** | Travel along a rotating double helix. Six eras of Randy's life light up in sequence: Military → Engineering → Jewelry → AI → Writing → Future. |
| **VIII — Infinite Scroll** | There are no pages. The entire journey is one continuous scrubbed camera move (GSAP ScrollTrigger → Three.js dolly). |
| **IX — Consciousness Network** | Earth appears, covered in clustered light-minds. Pulses travel along golden arcs. One oversized pulsing node is *you*. |
| **XI — The Golden Egg** | The egg leans toward your cursor, swells with your heartbeat, and cracks — the crack pattern is randomly generated, so **every visitor sees different cracks**. After exactly **90 seconds** it hatches (touching the egg speeds it up). Golden light floods the screen. |
| **XII — Reality Break** | The screen glitches into a stylized "consciousness terminal" that appears to take over… then reality is restored and the classic black-and-gold author site (from the design mock) is revealed: hero, book grid, quotes, newsletter, footer. |

## Audio

100% synthesized with the WebAudio API — no audio files:

- heartbeat (`lub-DUB` sine thumps) whose tempo accelerates as the story darkens
- deep-space ambient pad (detuned drones + slow LFO filter)
- stereo whooshes on every scene transition
- a rising harmonic "choir" when the egg hatches
- static bursts during the reality break

## Micro-interactions

- custom golden cursor (dot + lagging ring)
- magnetic buttons that lean toward your hand
- camera parallax — the cursor bends the view
- heartbeat FOV pulse
- particle sparkles on hovered books

## Stack

`three` · `gsap` (ScrollTrigger) · `vite` · WebAudio API · canvas-generated textures

## Structure

```
index.html          overlay DOM: gate, captions, HUD, chat, modal, glitch, final site
src/main.js         orchestration — ScrollTrigger, timers, chat, cursor, UI
src/experience.js   the Three.js world: all 8 scene-groups + camera dolly
src/audio.js        synthesized audio engine
src/covers.js       book data + procedural cover painting
src/style.css       black & gold design system
```
