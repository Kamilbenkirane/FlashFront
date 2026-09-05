# FlashFront

Expo app for studying flashcards, managing deck subscriptions, viewing review
analytics, and discussing cards with the study assistant.

## Development

Run `bun install`, copy `.env.example` to `.env.local`, and run `bun dev` to start
Expo and the sibling `../flashcard-learning-system` API together. The backend
needs its own dependencies and `.env` configured. Run `bun start` to start only
Expo, or `bun ios` to build a development client.

See [authentication email setup](docs/auth.md) for password recovery and app redirects.

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
