# Premium Web Application — UI/UX Design System Reference

> **Purpose:** This document captures every visual and interaction pattern used in a high-end, luxury-sports-themed web application. Use it as a blueprint to recreate the same level of design quality in any new project — swap colors, fonts, and content while keeping the architecture, spacing, animation, and component patterns identical.

---

## 1. Design Philosophy

| Principle | Implementation |
|-----------|---------------|
| **Luxury sports aesthetic** | Every element feels premium — generous whitespace, deep shadows, gradient accents, glass morphism |
| **Warm & grounded** | Earth-tone palette (emerald, terracotta, gold) — never cold or sterile |
| **Motion with purpose** | Framer Motion on every section entry, hover micro-interactions, smooth page transitions |
| **Mobile-first responsive** | Every layout uses `grid` with responsive breakpoints; mobile menu is animated overlay |
| **Semantic design tokens** | All colors defined as HSL CSS variables; components never use raw color values |

---

## 2. Typography

### Font Stack
```
Headings: 'Playfair Display', Georgia, serif  — weight 400–900
Body:     'Space Grotesk', system-ui, sans-serif — weight 300–700
```

### Loading (Google Fonts)
```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
```

### Usage Rules
| Element | Font | Weight | Tracking | Extra |
|---------|------|--------|----------|-------|
| `h1` | Playfair Display | `font-bold` (700) | `tracking-tight` | Gradient text on key phrases |
| `h2` | Playfair Display | `font-bold` | `tracking-tight` | 2xl → 3xl → 4xl → 5xl → 6xl responsive |
| `h3`, `h4` | Playfair Display | `font-semibold` (600) | `tracking-tight` | — |
| Body text | Space Grotesk | `font-normal` (400) | Default | `font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11'` |
| Labels/badges | Space Grotesk | `font-semibold`/`font-medium` | `tracking-wider` | Often `uppercase text-xs` |
| Buttons | Space Grotesk | `font-medium` to `font-semibold` | Default | — |

### Responsive Heading Scale (Hero H1)
```
text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1]
```

### Section Header Pattern
```
text-2xl md:text-3xl lg:text-4xl  (for section h2)
text-lg                           (for section subtitle — muted-foreground)
```

### Text Rendering
```css
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## 3. Color System (HSL Design Tokens)

All colors are HSL values stored as CSS custom properties. Components reference them via Tailwind semantic classes (`bg-primary`, `text-foreground`, etc.) — **never raw hex/rgb**.

### Light Mode
```css
:root {
  /* Core */
  --background: 40 30% 98%;        /* Warm off-white */
  --foreground: 25 30% 12%;        /* Deep warm black */
  --card: 40 25% 99%;
  --card-foreground: 25 30% 12%;
  --popover: 40 25% 99%;
  --popover-foreground: 25 30% 12%;

  /* Primary — Deep brand color */
  --primary: 158 55% 22%;          /* Deep emerald */
  --primary-foreground: 40 30% 98%;

  /* Secondary — Warm neutral */
  --secondary: 38 35% 94%;         /* Warm cream */
  --secondary-foreground: 25 30% 15%;

  /* Accent — Bold contrast color */
  --accent: 16 75% 48%;            /* Rich terracotta */
  --accent-foreground: 40 30% 98%;

  /* Muted */
  --muted: 135 12% 93%;
  --muted-foreground: 25 15% 45%;

  /* Destructive */
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;

  /* Borders & Input */
  --border: 35 25% 88%;
  --input: 35 25% 88%;
  --ring: 158 55% 22%;

  /* Special accent tokens */
  --gold: 42 85% 55%;
  --gold-foreground: 25 30% 12%;
  --copper: 25 70% 45%;
  --copper-foreground: 40 30% 98%;

  --radius: 1rem;
}
```

### Dark Mode
```css
.dark {
  --background: 158 30% 6%;
  --foreground: 40 30% 95%;
  --card: 158 25% 9%;
  --primary: 158 55% 45%;
  --secondary: 158 20% 15%;
  --accent: 16 75% 55%;
  --muted: 158 15% 18%;
  --border: 158 18% 18%;
  --gold: 42 85% 60%;
  --copper: 25 75% 50%;
}
```

### Sidebar (Dark Panel)
```css
--sidebar-background: 158 55% 15%;   /* Very dark primary */
--sidebar-foreground: 40 30% 95%;
--sidebar-primary: 42 85% 55%;        /* Gold accent */
--sidebar-accent: 158 45% 22%;
--sidebar-border: 158 40% 22%;
```

### Text Gradients
```css
/* Gold gradient text */
.text-gradient-gold {
  background: linear-gradient(135deg, hsl(42 85% 55%), hsl(48 90% 65%), hsl(42 85% 55%));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Primary gradient text */
.text-gradient-primary {
  background: linear-gradient(135deg, hsl(158 55% 22%), hsl(165 50% 30%));
  /* same clip technique */
}

/* Accent gradient text */
.text-gradient-clay {
  background: linear-gradient(135deg, hsl(16 75% 48%), hsl(25 70% 55%));
}

/* Hero heading gradient */
.hero-text-gradient {
  background: linear-gradient(135deg, hsl(42 85% 60%), hsl(38 80% 55%), hsl(42 90% 65%));
}
```

---

## 4. Layout Architecture

### Page Structure
```
Landing: Navbar (fixed) → Hero (full-screen) → Features → Pricing → Testimonials → About → Footer
Dashboard: Fixed sidebar (left) + scrollable main content (right)
Auth: Split-screen — form left, full-bleed image right
```

### Container
```
max-width: 1400px, centered, padding: 2rem
```

### Grid Patterns
| Section | Layout |
|---------|--------|
| Hero | `grid lg:grid-cols-2 gap-12 lg:gap-20 items-center` |
| Features | `grid lg:grid-cols-2 gap-16 items-center` (image + card stack) |
| Pricing | `grid md:grid-cols-3 gap-4 md:gap-5 max-w-4xl mx-auto` |
| Testimonials | `grid md:grid-cols-3 gap-4 md:gap-5 max-w-4xl mx-auto` |
| About | `grid lg:grid-cols-2 gap-8 lg:gap-12 items-center` |
| Footer | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6` |

### Section Spacing
```
Standard:    py-12 lg:py-20   or   py-24 lg:py-32
Tight:       pt-8 pb-12 lg:pt-10 lg:pb-16
```

### Section Overlap Pattern
The Features section overlaps the Hero with:
```css
rounded-t-[4rem] -mt-16 z-10
```
This creates a smooth visual transition between full-bleed hero and content sections.

---

## 5. Component Patterns

### 5.1 Navbar
- **Position:** `fixed top-0 left-0 right-0 z-50`
- **Background:** Transparent over hero (relies on hero image contrast)
- **Logo:** Large (h-24 w-24 mobile, h-40 w-40 desktop) with overflow, sits above navbar bounds on desktop
- **Nav links:** `text-sm font-medium text-white/80 hover:text-white` with animated underline (gradient line `::after`)
- **CTA Buttons:** Ghost "Sign In" + Gold gradient "Join Club" with `rounded-xl`
- **Mobile:** Hamburger icon → AnimatePresence slide-down panel with full-width buttons
- **Entry animation:** `initial={{ y: -100 }} animate={{ y: 0 }}` via Framer Motion

### 5.2 Hero Section
- **Height:** `min-h-screen flex items-center`
- **Background:** Full-bleed image with dual gradient overlays:
  ```
  bg-gradient-to-r from-black/70 via-black/50 to-black/30
  bg-gradient-to-t from-black/50 via-transparent to-black/20
  ```
- **Layout:** 2-column grid — text left, featured image right (hidden on mobile)
- **Heading:** Serif font, 7xl on desktop, with gradient-colored key phrase
- **Subtitle:** `text-lg sm:text-xl text-white/80 max-w-xl leading-relaxed`
- **CTA group:** `flex flex-col sm:flex-row gap-4` — primary gold button + glass outline button
- **Right image:** `rounded-3xl overflow-hidden shadow-2xl` with aspect-[4/5]

### 5.3 Section Headers (Repeated Pattern)
```jsx
<span className="inline-flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-wider">
  <Icon className="w-4 h-4" />
  Section Label
</span>
<h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
  Main Title <span className="text-gradient-[variant]">Highlighted Words</span>
</h2>
<p className="text-sm text-muted-foreground">
  Supporting description text
</p>
```

### 5.4 Feature Cards (Tinder-Style Stack)
- Cards stacked with decreasing `scale`, increasing `translateY`, decreasing `opacity`
- Top card is draggable (mouse + touch) with rotation based on drag offset
- Swipe threshold: 100px to trigger card change
- Navigation: Left/Right chevron buttons + dot indicators
- Card structure: Image top (240px) + text bottom with title + description
- `rounded-2xl shadow-lg border border-border`

### 5.5 Pricing Cards
```css
.pricing-card {
  rounded-2xl p-5 border backdrop-blur-md transition-all duration-500
}
```
- Three color variants: `--blue`, `--amber` (featured), `--emerald`
- Each uses translucent bg + matching border + colored box-shadow
- Featured card: `ring-2 ring-amber-500/40`
- Icon + title row at top, price block, feature checklist, CTA button at bottom
- Checklist items use small colored circles with Check icon

### 5.6 Testimonial Cards (Glass Morphism)
```css
.glass-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 1rem;
}
```
- Quote icon (lucide `Quote`) in gold/50 opacity
- Star rating row (filled gold stars)
- Quote text in `text-white/90 text-sm`
- Author: avatar (rounded-xl, ring-2 ring-gold/40) + name + role
- Hover: `hover:bg-white/20 translateY(-4px)`

### 5.7 Stats Bar
- Inside testimonials section as `glass-card p-5 md:p-6`
- `grid grid-cols-2 md:grid-cols-4` with centered values
- Value: `font-display text-2xl md:text-3xl font-bold text-gold`
- Label: `text-white/80 text-xs md:text-sm`

### 5.8 About Section
- Two-column: text left, image grid right
- Values displayed in `grid grid-cols-2 gap-3` cards
- Info cards: `p-3 rounded-xl bg-card/50 border border-border/40`
- Icon containers: `w-8 h-8 rounded-lg bg-primary/10`
- Image grid: One full-width image + two square items (image + branded payment card)

### 5.9 Footer
- Dark background using `bg-primary text-primary-foreground`
- Court pattern overlay at 10% opacity
- 4-column grid: Brand + Quick Links + Contact + Hours/Payment
- Social icons: `w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20`
- Links: `text-xs opacity-75 hover:opacity-100`
- Bottom bar: border-t with copyright + policy links
- Entry animations: Staggered `whileInView` with Framer Motion

### 5.10 Auth Page (Split Screen)
- **Left (Form):** `flex-1 bg-background` with animated background orbs (blur-3xl circles)
- **Right (Branding):** `hidden lg:flex flex-1` full-bleed image, no text overlay
- Logo: Large (h-20 w-20) with ring + shadow
- Mode badge: `bg-accent/10 rounded-full px-4 py-1.5`
- Form inputs: `.input-premium` class (border-2, rounded-xl, px-4 py-3)
- Role selector (signup): RadioGroup with large cards (p-5 rounded-2xl border-2)
- Submit button: Full-width, `btn-primary rounded-xl py-6 text-lg`
- Entire form has `whileHover={{ scale: 1.01 }}` on interactive elements

### 5.11 Dashboard Layout
- **Sidebar:** `w-72 bg-black` fixed height, no scroll
  - Logo section with animated hover (`whileHover={{ scale: 1.05, rotate: 5 }}`)
  - Nav items: `px-3 py-2.5 rounded-xl` with active state using left border + emerald bg + shadow
  - User info at bottom: Avatar with online indicator dot, role badge with gradient
  - Staggered entry animation per nav item
- **Main content:** `flex-1 overflow-auto p-4 md:p-6 lg:p-8` with fade-up entry
- **Mobile:** Hamburger → slide-in sidebar with backdrop blur overlay

---

## 6. Button System

### Variants
| Variant | Style |
|---------|-------|
| **Primary** | `bg-primary text-primary-foreground` + shadow + hover lift (-2px) + glow shadow |
| **Gold (Premium CTA)** | `linear-gradient(135deg, gold-start, gold-end)` + font-semibold + hover glow |
| **Accent** | `bg-accent text-accent-foreground` + hover clay-glow |
| **Outline** | `border border-input bg-background hover:bg-accent` |
| **Ghost** | Transparent, `hover:bg-accent hover:text-accent-foreground` |
| **Glass** | `bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm` |
| **Destructive** | `bg-destructive text-destructive-foreground` |

### Sizes
```
default: h-10 px-4 py-2
sm:      h-9 px-3
lg:      h-11 px-8
icon:    h-10 w-10
hero:    px-8 py-6 text-lg (custom)
```

### Border Radius
```
Standard buttons: rounded-md (default) or rounded-xl (premium)
Hero CTAs: rounded-xl
```

### Hover Interactions
- **translateY(-2px)** lift on hover
- **Box-shadow glow** matching button color
- **Arrow icon** slides right on hover: `group-hover:translate-x-1 transition-transform`
- **Scale micro-interaction** via Framer Motion: `whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}`

---

## 7. Form Inputs

### Premium Input
```css
.input-premium {
  bg-background border-2 border-border/60 rounded-xl px-4 py-3 transition-all duration-300
}
.input-premium:focus {
  border-primary ring-4 ring-primary/10 outline-none
}
.input-premium::placeholder {
  text-muted-foreground/60
}
```

### Password Field
- Input with eye/eye-off toggle button positioned `absolute right-4 top-1/2`

### Radio Cards (Role Selector)
```
p-5 rounded-2xl border-2 cursor-pointer
Selected: border-primary bg-primary/5
Unselected: border-border hover:border-primary/50
```
- Contains RadioGroupItem + Icon container + Label with title + description

### Labels
```
text-sm font-medium leading-none
```

---

## 8. Shadows & Depth

```css
--shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.02);
--shadow-md:  0 4px 12px -2px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.03);
--shadow-lg:  0 12px 24px -4px rgb(0 0 0 / 0.08), 0 4px 8px -4px rgb(0 0 0 / 0.03);
--shadow-xl:  0 24px 48px -8px rgb(0 0 0 / 0.1), 0 8px 16px -6px rgb(0 0 0 / 0.04);

/* Colored glows */
--shadow-glow:  0 0 40px -8px hsl(primary / 0.35);
--shadow-gold:  0 0 40px -8px hsl(gold / 0.45);
--shadow-clay:  0 0 40px -8px hsl(accent / 0.35);
```

### Tailwind Custom Shadows
```js
'glow':        '0 0 40px -8px hsl(158 55% 22% / 0.35)',
'glow-gold':   '0 0 40px -8px hsl(42 85% 55% / 0.45)',
'glow-accent': '0 0 40px -8px hsl(16 75% 48% / 0.35)',
'soft':        '0 2px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
'elegant':     '0 10px 40px -10px rgb(0 0 0 / 0.12)',
```

---

## 9. Border Radius Scale

```
sm: calc(1rem - 4px)   = 12px
md: calc(1rem - 2px)   = 14px
lg: 1rem               = 16px
2xl: 1.25rem           = 20px
3xl: 1.5rem            = 24px
4xl: 2rem              = 32px
```

**Common usage:**
- Buttons: `rounded-xl` (premium) or `rounded-md` (default)
- Cards: `rounded-2xl` to `rounded-3xl`
- Avatars/icons: `rounded-lg` to `rounded-xl`
- Section transitions: `rounded-t-[4rem]`
- Images: `rounded-2xl` to `rounded-3xl`

---

## 10. Animation & Motion

### Framer Motion Patterns

**Page/Section Entry:**
```jsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3–0.5 }}
```

**Staggered List Items:**
```jsx
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: index * 0.05 }}
```

**Navbar Entry:**
```jsx
initial={{ y: -100 }}
animate={{ y: 0 }}
transition={{ duration: 0.5, ease: "easeOut" }}
```

**Scroll-triggered (Footer):**
```jsx
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ delay: 0.1–0.4, duration: 0.5 }}
```

**Hover Micro-interactions:**
```jsx
whileHover={{ scale: 1.01–1.05 }}
whileTap={{ scale: 0.99 }}
```

**Background Orbs (Auth page):**
```jsx
animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
transition={{ duration: 6–8, repeat: Infinity, ease: "easeInOut" }}
```

**Mobile Menu:**
```jsx
initial={{ opacity: 0, height: 0 }}
animate={{ opacity: 1, height: 'auto' }}
exit={{ opacity: 0, height: 0 }}
// Wrapped in AnimatePresence
```

### CSS Keyframe Animations
```
fade-in:        opacity 0→1, 0.7s
fade-up:        opacity 0→1 + translateY(24px→0), 0.7s
fade-down:      opacity 0→1 + translateY(-24px→0), 0.7s
scale-in:       opacity 0→1 + scale(0.96→1), 0.5s
slide-in-right: translateX(100%→0), 0.4s
slide-in-left:  translateX(-100%→0), 0.4s
slide-up:       translateY(100%→0) + opacity, 0.5s
float:          translateY(0→-12px→0), 4s infinite
pulse:          opacity 1→0.6→1, 2.5s infinite
shimmer:        backgroundPosition -200%→200%, 2.5s linear infinite
bounce-gentle:  translateY(0→-8px→0), 2s infinite
glow:           boxShadow intensity cycles, 3s infinite
```

### Animation Delay Utilities
```
.delay-100 through .delay-700 (100ms increments)
```

### GPU Optimization
```css
[class*="animate-"], .glass-card, .glass-dark {
  transform: translateZ(0);
  will-change: transform, opacity;
}
section { contain: layout style paint; }
```

---

## 11. Background Patterns

### Dot Pattern
```css
.bg-dots {
  background-image: radial-gradient(circle, hsl(var(--primary) / 0.08) 1px, transparent 1px);
  background-size: 28px 28px;
}
```

### Grid Pattern
```css
.bg-grid {
  background-image:
    linear-gradient(to right, hsl(var(--border) / 0.5) 1px, transparent 1px),
    linear-gradient(to bottom, hsl(var(--border) / 0.5) 1px, transparent 1px);
  background-size: 48px 48px;
}
```

### Court Pattern (for dark sections)
```css
.court-pattern {
  background-image:
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(180deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
}
```

### Section Backgrounds
| Section | Background |
|---------|------------|
| Features | `bg-gradient-to-br from-secondary via-background to-secondary` + dots |
| Pricing | `bg-gradient-to-b from-background via-secondary/70 to-background` + grid |
| Testimonials | `hero-gradient` + background image at 40% opacity + color overlay |
| About | `bg-gradient-to-br from-secondary via-background to-secondary` + dots |
| Footer | `bg-primary` + court-pattern at 10% opacity |

---

## 12. Glass Morphism

### Light Glass (over dark backgrounds)
```css
.glass-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 1rem;
}
```

### Dark Glass
```css
.glass-dark {
  background: linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 1rem;
}
```

---

## 13. Image Treatment

### Hero Background
- Full-bleed with `object-cover`, wrapped in `scale-110` container
- Dual overlay gradients (horizontal + vertical)

### Content Images
- Always `rounded-2xl` or `rounded-3xl` with `overflow-hidden`
- `shadow-elegant` or `shadow-2xl`
- Overlapping layout: secondary image positioned `absolute -bottom-8 -right-8` with `border-4 border-background`

### Avatar Images
- `rounded-xl` (not fully round)
- `ring-2 ring-[color]/40` or `/50`
- Typical sizes: `w-9 h-9` (sidebar), `w-10 h-10` (testimonials), `w-20 h-20` (auth logo)

### Image Shine Effect
```css
.image-shine::after {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.6s ease;
}
.image-shine:hover::after { left: 100%; }
```

### Performance
```css
img {
  image-rendering: -webkit-optimize-contrast;
  transform: translateZ(0);
}
```

---

## 14. Interactive States

### Link Underline Animation
```css
.link-underline::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0;
  width: 0; height: 2px;
  border-radius: 9999px;
  background: linear-gradient(90deg, hsl(var(--accent)), hsl(var(--gold)));
  transition: all 400ms;
}
.link-underline:hover::after { width: 100%; }
```

### Focus States
```css
:focus-visible {
  outline: none;
  ring: 2px solid primary;
  ring-offset: 2px;
  ring-offset-color: background;
}
```

### Selection
```css
::selection {
  background: accent/20;
  color: foreground;
}
```

### Cards Hover
- `translateY(-3px)` to `translateY(-4px)`
- Shadow upgrade: `shadow-md → shadow-xl` or `shadow-lg → shadow-xl`
- Border color shift: `border-border/50 → border-primary/20`
- Transition: `duration-300` to `duration-500`

---

## 15. Scrollbar & Performance

### Hidden Scrollbar
```css
::-webkit-scrollbar { width: 0; height: 0; background: transparent; }
* { scrollbar-width: none; -ms-overflow-style: none; }
```

### Touch Optimization
```css
* { -webkit-tap-highlight-color: transparent; }
body { -webkit-overflow-scrolling: touch; }
```

---

## 16. Responsive Breakpoints

| Breakpoint | Usage |
|------------|-------|
| Default | Mobile-first (single column, stacked layout) |
| `sm` (640px) | Side-by-side CTAs, slightly larger text |
| `md` (768px) | 2–3 column grids, desktop nav visible |
| `lg` (1024px) | Full desktop layout, sidebar visible, 2-col hero |
| `2xl` (1400px) | Container max-width cap |

---

## 17. Icon Usage (Lucide React)

- **Size convention:** `w-4 h-4` (inline), `w-5 h-5` (buttons), `w-6 h-6` (feature icons), `w-8 h-8` (decorative)
- **Icon containers:** `w-8 h-8 rounded-lg bg-primary/10` or `w-10 h-10 rounded-xl bg-primary/10`
- **Inside buttons:** Icons placed after text with `ml-2`, animated on hover
- **Section labels:** Small icon (w-3.5–4) + uppercase text
- **Navigation active state:** ChevronRight indicator

---

## 18. Badge / Tag Patterns

```css
/* Section label badge */
inline-flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-wider

/* Status badge */
bg-accent/10 rounded-full px-4 py-1.5 text-sm font-medium

/* Role badge (dashboard) */
inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border
/* With gradient bg: bg-gradient-to-r from-color/20 to-color/20 */
```

---

## 19. Key Dependencies

```
react, react-dom, react-router-dom
framer-motion          — All animations
tailwindcss            — Utility-first CSS
tailwindcss-animate    — CSS animation utilities
class-variance-authority (cva) — Component variants
@radix-ui/*            — Accessible primitives (Dialog, Dropdown, RadioGroup, etc.)
lucide-react           — Icons
sonner                 — Toast notifications
```

---

## 20. How to Adapt This System

1. **Swap the 3-color palette:** Replace emerald → your primary, terracotta → your accent, gold → your highlight. Update all HSL values in `:root`.
2. **Swap fonts:** Replace Playfair Display + Space Grotesk with your chosen display + body pair. Update the Google Fonts import and CSS `font-family` declarations.
3. **Keep the architecture:** Section spacing, grid patterns, component structure, animation timing, shadow scale, and border-radius scale should remain identical.
4. **Keep the motion:** Framer Motion entry animations, hover micro-interactions, and staggered reveals are the core of the premium feel.
5. **Keep glass morphism:** Adjust rgba values to match your new palette but keep the blur + gradient + border pattern.
6. **Keep the image treatment:** Rounded corners, overlapping layouts, gradient overlays, and shadow hierarchy create depth.

---

*This design system produces a premium, magazine-quality web application. The combination of serif display headings, generous spacing, layered depth, purposeful motion, and warm color harmony is what creates the luxury feel — not any single element alone.*
