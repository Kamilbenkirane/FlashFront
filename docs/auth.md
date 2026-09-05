# Authentication emails

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
