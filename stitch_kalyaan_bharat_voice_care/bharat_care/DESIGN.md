---
name: Bharat Care
colors:
  surface: '#f2fbfe'
  surface-dim: '#d2dcde'
  surface-bright: '#f2fbfe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ecf5f8'
  surface-container: '#e6eff2'
  surface-container-high: '#e1eaed'
  surface-container-highest: '#dbe4e7'
  on-surface: '#141d1f'
  on-surface-variant: '#3e494a'
  inverse-surface: '#293234'
  inverse-on-surface: '#e9f2f5'
  outline: '#6f797a'
  outline-variant: '#bec8ca'
  surface-tint: '#006972'
  primary: '#00535b'
  on-primary: '#ffffff'
  primary-container: '#006d77'
  on-primary-container: '#9becf7'
  inverse-primary: '#82d3de'
  secondary: '#8e4e14'
  on-secondary: '#ffffff'
  secondary-container: '#ffab69'
  on-secondary-container: '#783d01'
  tertiary: '#01544f'
  on-tertiary: '#ffffff'
  tertiary-container: '#286d67'
  on-tertiary-container: '#a9ece4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9ff0fb'
  primary-fixed-dim: '#82d3de'
  on-primary-fixed: '#001f23'
  on-primary-fixed-variant: '#004f56'
  secondary-fixed: '#ffdcc4'
  secondary-fixed-dim: '#ffb780'
  on-secondary-fixed: '#2f1400'
  on-secondary-fixed-variant: '#6f3800'
  tertiary-fixed: '#acefe7'
  tertiary-fixed-dim: '#90d3cb'
  on-tertiary-fixed: '#00201e'
  on-tertiary-fixed-variant: '#00504b'
  background: '#f2fbfe'
  on-background: '#141d1f'
  surface-variant: '#dbe4e7'
typography:
  headline-lg:
    fontFamily: Noto Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 44px
  headline-lg-mobile:
    fontFamily: Noto Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 38px
  headline-md:
    fontFamily: Noto Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Noto Sans
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 30px
  body-md:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  label-lg:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: 0.5px
  voice-caption:
    fontFamily: Noto Sans
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  touch-target-min: 56px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  stack-gap: 16px
---

## Brand & Style
The design system is engineered for radical accessibility and deep trust, specifically serving rural and elderly populations across India. The brand personality is **reassuring, paternal, and stable**, acting as a digital companion that simplifies complex healthcare journeys.

The design style is a blend of **Corporate Modern** and **Tactile Minimalist**. It avoids visual clutter, favoring high-contrast elements and large-scale interactions. By minimizing cognitive load and prioritizing voice interaction, the interface feels less like a complex software tool and more like a helpful service. The visual language is optimized for low-end devices, utilizing simple shapes and solid fills to ensure performance on low-bandwidth connections.

## Colors
The palette is rooted in a sense of hygiene and vitality. 

- **Primary (Deep Teal):** Used for main navigation, headers, and core health-related status elements. It conveys professionalism and trust.
- **Secondary (Warm Orange):** Reserved strictly for primary call-to-actions and voice-activation indicators. Its warmth contrasts sharply against the teal to guide the eye toward action.
- **Tertiary (Soft Mint):** Used for background surfaces and secondary containers to soften the overall UI.
- **Neutral (Slate & Off-White):** Typography uses a high-contrast Slate (#2D3748) rather than pure black to reduce eye strain while maintaining maximum legibility against the off-white backgrounds.

## Typography
**Noto Sans** is the sole typeface for this design system, chosen for its unparalleled support of Indic scripts (Hindi, Bengali, Marathi, Telugu, Tamil, etc.). 

To accommodate elderly users with varying levels of visual acuity:
- **Scale:** All font sizes are intentionally oversized. The smallest functional text starts at 16px.
- **Leading:** Line heights are increased to prevent crowding in complex scripts like Devanagari or Kannada.
- **Weight:** Use medium and bold weights more frequently than regular to ensure strokes remain visible on lower-resolution mobile screens.

## Layout & Spacing
The layout follows a **Fluid Grid** model with an emphasis on vertical stacking to facilitate easy scrolling for elderly users. 

- **Touch Targets:** A strict minimum of 56px for all interactive elements to accommodate motor-skill variances.
- **Verticality:** Information is presented in a single-column list format on mobile to keep the focus on one task at a time.
- **Safe Areas:** Generous margins (20px minimum) ensure that content does not bleed into the edges of ruggedized phone cases or curved screens common in the target market.

## Elevation & Depth
This design system uses **Tonal Layers** and **Low-Contrast Outlines** rather than complex shadows. This approach ensures clarity even when screen brightness is low or when used in direct sunlight.

- **Level 0 (Background):** Solid off-white (#EDF6F9).
- **Level 1 (Cards):** Pure white with a 1px solid border in a light teal-gray.
- **Level 2 (Active States):** A soft, subtle glow using the secondary orange color, purely to indicate voice activity or a "listening" state. 
- **Depth:** Avoid background blurs or glassmorphism, as these require high processing power; stick to solid fills and simple stacking logic.

## Shapes
Shapes are **Rounded (Level 2)** to evoke a sense of friendliness and safety. 

- **Buttons:** Use 0.5rem (8px) corners for a standard "friendly" feel, or full pill-shapes for the primary voice-activation button.
- **Cards:** Use 1rem (16px) for large containers to distinguish them clearly from the background.
- **Icons:** Enclosed in circular or rounded-square containers to provide a larger, predictable hit area for the user’s thumb.

## Components
### Voice Interaction Indicator
The most critical component. It consists of a large central button (Secondary Orange) that, when active, emits a rhythmic "pulse" or wave animation. Accompanying this is a "Voice Caption" area that transcribes the user's speech in real-time in their native script.

### High-Contrast Buttons
Buttons must feature a solid background color with high-contrast text (White on Deep Teal). Icons should always be accompanied by a label. Avoid "ghost" or outline-only buttons for primary actions.

### Large-Scale Lists
Each list item must be a minimum of 72px in height. Items should include a leading icon and a trailing chevron or radio-circle to indicate the entire row is a touch target.

### Information Cards
Used for medication reminders or doctor instructions. These use the Headline-MD size and a bold accent border on the left side to categorize the information (e.g., Green for "Done", Orange for "Pending").

### Input Fields
Inputs are large, with 18px text and clear, persistent labels. In this design system, input fields should prioritize voice-to-text as the primary entry method, with a keyboard as the fallback.