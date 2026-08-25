# Design System Strategy: Kinetic Precision

## 1. Overview & Creative North Star
**The Creative North Star: "The High-Performance Lens"**

This design system rejects the static, boxy nature of traditional administrative dashboards. Instead, it adopts the aesthetic of elite sports broadcasting and high-end performance telemetry. The goal is to move beyond "management software" and into the realm of "performance coaching."

We achieve this through **Kinetic Precision**: a layout strategy that uses intentional asymmetry, deep tonal layering, and high-contrast typography to create a sense of forward motion. By breaking the rigid grid with overlapping elements and shifting background planes, we mirror the energy of the field while maintaining the absolute clarity required for data-driven decision-making.

---

## 2. Colors & Surface Architecture
The palette is built on a foundation of **Deep Navy (#1A202C)** to provide an authoritative, professional "locker room" feel, contrasted against **Energetic Lime (#ADFF2F)** to signify action, urgency, and success.

### The "No-Line" Rule
To achieve a premium, editorial feel, **1px solid borders are strictly prohibited for sectioning.** Structural boundaries must be defined solely through background shifts.
- Use `surface` (#f7fafc) for the primary application background.
- Use `surface_container_low` (#f1f4f6) for sidebar navigation or secondary utility panels.
- Use `surface_container_highest` (#e0e3e5) to define high-priority data regions.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. A card should never just "sit" on a page; it should emerge from it.
- **Nesting Pattern:** Place a `surface_container_lowest` (#ffffff) card inside a `surface_container` (#ebeef0) section to create a soft, natural lift without a single line of CSS border.

### The "Glass & Gradient" Rule
For floating elements (modals, dropdowns, or hovering stat cards), use **Glassmorphism**.
- Apply `surface_container_lowest` at 80% opacity with a `backdrop-blur` of 12px.
- **Signature Texture:** Primary CTAs should utilize a subtle linear gradient from `primary` (#030813) to `primary_container` (#1a202c) at a 135-degree angle. This adds a "carbon fiber" depth that flat colors cannot replicate.

---

## 3. Typography
We utilize a triple-font strategy to balance editorial impact with data density.

*   **Display & Headlines (Plus Jakarta Sans):** Chosen for its modern, athletic geometry. Use `display-lg` for hero stats and `headline-md` for section titles. These should always be set to a bold weight to anchor the page.
*   **Titles & Body (Inter):** The workhorse. Inter provides maximum legibility for match reports and player bios. Use `title-md` for card headers and `body-md` for general descriptions.
*   **Data & Labels (Lexend):** Its unique character widths make it exceptionally legible for numbers and "at-a-glance" stats. Use `label-md` for all role-based badges and subscription limits.

---

## 4. Elevation & Depth
Depth in this system is a product of light and shadow, not lines and boxes.

*   **The Layering Principle:** Avoid shadows for static content. Reserve elevation for interactive or temporary layers.
*   **Ambient Shadows:** For floating match info cards, use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(24, 28, 30, 0.06)`. The tint is derived from the `on_surface` token to ensure it feels like a natural shadow cast by stadium lighting.
*   **The "Ghost Border" Fallback:** If accessibility requires a container boundary, use the `outline_variant` token at 15% opacity. It should be felt, not seen.

---

## 5. Components

### Match Info Cards
Forbid the use of dividers. Use `spacing-6` (1.3rem) of vertical whitespace to separate the "Home Team" from the "Away Team." The card background should be `surface_container_lowest`, sitting on a `surface_container_low` page section.

### Subscription Progress Bars
The track should be `secondary_container` (#a5f624) at 30% opacity. The active fill must be the high-energy `secondary` (#426900). For "at-limit" states, transition the fill to a gradient using `error` (#ba1a1a).

### Role-Based Badges
Badges should not have backgrounds. Use `label-sm` in all-caps with a 1px "Ghost Border" (10% opacity `outline`). This keeps the interface clean while maintaining clear role identification.

### Buttons
- **Primary:** Gradient of `primary` to `primary_container`. Text is `on_primary`. High roundedness (`xl`: 0.75rem).
- **Action (Energetic):** For "Start Match" or "Go Live," use `secondary_fixed` (#a8f928) with `on_secondary_fixed` (#112000) text. This is our "high-alert" trigger.

### Performance Inputs
Text inputs should use `surface_container_highest` as a background with no border. On focus, a 2px "glow" of `secondary` (#426900) should appear only at the bottom edge, mimicking a starting line.

---

## 6. Do’s and Don’ts

### Do:
- **Use Asymmetry:** Place a heavy `display-lg` stat in the top-left and balance it with a `surface_container_low` data table in the bottom-right.
- **Embrace White Space:** Use the higher end of the spacing scale (`spacing-12` and `spacing-16`) to separate distinct data clusters.
- **Layer Surfaces:** Always ask, "Can I define this area with a subtle color shift instead of a line?"

### Don’t:
- **Never use pure black:** Use `primary` (#030813) for deep tones to maintain the navy professional "soul."
- **Avoid "Default" Shadows:** Never use high-opacity, tight shadows. They make the UI feel like a 2010s template.
- **No Dividers:** If you feel the need for a `<hr>` line, use a 4px gap of `surface_container` background instead.