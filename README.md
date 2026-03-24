Super Animated + Responsive + Industry Standard Prompt (Antigravity)

You are building a production-grade fintech mobile app in React Native (Expo) with TypeScript.
Project: Mayramao – AI Financial Decision-Support Simulator
Goal: Users simulate purchase decisions (cash / installments / BNPL) to predict future cashflow, savings impact, and financial stability.

Design Source: Figma (must match pixel-to-pixel).
Rules: No visual improvisation. No spacing/font/color changes beyond what’s in Figma. Use exact tokens from Figma.

UI Requirements (Pixel Perfect + Animated):

Build screens with 100% Figma accuracy (layout, spacing, typography, colors, radius, shadows).

Add premium, smooth micro-interactions that do NOT change the design:

subtle screen transitions, fade/slide in, shared element feel where possible

button press feedback (scale/opacity), input focus animations

list/card entrance animations, skeleton loading shimmer

modal bottom-sheet animations

Animations must be 60fps, minimal jank, and consistent across screens.

Animation Stack (Preferred):

Use react-native-reanimated v3 + react-native-gesture-handler

Use Moti only if it simplifies without performance loss

Avoid heavy animation logic in render; use worklets where appropriate.

Responsive Requirements:

Must look correct on small + large devices (iPhone SE → Pro Max, Android small → large).

Use a consistent scaling approach (tokens + spacing system).

Prefer: useWindowDimensions() + breakpoints + scalable spacing/typography utilities.

Avoid fixed absolute sizes except when required by Figma (icons/images).

Support safe areas (notch) and keyboard avoiding behavior.

Industry-Standard Architecture:

Clean, scalable, maintainable structure.

Separate: UI, state, services, API layer, domain logic.

Use reusable components + design system tokens.

Project Structure (Required):

src/

app/ (navigation, app providers)

features/ (each feature: screens, components, hooks, state)

components/ (shared UI components)

design-system/ (colors, spacing, typography, shadows, radius, tokens)

services/ (api client, storage, analytics)

utils/ (helpers, responsive utils)

types/

Coding Rules:

TypeScript strict types.

No inline styles; use StyleSheet.create or token-based styles.

No duplicated styles—extract shared components.

Accessibility: proper touch targets, labels, contrast-friendly.

Output Expectations:

Generate production-ready code for each screen + required reusable components.

Include navigation wiring (React Navigation) when relevant.

Provide clean, readable code with minimal dependencies.

Start by extracting a design token system from Figma (colors, spacing, typography, radius) and then implement screens using those tokens + animations.