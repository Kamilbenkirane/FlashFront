# Redesign rationale

Source review: 5 September 2026. The recommendations below translate platform guidance and learning research into the existing app; the studies do not validate this particular design.

## Clear content, quiet controls

The visual direction uses deep navy surfaces, warm text, and selective gold emphasis. Study content stays opaque and readable. Glass belongs to the floating navigation/control layer, with visible boundaries and solid alternatives when transparency is reduced.

Apple's **WWDC26** guidance separates familiar navigation from expressive content and recommends using accent color to convey actions, selection, and status. Its **2026 Design Awards** recognize Moonlitt for intuitive interaction and Liquid Glass integration, Structured for a simple layout that includes breaks, and Guitar Wiz for VoiceOver, Dynamic Type, contrast, and non-color cues. These are observed design references, not evidence that a particular visual style improves learning.

- [Communicate your brand identity on iOS — WWDC26](https://developer.apple.com/videos/play/wwdc2026/251/)
- [2026 Apple Design Awards](https://developer.apple.com/design/awards/)
- [Meet Liquid Glass — material placement and hierarchy](https://developer.apple.com/videos/play/wwdc2025/219/)
- [What's new in SwiftUI — WWDC26, refined glass and system tint preferences](https://developer.apple.com/videos/play/wwdc2026/269/)

## Accessible, purposeful interaction

Controls need at least 44-point touch areas. Normal text targets 4.5:1 contrast; necessary graphical controls target 3:1. Labels accompany color-coded feedback. Modal transitions respect Reduce Motion. The assistant's image and chart viewers use solid backgrounds; draft previews switch sides without a spatial animation and grow with their content. Markdown and math continue through the existing renderer.

- [Apple UI design tips](https://developer.apple.com/design/tips/)
- [W3C text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [W3C non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- [Apple Reduced Motion evaluation criteria](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria)
- [React Native accessibility preferences](https://reactnative.dev/docs/accessibilityinfo)

## Progress that supports learning

Retrieval practice and spaced review support later retention. The interface therefore gives recall a calm, focused space and preserves the existing review scheduler. Assistant prompts offer hints, memory cues, examples, and visual explanations; selecting one only prepares an editable draft. Saving a proposed card remains an explicit action.

Progress should reflect real practice and review outcomes. A completed session deserves a satisfying finish; a missed day deserves a welcoming return. Duolingo reports engagement benefits from streak celebrations and flexibility, but those results do not establish memory gains. Gamification research also finds that individual elements affect different motivational needs, so points or decorative rewards alone should not be described as evidence of mastery.

- [Roediger and Karpicke, 2006 — test-enhanced learning](https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.2006.01693.x/)
- [Karpicke and Blunt, 2011 — retrieval practice and comprehension](https://pubmed.ncbi.nlm.nih.gov/21252317/)
- [Cepeda et al., 2008 — spacing and retention](https://escholarship.org/uc/item/0kp5q19x)
- [Sailer et al., 2017 — specific motivational effects of gamification](https://www.sciencedirect.com/science/article/pii/S074756321630855X)
- [Duolingo — streak celebrations and flexibility](https://blog.duolingo.com/how-duolingo-streak-builds-habit/)

## Implementation and verification

The app now has a navy and gold identity, a matching launcher icon and launch screen, and a dedicated flow for recall, deliberate reveal, and self-assessment. The session target uses the saved daily-goal preference as a **review target for the current session**; it does not claim to measure today's total or mastery. Learners can finish early, see a recap, or continue past the target. Horizontal swipes remain optional after revealing; vertical gestures scroll long content.

Shuffle's vector logo combines two offset flashcards and an S cutout. The app includes opaque 1024px default, dark, and grayscale tinted iOS icons with consistent geometry, plus a transparent Android adaptive foreground and launch mark. Corners are left square for system masking, following [Apple's icon guidance](https://developer.apple.com/design/human-interface-guidelines/app-icons) and [Expo's icon configuration](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/). A native build is required for launcher changes; JavaScript updates alone cannot replace an installed icon.

Library subscriptions, review scheduling and persistence, authentication, account management, assistant streaming, proposed-card approval, images, and charts keep their existing services and contracts. No backend, service, provider, scheduler, dependency, or lockfile changes are included. The display name is Shuffle; the bundle identifier, URL scheme, and deployment identity are unchanged.

The installed Expo Blur material supplies the glass-inspired control layer on iOS and web. It does **not** claim to reproduce Apple's native Liquid Glass refraction or automatically inherit its tint slider. Reduced Transparency (iOS or supported browser media query) and forced colors select an opaque fallback; Android uses the solid surface. Reduced Motion avoids spatial transitions. Long study content expands rather than being forced into a tiny fixed card; the web renderer shares the existing sanitized markdown/math pipeline.

Verification commands:

```sh
bun run typecheck
bun run test
bun run check
bunx expo export --platform web --output-dir dist
python3 -m http.server 8094 --bind 127.0.0.1 --directory dist
# In another terminal, with Python Playwright and Chromium available:
python3 scripts/check-redesign.py
```

The browser check intercepts API calls using synthetic data. It exercises the real app UI without writing to the backend and saves screenshots to the ignored `artifacts/` directory. The separate auth/onboarding visual pass covers 320px and 1280px widths, verification and recovery paths, validation, and preserved setup choices. Native startup has also been checked in the iPhone 17 simulator using Expo Go. A production device build is still needed to verify the new launcher assets and platform-specific glass rendering outside Expo Go.
