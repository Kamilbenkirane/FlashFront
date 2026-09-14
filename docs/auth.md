# Authentication

## Email links

Shuffle exchanges Supabase email token hashes through its backend. Email
links must contain `token_hash` and `type`; the default Supabase confirmation
link consumes the token first and returns a Supabase session the app does not use.

In Supabase project `ynouixvprefkbscxldan`, set the reset-password and
confirmation email templates to `supabase/templates/recovery.html` and
`supabase/templates/confirmation.html`. Other redirects keep Supabase's standard confirmation link. App schemes are
literal in the templates because Go's HTML escaping rejects dynamic custom-scheme
URLs such as `href="{{ .RedirectTo }}"`.

Allow these exact redirect URLs under Authentication → URL Configuration:

```text
flashfront://auth/recovery
flashfront://auth/callback
flashfront:///auth/recovery
flashfront:///auth/callback
exp://127.0.0.1:8081/--/auth/recovery
exp://127.0.0.1:8081/--/auth/callback
exp://localhost:8081/--/auth/recovery
exp://localhost:8081/--/auth/callback
```

The triple-slash URLs support already-installed builds. Current builds generate
the double-slash URLs. Open recovery emails on the device running the app;
Expo Go links must open inside the simulator running the local project.
Request a new email after updating these settings: previously sent emails retain
their old links. Never commit real email tokens, passwords, or Supabase keys.

## Google sign-in

The app opens Supabase's hosted Google flow
(`EXPO_PUBLIC_SUPABASE_URL/auth/v1/authorize?provider=google`) in the system
auth browser (`expo-web-browser`) and receives the Supabase session at
`flashfront://auth/callback`, the same redirect the confirmation email uses. It
then posts the returned refresh token to the backend `/auth/refresh` endpoint,
so a Google session gets the same app session, device label, and refresh
handling as a password sign-in. The backend needs no new endpoint, and the app
still never holds a Supabase client or publishable key.

`EXPO_PUBLIC_SUPABASE_URL` selects the project: `.env.example` for local
development and `eas.json` for every build profile. Google sign-in is the only
feature that reads it; when it is unset the button explains what is missing.

One-time setup in Supabase project `ynouixvprefkbscxldan`:

1. In Google Cloud Console, create an OAuth client of type **Web application**
   whose authorized redirect URI is
   `https://ynouixvprefkbscxldan.supabase.co/auth/v1/callback`.
2. Under Authentication → Sign In / Providers, enable **Google** and paste that
   client ID and secret.
3. Keep the `auth/callback` redirect URLs listed above allowed; Google sign-in
   reuses them. Add the web origin's `/auth/callback` if the web build needs it.

A Google account whose email already has a password account signs in to that
same account; Supabase links identities with a verified matching email.

`expo-web-browser` is a native module: rebuild the dev client (`bun ios`) and
ship a new TestFlight build before testing on a device. Expo Go already
includes it.
