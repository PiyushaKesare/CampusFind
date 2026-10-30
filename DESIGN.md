# DESIGN.md — Cloud-Based Lost & Found Management System

A minimal, clean UI for reporting, searching and tracking lost and found items on a college campus. Built with React + CSS on Firebase (Authentication, Firestore, Storage, Hosting).

---

## 1. Design Principles

1. **Minimal** – One primary action per screen. No decoration that doesn't help the user.
2. **Calm colours** – White and light grey surfaces, one blue accent, three muted status colours.
3. **Clear hierarchy** – Large page title, readable body text, generous white space.
4. **Fast to use** – Reporting an item should take under a minute; search is always one click away.
5. **Responsive** – Works on mobile, tablet, laptop and desktop (mobile-first).
6. **Accessible** – Sufficient contrast, visible focus states, labels on every input.

---

## 2. Colour Palette

| Role | Name | Hex | Usage |
| --- | --- | --- | --- |
| Background | White | `#FFFFFF` | Page background, cards |
| Surface | Light Grey | `#F5F6F8` | Section backgrounds, inputs, table headers |
| Border | Grey | `#E2E5EA` | Card borders, dividers, input borders |
| Text Primary | Charcoal | `#1F2933` | Headings, body text |
| Text Secondary | Slate | `#6B7280` | Labels, hints, metadata |
| Primary | Blue | `#2563EB` | Buttons, links, active states |
| Primary Hover | Dark Blue | `#1D4ED8` | Button hover |
| Primary Tint | Pale Blue | `#EFF4FF` | Selected rows, focus highlights |

### Status Colours (badges only)

| Status | Text | Background |
| --- | --- | --- |
| Lost | `#B91C1C` | `#FEE2E2` |
| Possible Match | `#B45309` | `#FEF3C7` |
| Found | `#047857` | `#D1FAE5` |
| Claimed | `#1D4ED8` | `#DBEAFE` |
| Returned | `#4B5563` | `#E5E7EB` |

### CSS Variables

```css
:root {
  --bg: #ffffff;
  --surface: #f5f6f8;
  --border: #e2e5ea;
  --text: #1f2933;
  --text-muted: #6b7280;
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --primary-tint: #eff4ff;

  --lost-text: #b91c1c;       --lost-bg: #fee2e2;
  --match-text: #b45309;      --match-bg: #fef3c7;
  --found-text: #047857;      --found-bg: #d1fae5;
  --claimed-text: #1d4ed8;    --claimed-bg: #dbeafe;
  --returned-text: #4b5563;   --returned-bg: #e5e7eb;

  --radius: 8px;
  --shadow: 0 1px 2px rgba(16, 24, 40, 0.06);
}
```

---

## 3. Typography

- **Font family:** `Inter`, fallback `system-ui, -apple-system, "Segoe UI", sans-serif`
- **Weights:** 400 (regular), 500 (medium), 600 (semibold)

| Element | Size | Weight |
| --- | --- | --- |
| Page title (H1) | 28px | 600 |
| Section title (H2) | 20px | 600 |
| Card title (H3) | 16px | 600 |
| Body | 14–16px | 400 |
| Label / metadata | 13px | 500 |
| Badge | 12px | 500 |

Line height: 1.5 for body text, 1.3 for headings.

---

## 4. Layout & Spacing

- **Spacing scale:** 4, 8, 12, 16, 24, 32, 48 px
- **Max content width:** 1100px, centred
- **Grid:** 1 column (mobile), 2 columns (tablet), 3–4 columns (desktop) for item cards
- **Border radius:** 8px for cards, buttons and inputs
- **Shadows:** very subtle (`--shadow`); prefer 1px borders over heavy shadows

### Breakpoints

| Device | Width |
| --- | --- |
| Mobile | < 640px |
| Tablet | 640–1024px |
| Desktop | > 1024px |

---

## 5. Core Components

### Navbar
- White background, 1px bottom border.
- Left: project name "Lost & Found". Right: Search, Report Lost, Report Found, My Reports, Login/Logout.
- Collapses to a hamburger menu on mobile.

### Buttons
| Type | Style |
| --- | --- |
| Primary | Blue background, white text |
| Secondary | White background, grey border, charcoal text |
| Danger | White background, red text and border (Delete) |

Height 40px, padding 0 16px, hover darkens slightly, visible focus ring.

### Form Inputs
- Light border, white background, 40px height, 8px radius.
- Label above the field. Error message in red text below the field.
- Focus: blue border with pale-blue ring.

### Item Card
```
┌──────────────────────┐
│ [ image – 4:3 ]      │
│ Black Wallet  [Lost] │
│ Canteen · 5 Oct 2026 │
└──────────────────────┘
```
- White card, 1px border, image on top (placeholder icon if no image).
- Title, status badge, location and date in muted text.

### Status Badge
Small rounded pill using the status colour pairs above.

### Match Banner
Pale-amber strip shown on an item: **"Possible Match — 90%"** with a "View match" link.

### Table (Admin)
Light-grey header row, thin row dividers, row actions aligned right.

### Notifications
Bell icon in the navbar with a small blue dot; dropdown lists in-app match notifications.

---

## 6. Pages

### 6.1 Home
- Short heading and one-line description.
- Large search bar.
- Two buttons: **Report Lost Item** (primary) and **Report Found Item** (secondary).
- "Recent items" grid of item cards.

### 6.2 Login / Register
- Single centred card (max 400px).
- Fields: Name (register only), College Email, Password.
- Toggle link between Login and Register.

### 6.3 Report Lost Item / Report Found Item
Same form layout, different title and button text.

| Field | Input |
| --- | --- |
| Item name | Text |
| Category | Dropdown |
| Color | Text / dropdown |
| Date lost / found | Date picker |
| Location | Text / dropdown |
| Description | Textarea |
| Image | Upload with preview |
| Contact info | Text |

Single column, max width 600px. Primary "Submit" button at the bottom.

### 6.4 Search Items
- Search bar on top with filters beside it (desktop) or collapsible (mobile): Lost/Found, Category, Location, Date, Color.
- Results as an item-card grid. Empty state: "No items found. Try different filters."

### 6.5 Item Details
- Two columns on desktop: large image on the left, details on the right (stacked on mobile).
- Details: name, status badge, category, color, location, date, description.
- Actions: **Contact Owner / Claim** (primary), match banner if applicable.
- Owner sees status controls (Mark Returned).

### 6.6 My Reports
- Tabs: **Lost** | **Found**.
- List rows: thumbnail, item name, status badge, date, action menu (Edit, Mark Returned, Delete).

### 6.7 Admin Dashboard
- Row of 4 stat cards: Total Reports, Lost Items, Found Items, Returned Items.
- "Recent Reports" table with actions: **Approve | Delete | Mark Returned**.
- Side or tab links: Reports, Users, Categories, Flagged/Duplicate reports.

---

## 7. Status Flow

```
Lost item  :  Lost → Possible Match → Found → Returned
Found item :  Found → Claimed → Returned
```

Returned items are hidden from default search results and shown only when the "Returned" filter is selected.

---

## 8. Matching Display

| Parameter | Points |
| --- | --- |
| Category | 20 |
| Item name | 30 |
| Color | 15 |
| Location | 20 |
| Date similarity | 15 |
| **Total** | **100** |

- Show a match only when score ≥ 70%.
- UI: small score pill (e.g. `90%`) on the match banner and a "Possible Matches" list on the lost item's detail page.

---

## 9. Interaction & States

- **Loading:** simple grey skeleton cards or a small spinner.
- **Empty:** short friendly message plus a suggested action.
- **Error:** inline red text under the field; toast for server errors.
- **Success:** small green toast ("Report submitted").
- **Transitions:** 150ms ease on hover and focus; no flashy animation.

---

## 10. Accessibility

- Text contrast of at least 4.5:1.
- All inputs have visible labels; images have alt text.
- Keyboard navigable with a visible blue focus outline.
- Status is conveyed by text as well as colour.

---

## 11. Suggested Folder Structure

```
src/
├── components/   Navbar, ItemCard, StatusBadge, MatchBanner, FilterBar
├── pages/        Home, Auth, ReportLost, ReportFound, Search,
│                 ItemDetails, MyReports, AdminDashboard
├── firebase/     config.js, auth.js, firestore.js, storage.js
├── utils/        matchScore.js
├── styles/       variables.css, global.css
└── App.jsx
```

---

## 12. Tech Stack

| Component | Technology |
| --- | --- |
| Frontend | React.js + CSS |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| Image Storage | Firebase Storage |
| Hosting | Firebase Hosting |
| Platform | Google Cloud Platform |
| Version Control | Git + GitHub |
