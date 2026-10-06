---
name: A2B Logistics
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#414943'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#717972'
  outline-variant: '#c1c9c0'
  surface-tint: '#3b674d'
  primary: '#002614'
  on-primary: '#ffffff'
  primary-container: '#0f3d26'
  on-primary-container: '#7aa88a'
  inverse-primary: '#a2d1b1'
  secondary: '#795900'
  on-secondary: '#ffffff'
  secondary-container: '#ffc641'
  on-secondary-container: '#715300'
  tertiary: '#1f2119'
  on-tertiary: '#ffffff'
  tertiary-container: '#34362e'
  on-tertiary-container: '#9e9f94'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bdeecc'
  primary-fixed-dim: '#a2d1b1'
  on-primary-fixed: '#002111'
  on-primary-fixed-variant: '#234f37'
  secondary-fixed: '#ffdfa0'
  secondary-fixed-dim: '#f6be39'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5c4300'
  tertiary-fixed: '#e3e3d7'
  tertiary-fixed-dim: '#c7c7bc'
  on-tertiary-fixed: '#1a1c15'
  on-tertiary-fixed-variant: '#46483f'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  h2:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  touch-target-min: 48px
  touch-target-lg: 56px
  gutter: 16px
  margin-edge: 20px
  stack-sm: 4px
  stack-md: 12px
  stack-lg: 24px
---

## Brand & Style

This design system is built on the pillars of **Radical Simplicity** and **Institutional Trust**. Designed for the East African logistics corridor, the visual language prioritizes clarity and "one-tap" ergonomics to serve users operating in fast-paced, high-stakes environments. 

The aesthetic direction is **Modern-Tactile**. It moves away from flimsy, ethereal web trends toward a "bank vault" feel—utilizing heavy weights, solid color blocks, and high-contrast boundaries. This evokes the reliability of physical infrastructure. The interface must feel durable, secure, and permanent, ensuring drivers and shippers feel their cargo and capital are in safe hands.

## Colors

The palette is anchored by **Deep Forest Green**, representing growth and the professional stability of an established firm. This is the primary color for all critical actions and headers. 

**Ivory/Cream** serves as the foundational canvas, offering a sophisticated, lower-strain alternative to pure white that performs better in high-glare outdoor environments. **Gold/Amber** is reserved exclusively for "High Trust" moments: verification badges, premium listings, and critical alerts. 

Contrast ratios must exceed WCAG AA standards significantly to ensure legibility on low-end mobile displays and under direct sunlight.

## Typography

The design system utilizes **Inter** for its exceptional x-height and legibility in data-heavy lists. Typography is treated as a functional tool rather than a decorative element. 

Headlines are set with tight tracking and heavy weights to reinforce the "bank vault" stability. Body text is prioritized at a minimum of 16px to ensure readability for users who may be viewing the screen at arm's length while loading vehicles. Use all-caps labels sparingly for secondary metadata to create clear distinction without cluttering the visual field.

## Layout & Spacing

This design system employs a **Fluid-Safe Grid**. While the content expands to fill the screen, it is constrained by generous 20px side margins to prevent accidental thumb-triggers at the screen edges.

The spacing rhythm is strictly based on an 8px scale. **Ergonomics is paramount**: all interactive elements must adhere to a minimum 48px height, though 56px is the preferred standard for primary flow buttons. Vertical stacking is intentional and rhythmic, using white space to separate "cards" of information rather than thin divider lines.

## Elevation & Depth

To maintain the "bank vault" feel, the system avoids soft, floating shadows. Depth is instead conveyed through **Structural Tiering** and **Bold Outlines**:

1.  **Level 0 (Background):** Ivory (#F5F5E9) surface.
2.  **Level 1 (Cards):** White (#FFFFFF) surfaces with a 1px solid border (#0F3D26 at 10% opacity).
3.  **Level 2 (Active/Pressed):** Elements shift to a 2px Deep Forest Green border to indicate focus.

Shadows, if used, are "Hard Shadows"—low blur (2px), high opacity (20%), and zero spread, making elements feel like solid blocks sitting on a surface rather than glowing objects.

## Shapes

The shape language is **Architectural**. A "Soft" roundedness (Level 1) is applied to maintain a professional, serious tone. Sharp corners are avoided to keep the UI friendly, but large "bubbly" radii are rejected as they feel too casual for a logistics marketplace.

Primary buttons and input fields use a consistent 4px (0.25rem) radius. Status badges and the central [+] navigation button use a circular (pill) shape to distinguish them as floating or high-priority utility elements.

## Components

### Buttons
Primary buttons are solid **Deep Forest Green** with White text. They must span the full width of their container on mobile to maximize the strike zone. Secondary buttons use a Deep Forest Green outline on the Ivory background.

### The Bottom Navigation Bar
A high-contrast bar with an Ivory background. The icons are Deep Forest Green. The center **[+] Post Load** action is housed in a Deep Forest Green circle with a white icon, slightly elevated to signify its role as the primary marketplace engine.

### Trust Badges & Alerts
Verification status and urgent system alerts use **Gold/Amber**. These components should feature a small "shield" or "check" icon to reinforce the security narrative.

### Input Fields
Inputs must have a minimum height of 56px. Label text should remain visible even after a value is entered (floating labels). The border thickens and turns Deep Forest Green when the field is active, creating a tactile "locked-in" feel.

### Cards
Logistics "Load Cards" use the white surface with the Ivory background. They group critical data (Route, Price, Weight) using heavy weights for the price and route to allow for quick scanning.