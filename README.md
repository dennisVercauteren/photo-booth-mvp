# AI Photobooth MVP

A local photobooth for proving one chain:

**camera → photo capture → AI image transformation → result**

It is intentionally small. There is no payment hardware, no printer, no database, and no kiosk shell. The browser talks only to the local server. The server talks to Gemini.

## Requirements

The booth runs on Windows, macOS, and Linux. Paths, scripts, and the camera API are the standard Node and browser ones, so the same repository is used on each system.

- Node.js current supported LTS (this project targets Node.js 22 or newer; Node.js 24 works)
- npm
- A webcam the browser can open, such as a Logitech C920s
- A Gemini API key with billing enabled for image generation
- A current Chrome, Edge, Safari, or Firefox

## Installation

From the repository root:

```bash
npm install
```

That installs the React client and the Express server together.

Copy the environment example and add your key.

macOS and Linux:

```bash
cp server/.env.example server/.env
```

Windows:

```bash
copy server\.env.example server\.env
```

`server/.env` is already created for local development with an empty key. Put the real key there. A root `.env.example` documents the same variables.

## Environment

The server reads `server/.env`.

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Gemini API key. Used only on the server. |
| `GEMINI_IMAGE_MODEL` | Image model id. Default `gemini-3.1-flash-image`. |
| `SAVE_OUTPUT_IMAGES` | Save generated portraits under `outputs/YYYY-MM-DD/`. Default `true`. |
| `SAVE_SOURCE_IMAGES` | Save the original camera photo. Default `false`. Leave this off unless you are debugging. |
| `PORT` | Server port. Default `3001`. |

Optional generation settings:

| Variable | Default | Purpose |
| --- | --- | --- |
| `GEMINI_TIMEOUT_MS` | `120000` | Maximum wait for one Gemini response. |
| `GEMINI_IMAGE_ASPECT_RATIO` | `5:4` | Matches a 5 by 4 inch landscape print. |
| `GEMINI_IMAGE_SIZE` | `1K` | Final size of the portrait the guest keeps. `512`, `1K`, `2K`, or `4K`. |
| `GEMINI_PREVIEW_SIZE` | `1K` | Size of the three choices sent to Gemini. The chosen portrait is enlarged locally to `GEMINI_IMAGE_SIZE`. |

The client reads `client/.env`.

| Variable | Purpose |
| --- | --- |
| `VITE_DEVELOPER_MODE` | `true` shows the developer panel, camera picker, test-image upload, fullscreen control, and generation time. |
| `VITE_API_BASE` | Leave empty in development. The Vite server proxies `/api` to `http://127.0.0.1:3001`. |

Never commit `server/.env` or `client/.env`.

## Start development

From the repository root:

```bash
npm run dev
```

This starts both processes:

- server: `http://127.0.0.1:3001`
- client: `http://127.0.0.1:5173`

Open the client URL in Chrome, Edge, Safari, or Firefox. The page title is **AI Photobooth**.

Other commands:

```bash
npm run typecheck
npm run dev:server
npm run dev:client
```

## Webcam permissions

1. Open the app at `http://127.0.0.1:5173` or `http://localhost:5173`. Camera access requires a secure page or localhost.
2. Choose **Start**, then a style, then allow the camera when the browser asks.
3. The webcam appears as a normal camera on Windows, macOS, and Linux. Close any other app that already has the device open.
4. The live preview is mirrored. The captured photograph is not. That is deliberate.
5. With developer mode on, open **Dev** in the corner to pick a camera when more than one is connected. The choice is remembered in this browser.
6. **Enter Fullscreen** is in that same panel. A later kiosk shell can replace it.
7. If a camera rejects the requested resolution or facing mode, the booth asks again with looser constraints.

The preview shows a 5:4 guide, the same shape as a 5 by 4 inch print, and the words **LOOK AT THE CAMERA**. The guide is only an overlay. The file sent to Gemini is the full camera frame. The generated picture is composed at 5:4 so it can print edge to edge on that paper.

## Touchscreens

Lists (the style grid, the staff settings) scroll with a finger swipe on any screen size. Two layers make sure of that:

1. **Raspberry Pi kiosk:** run `kiosk/setup-touch.sh` once as the kiosk user. Raspberry Pi OS turns touches into mouse clicks for every panel it knows (`mouseEmulation="yes"` in labwc). The script turns that off for all of them and adds a catch-all rule, so a new or bigger touchscreen also sends real touch.
2. **In the app:** if a screen still sends mouse events, dragging a list with the "mouse" scrolls it anyway (`client/src/lib/dragScroll.ts`). A drag never counts as a tap.

## Customer flow

1. Start
2. Choose a style
3. Camera preview
4. Take photo, with a 3-2-1 countdown and a short flash
5. Review the original photo
6. Use this photo, or retake
7. Wait while three portraits are created at the same time
8. Choose one of the three, then try another style, retake, download that choice, or start a new session

**Try another style** always sends the original camera photo again. It does not send the previous AI image, so identity does not drift from one style to the next.

**New session** drops the photos from the page and returns to the start screen.

There is a reserved step between style selection and the camera so payment can be added later. Printing can be added later from the result actions. Neither is implemented.

## Test image

With `VITE_DEVELOPER_MODE=true`, the camera screen includes **Use Test Image**. Upload the same JPEG more than once to compare prompts without retaking the photo.

## Gemini model

Checked against the official Gemini image generation docs on 5 October 2026:

- Model id: `gemini-3.1-flash-image` (Gemini 3.1 Flash Image, also called Nano Banana 2). This is the stable model. The preview id is deprecated.
- API: Interactions API, `ai.interactions.create` in `@google/genai`.
- Editing: one text prompt plus the source image as inline base64.
- Output shape: `response_format` with `type: "image"`, aspect ratio, and image size.
- The legacy `generateContent` image API is not used.

Documentation: [https://ai.google.dev/gemini-api/docs/image-generation](https://ai.google.dev/gemini-api/docs/image-generation)

The model name is read from `GEMINI_IMAGE_MODEL`. Change that variable if Google publishes a replacement. Do not scatter a new model id through the UI.

The server keeps a provider boundary, `ImageGenerationProvider`. `GeminiImageProvider` is the first implementation. Another provider can be added later without rewriting the booth flow.

Style prompts live only on the server, in `server/src/styles/`. The browser sends a style id such as `drag-queen`. Every request is built as:

1. Base identity prompt, written for one person or a whole group
2. Style prompt
3. Group consistency rules, so nobody is dropped, merged, or replaced
4. One of three variation directions, so the pictures differ in pose and light
5. Output requirements

Identity preservation is the priority for every person in the photo: face, age, hair, and distinguishing features stay, and the number of people stays the same. Clothing, setting, and light change. A group of two, three, or ten is kept as that same group.

One confirmed photo starts three Gemini calls in parallel at the preview size, which is 1K unless you change `GEMINI_PREVIEW_SIZE`. The booth shows those portraits, and the guest picks one. The chosen portrait is then enlarged on this computer to `GEMINI_IMAGE_SIZE` (2K in the local setup). That enlargement does not call Gemini.

Three 2K portraits would be about $0.30. Three 1K portraits are about $0.20. Asking Gemini to redraw the winner at 2K would spend the difference again, so the booth does not do that. The local enlargement is a sharp scale-up, not new detail from the model.

## Gemini troubleshooting

The screen shows a short message. The technical reason is printed in the server terminal and, for the browser, in the developer console. Generation attempts are also appended to `server/logs/generations.jsonl` without the photo.

| What you see | What to check |
| --- | --- |
| Portrait fails immediately | `GEMINI_API_KEY` is missing or rejected. Create a key in Google AI Studio and restart the server. |
| "isn't included in this API plan" | The key works, but `gemini-3.1-flash-image` has no free-tier quota. Enable billing for that Google AI project at [ai.dev/rate-limit](https://ai.dev/rate-limit), and use an API key created in the billed project. |
| "The booth is busy" | A real rate limit. Wait, then try again. |
| "Taking too long" | The request exceeded `GEMINI_TIMEOUT_MS` (default 120 seconds). |
| Model errors in the server log | `GEMINI_IMAGE_MODEL` is not a current image model. Confirm the id in the docs linked above. |
| API shape errors in the server log | Google changed the Interactions API. Update `@google/genai` and follow the current image-editing sample. |
| No image in the response | The model answered without an image. The server treats that as a failed portrait. |
| Camera works, generation does not | The client cannot reach port 3001. Keep `npm run dev` running so both processes stay up. |

## Privacy

- The Gemini API key stays in `server/.env`. The browser never receives it. `/api/meta` returns the model name only.
- The browser sends the photo to `POST /api/generate` on the local server. The server sends it to Gemini.
- Original photos are not written to disk unless `SAVE_SOURCE_IMAGES=true`.
- Generated portraits are written to `outputs/YYYY-MM-DD/` when `SAVE_OUTPUT_IMAGES=true`, using random file names.
- Logs record style, model, variant, duration, timestamp, success, and source resolution. They do not record the image.
- The Gemini request sets `store: false` so the interaction is not kept for later retrieval by the API.

## Project layout

```text
client/     React + TypeScript + Vite booth UI
server/     Express API, style prompts, Gemini provider
outputs/    Generated portraits, when saving is enabled
```

Useful server files:

- `server/src/providers/types.ts` — image provider interface
- `server/src/providers/geminiImageProvider.ts` — Gemini implementation
- `server/src/styles/styleService.ts` — style lookup and final prompt
- `server/src/routes/generate.ts` — `POST /api/generate`

Useful client files:

- `client/src/config/styles.ts` — public style cards, without prompts
- `client/src/config/flow.ts` — where a future payment step plugs in
- `client/src/camera/capture.ts` — full-frame JPEG capture, preview mirror stays in CSS

## API

`POST /api/generate` accepts `multipart/form-data` with `image` and `styleId`. The server creates three variations in parallel and returns the ones that succeeded.

Success:

```json
{
  "success": true,
  "images": [
    {
      "imageBase64": "...",
      "mimeType": "image/png",
      "metadata": {
        "styleId": "drag-queen",
        "model": "gemini-3.1-flash-image",
        "durationMs": 8400,
        "sourceWidth": 1920,
        "sourceHeight": 1080,
        "generatedAt": "2026-10-05T12:00:00.000Z",
        "variant": 1
      }
    }
  ]
}
```

`mimeType` is the type Gemini actually returned. `variant` is 1, 2, or 3.

Download names look like `photobooth-drag-queen-2-2026-10-05-123456.png`. The number is the chosen portrait.

## Transformation Machine experience (2026-10)

A theatrical, touch-first look is available in **Staff → Look**. It is the default for
fresh installations. Existing booths retain saved Carnival / Neon / Elegant settings until
you explicitly change them; the older looks and soundtracks are still supported.

- **Visuals:** a portal-inspired attract screen, scan-line camera, rotating generation
  effects, dramatic (but short) result reveal, and reduced-motion fallbacks.
- **Audio:** a new `machine` sound theme with event-driven synth cues, per-style stings,
  countdown impacts and a result fanfare. Playback requires an initial guest interaction,
  as browsers do not permit unattended audio.
- **Portraits:** the three server-side variations are now Cinematic, Editorial and Wild
  Card. All still use the original camera photo; identity and group preservation remain
  higher priority than artistic direction. The number of variations is still configurable.
- **Collector card:** the result screen has a second download option that composites
  the chosen image with a graphic frame and typography **locally** on the booth. The
  existing Download action exports the unaltered generated portrait.
- **Waiting:** messages cycle theatrically; they **do not** represent real Gemini progress.
  There is intentionally no fabricated time estimate or percentage.

### Operator smoke test

1. Open Staff → Look; select the Transformation Machine visual AND sound themes, then Save.
2. Start a session. Select Viking, then repeat with K-pop or Astronaut; listen for
   different style stings and check camera capture / the countdown.
3. Confirm the photograph, watch the looping waiting screen and ensure it stops on errors
   and when the response arrives. Retry an error without restarting the kiosk.
4. Generate three images and confirm the different compositions and readable choice names.
5. Verify both **Download** (original image) and **Save Collector Card** (composited PNG).
   Include a group photo and check that faces at the edges remain visible.
6. Test touch input, 720p/small displays, slow generation, audio volume, Raspberry Pi
   performance, and `prefers-reduced-motion` before a public deployment.

GitHub Actions runs `npm ci`, `npm run typecheck`, and `npm run build` on every PR.
A real image-generation smoke test still requires your billed Gemini key and camera.

## Physical booth design gallery

The operator's **Staff → Demo** tab has two independent collections:

- **Physical booths:** committed images in `client/public/booth-designs/` ship with the GitHub release and are available on kiosk deployments after building the client. Use names such as `01-kpop-festival.webp`; JPG, PNG and WebP are supported, alphabetically sorted.
- **Portrait examples:** operator-provided local pictures in `shared/gallery/` (or `BOOTH_GALLERY_DIR`, e.g. `/opt/photobooth/shared/gallery/`). These do not need to be committed and survive upgrades.

The server lists both under `GET /api/gallery` as `pictures` and `boothDesigns`, and serves the files under `/api/gallery/photos/` and `/api/gallery/booth-designs/`. The /api route ensures previews work through the development proxy as well as the production kiosk process. The old /gallery path remains available for compatibility.

To add more booth renderings, commit the new picture to `client/public/booth-designs/`, deploy the release (including a fresh client build), and reopen **Staff → Demo → Physical booths**. Files are sorted by name; no code change is needed.
