# Automatic TestFlight releases

Every push to `main`, including a merged PR, runs **Deploy TestFlight**. It
typechecks the app, builds a signed IPA on GitHub's `macos-26` runner with
`eas build --local`, and uploads directly to Apple using `fastlane pilot`.
It uses the same release route as Celeste Chat; no paid Expo build or submission
service is used. EAS stores the signing credentials and increments build numbers.
Releases queue instead of cancelling an upload when another PR merges.

The workflow can also be run manually from GitHub Actions on `main`.
The production API URL is configured in `eas.json`; backend deployment is separate.

## One-time setup

Add these [GitHub Actions repository secrets](https://github.com/Kamilbenkirane/FlashFront/settings/secrets/actions):

- `EXPO_TOKEN`: an [Expo access token](https://expo.dev/accounts/kams96/settings/access-tokens)
  for the account that owns `@kams96/FlashFront`.
- `APP_STORE_CONNECT_API_KEY`: the existing FlashFront Apple API key in
  [Fastlane JSON format](https://docs.fastlane.tools/app-store-connect-api/#using-fastlane-api-key-json-file),
  with `key_id`, `issuer_id`, and `key` (the `.p8` contents). Fastlane uploads
  directly to Apple using this key; no Apple password or interactive login is needed.

The existing EAS project must have valid App Store signing credentials for
`com.kams96.FlashFrontKB24`. If they need renewal, run `eas credentials --platform ios`
locally before the next unattended build.

In App Store Connect, enable automatic distribution for your internal TestFlight
group. On your iPhone, open TestFlight → FlashFrontKB24 → App Information and enable
**Automatic Updates**. Updates become available after Apple finishes processing;
installation timing is controlled by TestFlight. This does not submit to App Store
review.
