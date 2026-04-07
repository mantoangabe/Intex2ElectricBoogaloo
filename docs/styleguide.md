# SafeHaven PH – Style Guide

## Overview

This style guide defines the visual language and design system for SafeHaven PH's web application. It ensures consistency across all pages and provides a foundation for future design work.

---

## Color Palette

All colors are defined as CSS variables in `frontend/src/index.css` and should be referenced using these variable names in styles.

### Primary Colors

| Color | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| Primary Teal | `#00B8A9` | `--primary` | Brand color, primary buttons, links, nav highlights, CTAs |
| Primary Dark | `#009d90` | `--primary-dark` | Hover state for primary buttons |
| Accent Pink | `#F6416C` | `--accent` | Danger/warning states, secondary highlights |
| Highlight Yellow | `#FFDE7D` | `--highlight` | Accent cards, callouts, metric highlights |

### Neutral Colors

| Color | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| Page Background | `#F8F3D4` | `--bg` | Main page background (cream) |
| Card Background | `#ffffff` | `--white` / `--card-bg` | Cards, modals, input backgrounds |
| Text Primary | `#2c2c2c` | `--text` | Headings, body text |
| Text Muted | `#666666` | `--text-muted` | Secondary text, labels, hints |
| Border | `#e0dcc8` | `--border` | Dividers, input borders, table borders |

### Shadows

| Name | CSS Variable | Usage |
|------|--------------|-------|
| Small Shadow | `--shadow-sm` | Cards, subtle depth |
| Medium Shadow | `--shadow-md` | Buttons on hover, lifted elements |

---

## Typography

### Font Family

- **Primary Font**: System UI stack (`system-ui, 'Segoe UI', Roboto, sans-serif`)
- **Usage**: All text, headings, buttons
- **Rationale**: System fonts ensure fast loading and consistent rendering across platforms

### Font Sizes & Weights

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| H1 (Page Title) | 2.75rem | 700 | Hero sections, main page headers |
| H2 (Section Header) | 1.75rem | 700 | Section headings |
| H3 (Card Header) | 1rem | 700 | Card titles, subsections |
| Body Text | 1rem (16px) | 400 | Default paragraph text |
| Small Text | 0.9rem | 400 | Labels, secondary info |
| Muted Text | 0.9rem | 400 | Hints, disabled states, metadata |

### Line Height

- **Default**: 1.6 (body text)
- **Headings**: 1.2 (compact, for impact)

---

## Spacing & Layout

### Base Unit: 0.25rem (4px)

All spacing values are multiples of the base unit. Use these standard spacings:

| Amount | CSS Value | Usage |
|--------|-----------|-------|
| Extra Small | 0.25rem (4px) | Icon spacing, tight groups |
| Small | 0.5rem (8px) | Input padding, small gaps |
| Medium | 1rem (16px) | Padding, standard gaps |
| Large | 1.5rem (24px) | Card padding, section spacing |
| Extra Large | 2rem (32px) | Page padding, major section breaks |

### Responsive Design

All layouts are mobile-first and responsive:

- **Mobile**: < 768px (single column, stacked nav)
- **Tablet**: 768px – 1024px (adjusted spacing, sidebar hidden)
- **Desktop**: > 1024px (full layout, sidebar visible)

---

## Components & Patterns

### Buttons

All buttons use the `.btn` base class with modifiers:

#### `.btn-primary`
- **Background**: `--primary` (#00B8A9)
- **Text**: White
- **Hover**: Darker primary color, slight lift (translateY), shadow
- **Usage**: Main CTAs, primary actions

#### `.btn-secondary`
- **Background**: White
- **Border**: 2px solid `--primary`
- **Text**: `--primary`
- **Hover**: Inverts to primary background
- **Usage**: Alternative actions, low-priority CTAs

#### `.btn-danger`
- **Background**: `--accent` (#F6416C)
- **Text**: White
- **Hover**: Opacity 0.9
- **Usage**: Delete, destructive actions

#### `.btn-sm` (size modifier)
- **Padding**: 0.4rem 0.9rem
- **Font Size**: 0.85rem
- **Usage**: Compact spaces, inline actions

### Cards

All cards follow this pattern:

```css
.admin-card {
  background: var(--white);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}
```

- **Background**: White
- **Border Radius**: 8px
- **Shadow**: Small shadow for subtle depth
- **Padding**: 1.5rem (24px) on all sides
- **Margin**: 1.5rem bottom for vertical rhythm

### Input Fields

All form inputs follow this pattern:

```css
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 184, 169, 0.1);
}
```

- **Border**: 1px solid `--border` (light tan)
- **Border Radius**: 6px
- **Focus State**: Primary color border + subtle teal glow
- **Transition**: 0.2s for smooth interactions

### Tables

- **Header**: Uppercase, font-weight 700, 2px bottom border
- **Rows**: Hover background `rgba(0, 184, 169, 0.03)` (very subtle teal)
- **Borders**: 1px solid `--border` between rows

### Navbar (Public Pages)

- **Background**: White
- **Padding**: 1rem 2rem
- **Shadow**: `--shadow-sm`
- **Position**: Sticky (stays at top on scroll)
- **Z-index**: 10

### Footer (Public Pages)

- **Background**: `--text` (dark gray)
- **Color**: `--text-muted` (lighter gray)
- **Padding**: 1.5rem
- **Margin**: Auto top (pushed to bottom)

### Admin Shell (All Admin Pages)

All admin pages use the `AdminLayout` component:

- **Header**: `--primary` background, white text, padding 1.25rem 2rem
- **Sidebar**: White background, 220px wide, sticky positioning
- **Main Content**: Flex 1, padding 2rem, scrollable
- **Nav Links**: Active state has left border + background highlight

---

## Design Rules

### 1. Consistency
- Always use CSS variables, never hardcode colors
- Use the standard spacing scale (multiples of 0.25rem)
- Apply shadows only from the shadow variable library

### 2. Contrast
- Text on light backgrounds: `--text` (#2c2c2c) for contrast
- Text on dark backgrounds: White or `--text-muted`
- Minimum WCAG AA contrast ratio maintained

### 3. Interactive States
All interactive elements (buttons, links, inputs) must show clear feedback:
- **Hover**: Color change, lift, or shadow
- **Focus**: Primary border + glow for keyboard navigation
- **Active**: Stronger visual change (darker color, border highlight)
- **Transition**: All interactions use `transition: all 0.2s` for smoothness

### 4. Whitespace
- Use padding and margins consistently
- Never use `padding: 0` or `margin: 0` arbitrarily
- Follow the spacing scale: 0.5rem, 1rem, 1.5rem, 2rem

### 5. Typography Hierarchy
- H1 for page titles only (1 per page)
- H2 for major section breaks
- H3 for card/component titles
- Use weight (700) to emphasize, not size alone

### 6. Mobile-First
- Design and test mobile layout first
- Use media queries to enhance for larger screens
- Breakpoints: 768px (tablet), 1024px (desktop)

---

## File Organization

CSS is organized as follows:

```
frontend/src/
├── index.css              # Global variables, base styles
├── styles/
│   ├── styles.css         # Shared components (navbar, footer, admin shell, forms, buttons)
│   ├── HomePage.css       # Home page specific
│   ├── LoginPage.css      # Login page specific
│   ├── AdminDashboard.css # Dashboard metrics, cards
│   └── [other pages].css  # Page-specific overrides
```

### Rule: Use Shared Styles First

Before creating page-specific CSS:
1. Check if `styles.css` already has a class for it
2. If not, add a reusable class to `styles.css`
3. Use `[page].css` only for page-unique visual behavior

---

## Examples

### Adding a New Button
```html
<button class="btn btn-primary">Click Me</button>
```

### Creating a Form
```html
<div class="form-group">
  <label>Email Address</label>
  <input type="email" placeholder="user@example.com" />
</div>
```

### Building a Card
```html
<div class="admin-card">
  <h3>Card Title</h3>
  <table class="admin-table">
    <!-- content -->
  </table>
</div>
```

### Responsive Grid
```html
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
  <!-- items -->
</div>
```

---

## Future Considerations

- Dark mode support (add `@media (prefers-color-scheme: dark)` variants)
- Accessibility: Ensure all interactive elements are keyboard-navigable
- Animation library: Consider adding subtle motion for micro-interactions
- Icon system: Define standard icon sizes and colors
