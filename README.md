# Shuffle

Expo app for studying flashcards, managing deck subscriptions, viewing review
analytics, and discussing cards with the study assistant.

See the [design rationale and visual checks](docs/redesign.md).

## Development

Run `bun install`, copy `.env.example` to `.env.local`, and run `bun dev` to start
Expo and the sibling `../flashcard-learning-system` API together. The backend
needs its own dependencies and `.env` configured. Run `bun start` to start only
Expo, or `bun ios` to build a development client.

See [authentication email setup](docs/auth.md) for password recovery and app redirects.

## Offline and startup

The app opens from what it last saw, then talks to the server in the background:

- The last session, profile, decks, study cards, analytics, and assistant model
  lists are cached on the device (`src/services/dataCache.ts`). Screens show the
  cached value at once and refresh it silently; a request that fails while
  cached data is shown never turns into an error screen.
- Losing the network never signs you out. The stored session is restored on
  launch and only a deliberate rejection from the auth server clears it.
- Reviews are always written to the local outbox first and synced in the
  background, on reconnection, and when the app returns to the foreground. The
  cards of a session are a snapshot taken when it starts, kept in step with
  your reviews locally; the server copy is used at the next session start.

## Checks

```bash
bun run typecheck
bun run test
```

## TestFlight

Merging a PR into `main` automatically builds iOS on GitHub Actions and uploads
it to TestFlight. The workflow uses EAS locally and uploads with Fastlane; it
does not require paid Expo builds or submissions. You can also run
**Deploy TestFlight** manually from GitHub Actions.

See [release setup](docs/testflight.md) for credentials and automatic updates.
The production API URL is in `eas.json`; backend deployment is separate.
