# Shuffle design rationale

Source review: 5 September 2026.

## Focus on the task

Each screen gives priority to its current task: choose decks, recall an answer, assess a review, or ask for help. Cards, quiet metadata, and clear grouping retain a useful visual structure. Titles and actions use direct language; promotional headings, motivational slogans, and repeated instructions are omitted. Navy surfaces, warm text, and selective gold emphasis provide the identity without competing with the cards.

This follows [Apple's writing guidance](https://developer.apple.com/design/human-interface-guidelines/writing) and [WWDC26's Principles of great design](https://developer.apple.com/videos/play/wwdc2026/250/): organize around purpose, use concise language, and make actions apparent. [Google's communication guidance](https://codelabs.developers.google.com/codelabs/material-communication-guidance) similarly recommends essential, contextual details. [NN/G's aesthetic and minimalist design guidance](https://www.nngroup.com/articles/aesthetic-minimalist-design/) supports retaining necessary information while reducing visual competition.

## Product and creator references

These are design observations and craft guidance, separate from learning research:

- **Linear, March 2026:** Charlie Aufmann and Maxime Heckel describe preserving useful information density while dimming navigation, softening separators, and making headers predictable. Shuffle similarly keeps card metadata and clear groups with quieter supporting controls. [Design refresh](https://linear.app/now/behind-the-latest-design-refresh).
- **Things:** its [OS 26 design, September 2025](https://culturedcode.com/things/blog/2025/09/things-for-os-26/) combines relaxed spacing and familiar controls with restrained glass. Its [August 2026 refinements](https://culturedcode.com/things/blog/2026/08/repeating-to-dos-refined/) retain useful state indicators while improving everyday actions.
- **Mochi, reviewed September 2026:** its documented [recall → reveal → rate flow](https://mochi.cards/docs/getting-started/reviewing-cards/) and [per-card review history](https://mochi.cards/docs/cards/#review-history) are relevant references for preserving useful learning data.
- **Established craft:** Steve Schoger and Adam Wathan's public [Refactoring UI guidance](https://refactoringui.com/) uses spacing and surface contrast to establish hierarchy with fewer borders. Emil Kowalski's [Train Your Judgement](https://emilkowal.ski/ui/train-your-judgement) exercises test motion against frequent use and interruptions. These inform restrained interactions; they are not presented as new 2026 research.

## Detail when it is useful

The assistant keeps the current card in view and offers a message field with three compact prompts: Hint, Explain, and Example. Selecting a prompt creates an editable draft. Settings show the current text and image models; available alternatives expand on request. Draft editing, explicit saving, validation errors, conversation history, web search, charts, and images remain available. This applies [progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/) while keeping useful context and the next action visible.

In four experiments, Harp and Mayer found that adding interesting but irrelevant text and illustrations to science explanations reduced recall of main ideas and transfer performance. That is a reason to exclude unrelated decoration from study content; it does not establish a learning benefit for this specific interface. Relevant examples, diagrams, and explanations still serve the task. [Original paper, 1998, author-hosted copy](https://www.researchgate.net/profile/Richard-Mayer-4/publication/232595492_How_Seductive_Details_Do_Their_Damage_A_Theory_of_Cognitive_Interest_in_Science_Learning/links/57799b8408ae4645d611f204/How-Seductive-Details-Do-Their-Damage-A-Theory-of-Cognitive-Interest-in-Science-Learning.pdf).

## Readability and access

Study and assistant content use solid surfaces. Glass is restricted to the navigation/control layer, consistent with [Apple's material guidance](https://developer.apple.com/videos/play/wwdc2025/219/). Expo Blur provides that treatment; it does not reproduce native Liquid Glass refraction. Reduced Transparency and forced colors select opaque controls; Android uses solid surfaces. Reduce Motion disables spatial transitions.

Controls retain at least [44-point touch areas](https://developer.apple.com/design/tips/), readable contrast, descriptive accessibility labels, and non-color feedback. Long content grows and scrolls. Markdown and math share the existing sanitizer; the web renderer uses an accessible, automatically sized iframe.

## Scope and verification

The display name is Shuffle. Its bundle identifier, URL scheme, and deployment identity stay the same. Backend contracts, services, scheduling, authentication, persistence, and dependencies are unchanged. A session target describes reviews in that session; it does not claim daily totals or mastery. Launcher assets require a native build.

```sh
bun run typecheck
bun run test
bun run check
bunx expo export --platform web --output-dir dist
python3 -m http.server 8094 --bind 127.0.0.1 --directory dist
# In another terminal, with Python Playwright and Chromium available:
python3 scripts/check-redesign.py
```

Browser checks intercept API calls with synthetic data and save screenshots to the ignored `artifacts/` directory. Native startup was checked in Expo Go. A production device build is needed to verify installed launcher assets and native material rendering.
