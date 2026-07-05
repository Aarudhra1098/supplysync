# SupplySync — Intro Animation Integration Guide

## What's in this package

```
supplysync-intro-package/
├── public/
│   └── intro.webm               ← The intro animation video (place in apps/web/public/)
├── components/
│   └── layout/
│       ├── IntroAnimation.tsx   ← Video player component (NEW FILE)
│       └── IntroShell.tsx       ← Session guard wrapper (NEW FILE)
├── app/
│   └── layout.tsx               ← Updated root layout (has IntroShell added)
├── globals-intro.css            ← CSS block to APPEND to apps/web/app/globals.css
└── README.md                    ← This file
```

---

## Integration Steps

### Step 1 — Copy the video
Place `public/intro.webm` into:
```
apps/web/public/intro.webm
```

### Step 2 — Add the two new components
Place both files into `apps/web/components/layout/`:
```
apps/web/components/layout/IntroAnimation.tsx   ← NEW
apps/web/components/layout/IntroShell.tsx       ← NEW
```

### Step 3 — Update apps/web/app/layout.tsx
Add **two lines** to the existing `layout.tsx`:

At the top imports, add:
```tsx
import { IntroShell } from "@/components/layout/IntroShell";
```

Inside `<body>`, add `<IntroShell />` as the **first child**:
```tsx
<body ...>
  <IntroShell />      {/* ← ADD THIS LINE */}
  <Navbar />
  {children}
</body>
```

The updated `layout.tsx` is included in this package for reference.

### Step 4 — Append CSS to globals.css
Open `apps/web/app/globals.css` and **append** the contents of `globals-intro.css`
to the very **end** of the file.

---

## How it works
- On first visit, a full-screen intro animation plays (the SupplySync logo reveal)
- It plays **once per browser tab session** (uses sessionStorage)
- After playing, it fades out smoothly and the main site appears
- The video is hardware-decoded by the browser — zero JavaScript stutter

## Session key (for testing)
The animation is gated by a sessionStorage key `supplysync_intro_v4`.
To force it to replay during testing, run this in the browser console:
```js
sessionStorage.removeItem('supplysync_intro_v4')
```
Then refresh the page.

## Notes
- No extra npm packages required
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- The `intro.webm` file is ~970 KB (VP9 codec, 30fps, 8 seconds, 1280×720)
