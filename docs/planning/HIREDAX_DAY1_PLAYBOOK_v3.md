# HireDax — Day 1 Operational Playbook (v3)
## Monday, June 8, 2026 | 8:00 AM → End of Day

> **Hard deadline: Thursday, June 11, 2026 at 5:00 PM PST (8:00 PM EST)**
> **Days remaining including today: 4 days**
> **Competition status: LIVE — other submissions already in. Move fast.**
>
> **Today's goal:** Every screen in the app visible with mock data by 1:30 PM.
> ADK multi-agent scaffolded and talking locally by 2:00 PM.
> Firebase wired and both UIs live on real data by EOD (evening extension).
>
> **4-day schedule (v6-aligned):**
> - **Monday June 8 (TODAY):** All frontend screens + ADK scaffold (Tasks 1–10, 15)
> - **Tuesday June 9:** Firebase wiring + ADK tools + GroundingAgent + Cloud Run (Tasks 11–20)
> - **Wednesday June 10:** Eval + polish + production deploy + VIDEO RECORDING (Tasks 21–24)
> - **Thursday June 11:** Final review + SUBMIT before 5 PM PST (no new code)
>
> **Confidence anchor:** By 9:00 AM you will have a branded landing page
> running in your browser. Every 30–45 minutes after that, a new screen
> goes live. You will see HireDax come to life in real time.

---

## CRITICAL FIRST: Competition Deadline Confirmation

Before opening VS Code, confirm these facts are in your head:

| Item | Value |
|---|---|
| **Today** | Monday, June 8, 2026 |
| **Submission deadline** | Thursday, June 11 at 5:00 PM PST (8:00 PM EST) |
| **Video must be recorded by** | Wednesday, June 10 (end of day) |
| **Last new code commit** | Wednesday, June 10 |
| **Thursday June 11** | Review + submit only. No new code. |
| **Prize pool** | $90,000 total |
| **Track** | Track 1 — Build (Net-New Agents) |
| **Judging** | Technical Implementation 30% · Business Case 30% · Innovation 20% · Demo 20% |
| **Required deliverables** | Code (public GitHub) · Video · Architecture diagram · Testing access (live URL + login) |

---

## Before You Open VS Code — Accounts to Create (30 min)

You need three accounts active before writing a single line of code.
Do this first so credentials are ready when Claude Code needs them.

### A — Create Your Vapi Account

1. Go to **https://app.vapi.ai** and sign up with your Google account.
2. After login, navigate to the left sidebar → **Phone Numbers** → **Buy Number**.
   - Buy one US number (~$2/month). This is the number Dax will answer.
   - Write down the full number with country code.
3. Navigate to **Settings** (bottom-left) → **API Keys** → **Create Key**.
   - Name it `hiredax-dev`.
   - Copy the key immediately — you will not see it again.
   - Save as `VAPI_API_KEY`.
4. Navigate to **Assistants** → **Create Assistant**.
   - Name: `Dax`
   - Model: Select **Gemini 3.1 Flash Live** (or closest available Gemini Live model)
   - Leave system prompt blank for now — you set it on Day 2 when webhook is wired.
   - Click **Save**.
   - Copy the Assistant ID from the URL bar or assistant panel → save as `VAPI_ASSISTANT_ID`.
5. Go back to **Phone Numbers** → click your number → assign the `Dax` assistant to it.
   - Leave webhook URL blank for now (you add it on Day 2).
   - Copy the Phone Number ID → save as `VAPI_PHONE_NUMBER_ID`.

**Save these now (fill in your values):**
```
VAPI_API_KEY=
VAPI_ASSISTANT_ID=
VAPI_PHONE_NUMBER_ID=
VAPI_PHONE_NUMBER=    ← the actual number e.g. +17705550100
```

---

### B — Create Your Surge.app Account

1. Go to **https://surge.app** and sign up.
2. Complete any onboarding / phone number provisioning prompts.
3. Navigate to **Settings** → **API Keys** → create key named `hiredax`.
   - Copy as `SURGE_API_KEY`.
4. Your Account ID is in the URL when on the dashboard:
   `https://app.surge.app/accounts/YOUR_ACCOUNT_ID/...`
   - Copy as `SURGE_ACCOUNT_ID`.

**Save these now:**
```
SURGE_API_KEY=
SURGE_ACCOUNT_ID=
```

---

### C — Create Your GitHub Repo

1. Go to **https://github.com/new**.
2. Repository name: `hiredax`
3. Set to **Public** (required for challenge submission).
4. Add **MIT License** from the dropdown (required).
5. Do NOT initialize with README — Next.js will create one.
6. Click **Create Repository**. Copy the repo URL.

---

### D — VS Code Environment Check (2 min)

```bash
# Open VS Code → open hiredax-workspace/ folder
# In the integrated terminal (Ctrl+` or Cmd+`):
ls
# Must show: CLAUDE.md  HIREDAX_SSD_v4.md  HIREDAX_BUILD_PLAN_v6.md  HIREDAX_DAY1_PLAYBOOK_v3.md  .claude/

claude --version   # Must print a version number

# Initialize git and connect to GitHub
git init
git remote add origin https://github.com/YOUR_USERNAME/hiredax.git
git checkout -b main
```

---

## VS Code Layout — Set Once, Keep All Day

**Split your terminal into two panes:**
- `Ctrl+Shift+5` (Windows/Linux) or `Cmd+\` (Mac) to split
- **Left pane (Terminal 1):** Claude Code sessions + npm commands in `hiredax/`
- **Right pane (Terminal 2):** Python/ADK commands in `dax-agent/` (used at noon)

**Open the Claude Code chat panel** in the VS Code sidebar.
This is where you paste prompts. The terminal is for manual commands.

**Keep a browser tab pinned** to `http://localhost:3000` — this is your visual confirmation after each task.

---

## 8:00 AM — Session Starter Prompt

Paste this as your opening message in the Claude Code chat panel
at the start of every session today. It loads your full project context.

```
Read CLAUDE.md, HIREDAX_SSD_v4.md, and HIREDAX_BUILD_PLAN_v6.md
before doing anything else. Confirm you have read them by summarizing
the Expert Seal Gate constraint and the tech stack in 2 sentences.

Today is Monday June 8, 2026 — Day 1 of the build. We are working
inside hiredax-workspace/hiredax/ for all Next.js tasks today.
All tasks use mock data only. Do not connect to any external service
unless explicitly told.
```

Wait for Claude Code to confirm it read the files. It should reference:
"No price without operator approval" and "Next.js 14 + TypeScript + Firestore,
plus a Python ADK multi-agent (EstimatorAgent + GroundingAgent)."
If it cannot answer this, verify CLAUDE.md and HIREDAX_SSD_v4.md are in the workspace root.

---

## 8:10 AM — Task 1: Next.js Scaffold ⚙️
**Duration: 15 min | No visual yet — just the foundation**

### Paste this prompt:

```
TASK 1 — Next.js Project Scaffold

Create a new Next.js 14 App Router project called "hiredax" inside the
current workspace directory (path: hiredax-workspace/hiredax/).

Run this scaffolding command:
npx create-next-app@14 hiredax --typescript --tailwind --eslint --app \
  --src-dir no --import-alias "@/*" --use-npm

After scaffolding, inside the hiredax/ directory:

1. Create this folder structure (matching SSD v4 section 1.5):
   app/(marketing)/          - with placeholder page.tsx
   app/login/
   app/onboarding/
   app/dashboard/            - with layout.tsx, page.tsx
   app/dashboard/schedule/
   app/dashboard/settings/
   app/portal/[token]/
   app/api/vapi/webhook/
   components/ui/
   components/dashboard/
   components/portal/
   lib/                      - with empty firebase.ts and mock-data.ts
   styles/

2. Create styles/design-system.css with EXACTLY the CSS variables
   from SSD v4 section 1.4 — all tokens under :root {}.

3. Create styles/globals.css with ONLY this content:
   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
   html { -webkit-font-smoothing: antialiased; }
   body { background: var(--color-bone); color: var(--color-navy); }
   a { color: inherit; }
   button { font-family: inherit; }

4. Update app/layout.tsx:
   - Import Fraunces (weight: ['300','400','600','700']) and Manrope
     (weight: ['300','400','500','600','700']) from next/font/google
   - Apply as CSS variables --font-display (Fraunces) and --font-body
     (Manrope) on the <html> element
   - Import styles/design-system.css FIRST, then styles/globals.css
   - Do NOT import any Tailwind CSS files

5. Also create these empty stylesheet files (they will be filled by
   later tasks):
   styles/marketing.css
   styles/auth.css
   styles/onboarding.css
   styles/dashboard.css
   styles/portal.css
   styles/components.css

DO NOT create or reference tailwind.config.ts — Tailwind is not used
in this project. We use plain CSS with design system variables only.

Run npm run dev and confirm it starts. Report any issues.
```

### While Claude Code runs (~5 min):
Create your `.env.local` file in the workspace root:

```bash
cat > .env.local << 'EOF'
# Vapi
VAPI_API_KEY=
VAPI_ASSISTANT_ID=
VAPI_PHONE_NUMBER_ID=

# Surge
SURGE_API_KEY=
SURGE_ACCOUNT_ID=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
DAX_AGENT_URL=http://localhost:8080
EOF
```
Fill in your values from the pre-flight step above.

### Verify:
```bash
cd hiredax && npm run dev
# ✓ Ready on http://localhost:3000
```
Open `http://localhost:3000`. Default Next.js page — that is correct.

---

## 8:25 AM — Task 2: Shared UI Components 🎨
**Duration: 30 min | Visual win: ✅ Component library on screen**

### Paste this prompt:

```
TASK 2 — Shared UI Components

Build shared UI primitives in components/ui/ using ONLY the design system
CSS variables from styles/design-system.css (finalized Fraunces/Manrope,
bone/navy/green). No external component libraries. TypeScript strict.
Minimum touch target 48×48px on all interactive elements.

Build each as a separate file:

0. components/ui/Logo.tsx
   The "Hire"+"Dax" wordmark: "Dax" lifted slightly with a green underline
   accent bar beneath it. Reuse the .logo-lift markup/styling from the
   marketing landing page so the logo is identical everywhere.

1. components/ui/Button.tsx
   Props: variant (primary|secondary|danger), loading, disabled, onClick, children
   Primary: bg var(--color-green), var(--color-navy) text
   Secondary: border var(--border-strong), var(--color-navy) text
   Danger: bg var(--status-error-text), white text
   Loading: Spinner inline, interaction disabled

2. components/ui/Card.tsx
   Props: children, className, header?, footer?
   Background var(--bg-raised), border-radius var(--radius-xl), shadow var(--shadow-md)

3. components/ui/StatusPill.tsx
   Props: status (all 12 SessionStatus values from SSD v4 section 1.6/1.6a)
   Pill shape (--radius-full), small uppercase label. Color mapping:
   call_active, link_sent, photos_uploading, photos_complete
     → var(--status-active-bg) navy bg / var(--status-active-text)
   analysis_running, pending_approval
     → var(--status-pending-bg) stone bg / var(--status-pending-text)
   quote_approved, quote_delivered, booking_confirmed, work_order_signed,
   job_complete, rated
     → var(--status-approved-bg) green bg / var(--status-approved-text)
   Also a pulsing "Dax is on" / "Live" green variant for the active call.
   Show a human-readable label per status.

4. components/ui/Input.tsx
   Props: label, error, type, placeholder, value, onChange, name
   Label above. Error below in var(--status-error-text). Full width.
   Focus ring uses green (--color-green). Support an .is-error state.

5. components/ui/Select.tsx
   Props: label, options ([{value,label}]), value, onChange
   Styled dropdown, full width.

6. components/ui/Checkbox.tsx
   Props: label, checked, onChange
   Minimum 48×48px tap target. Label beside box.

7. components/ui/Modal.tsx
   Props: isOpen, onClose, title, children
   Mobile: slides up from bottom. Desktop: centered overlay. Dark backdrop.

8. components/ui/StarRating.tsx
   Props: value (1-5|null), onChange, readOnly
   5 stars, each ≥ 48px wide. Filled = var(--color-green).

9. components/ui/Spinner.tsx
   Rotating CSS animation. Size prop: sm|md|lg.

Create styles/components.css for all shared UI components. Import it
in app/layout.tsx after globals.css. All component classes use the
prefix .ui-* (e.g. .ui-btn, .ui-card, .ui-badge, .ui-input).
Do NOT use Tailwind classes. Use only CSS variables from design-system.css.

Create /dev page rendering every component with example props for QA.
Export all from components/ui/index.ts.
```

### Verify:
Open `http://localhost:3000/dev` — all components render in Fraunces/Manrope and the bone/navy/green palette. Spot check touch targets and the StatusPill colors (navy/stone/green).

**First visual win. ✅**

---

## 8:55 AM — Task 3: Marketing Private Beta Landing Page 🎨
**Duration: 35 min | Visual win: ✅ Branded public landing page — your FIRST full visual confidence moment**

### Paste this prompt:

```
TASK 3 — Marketing Site: Private Beta Landing Page

Build app/(marketing)/page.tsx. Background: var(--bg-base) (bone).
Finalized design system only (Fraunces display + Manrope body,
bone/navy/green). No external images — inline SVG or the Logo component.
Mirror the structure/styling of the approved landing page reference.

TOP NAV (components/marketing/Header.tsx):
- Left: Logo component (Hire + Dax wordmark, lifted "Dax" + green underline)
- Right: a "Private Beta" uppercase label AND an "Operator Login" button
  linking to /login. The Operator Login button is the JUDGE ACCESS POINT —
  make it clearly visible (navy or outline style).

SECTION 1 — HERO
Headline (Fraunces, var(--text-primary)):
  "You get the job done. We'll handle getting you more."
Subheadline (Manrope, var(--text-secondary)):
  "Capture leads, ask smart follow-up questions, generate estimates, and
  automatically book your next job while you stay in the truck."

SECTION 2 — WAITLIST CARD (components/marketing/WaitlistForm.tsx)
White card, var(--radius-xl), var(--shadow-md), centered, max-width ~500px.
  Heading (Fraunces): "Join the Private Beta Waitlist"
  Copy: "Our onboarding spaces are currently limited. Register your trades
  business below to secure your spot."
  Fields: Business Name (text, required), Email Address (email, required)
  Green submit button: "Request Private Access"
  On submit: preventDefault + show a simple success confirmation (placeholder,
  no backend).

SECTION 3 — FOOTER (components/marketing/Footer.tsx)
  Left: "HireDax by Amazing.ai" + "© 2026 AmazingDotAi, LLC"
  Right: Terms · Privacy + social media links (placeholder hrefs OK).
  Use simple inline SVG social icons.

Mobile-first single column; hero + card + footer hold cleanly at
375px, 768px, 1024px.
```

### Verify:
`http://localhost:3000` — hero, waitlist card, and footer render in the new
brand. The **Operator Login** button is visible in the header and links to
`/login`. Resize to 375px — clean single column.

**Branded private beta landing page live. ✅ This is the look judges see first.**

---

## 9:25 AM — Task 4: Mock Data + TypeScript Types ⚙️
**Duration: 10 min**

### Paste this prompt:

```
TASK 4 — Mock Data and TypeScript Types

Create lib/mock-data.ts with all interfaces from SSD v4 section 1.6.
No `any` types. Use Date (not Timestamp) for mock data.

Interfaces to define: Operator, Session, SessionStatus (12 values),
AnalysisResult — exactly matching SSD v4 section 1.6.

Seed objects:
1. MOCK_OPERATOR: id "op-001", companyName "ATL Junk Pros",
   phone "678-555-0100", operatingHours {open:"08:00",close:"20:00"},
   equipment ["dumpster","pickup"], serviceRadius 25,
   serviceZips ["30213","30214","30215"], onboardingComplete true

2. MOCK_SESSION_PENDING: token "session-demo-001", status "pending_approval",
   customerName "Marcus Williams", customerPhone "+14045550123",
   analysisResult: items [{couch,1.5,1},{mattress,1.2,1},{cardboard boxes,0.8,6}],
   totalVolume 3.5, estimatedPrice 412.50,
   surcharges {heavy_items:0, stairs:0, interior:50}

3. MOCK_SESSION_APPROVED: token "session-demo-002", status "quote_approved",
   customerName "Sheila Thompson", approvedPrice 375

4. MOCK_SESSION_BOOKED: token "session-demo-003", status "booking_confirmed",
   customerName "David Chen", approvedPrice 525,
   bookingSlot "2:00 PM – 4:00 PM today"

Export: MOCK_OPERATOR, MOCK_SESSIONS (array of all 3), all types.
```

---

## 9:35 AM — Task 5: Onboarding Wizard 🎨
**Duration: 45 min | Visual win: ✅ Full 7-step interactive wizard**

### Paste this prompt:

```
TASK 5 — Onboarding Wizard (7 Steps)

Build app/onboarding/page.tsx. All state local (useState). No backend.

STYLING: Create styles/onboarding.css and import it at the top of this
file. Use .ob-* class names (e.g. .ob-page, .ob-card, .ob-step, .ob-progress).
Do NOT use Tailwind classes. Use CSS variables from design-system.css only.
Page background: var(--bg-base). Cards use var(--bg-raised).

TOP PROGRESS BAR: "Step N of 7" with fill bar in var(--color-green).

STEP 1 — Business Info
Inputs: Company Name (required), Business Phone (tel), Your Name (required)
Next button.

STEP 2 — Carrier Forwarding (NO user input — display only)
HIGH CONTRAST card: background var(--color-navy), all text white.
Heading: "Set Up Call Forwarding"
Instructions:
  "1. Pick up your business phone"
  "2. Dial: *72 followed by your HireDax system number"
  "3. Wait for the confirmation tone, then hang up"
  "4. Test: call your business number from another phone"
Note: "Disable anytime by dialing *73."
Green checkbox: "✓ I've set this up" — Next button disabled until checked.

STEP 3 — Operating Hours
Two selects: Opening Time (6 AM–12 PM in 30-min increments),
Closing Time (12 PM–10 PM). Defaults: 8 AM / 8 PM.

STEP 4 — Equipment Inventory
Three large card-style checkbox items (tap anywhere on the card):
  🗑 Dumpsters / 🚚 Flatbed Trucks / 🛻 Pickup Trucks
At least one must be selected. Next disabled until selection made.

STEP 5 — Service Area
Number input: Service Radius (miles, default 25).
Zip code multi-entry: text input + "Add" button. Each zip shows as
removable pill. Min 1 zip required.

STEP 6 — Task Durations
Two pre-populated rows from MOCK_OPERATOR.taskDurations:
  "Construction Debris Removal" — hours input + flat rate input
  "Basement Cleanout" — hours input + flat rate input
"+ Add Another Task Type" link at bottom.

STEP 7 — Activation Check
Heading: "Let's test your connection"
Button: "Run Test Call" — on click: spinner 2 seconds → then:
  ✅ Large green checkmark + "Connection confirmed! Dax is ready."
"Complete Setup →" button appears after animation.
On click: toast "Setup complete! Redirecting..." then /dashboard after 1.5s.

All Back/Next navigation. State persists when navigating back.
```

### While Claude Code builds (~15 min) — take a 5-min break. You've been at it 90 min.

### Verify:
`http://localhost:3000/onboarding` — step through all 7 steps.
Step 2: navy card with white text. Step 4: large tap targets. Step 7: animation.

**Full onboarding wizard live. ✅**

---

## 10:20 AM — Task 6: Customer Portal 🎨
**Duration: 40 min | Visual win: ✅ Full customer PWA all states**

### Paste this prompt:

```
TASK 6 — Customer Portal (Sight Link PWA)

Build app/portal/[token]/page.tsx. Zero-install PWA. No login required.

STYLING: Create styles/portal.css and import it at the top of this file.
Use .portal-* class names (e.g. .portal-page, .portal-card, .portal-btn).
Do NOT use Tailwind classes. Use CSS variables from design-system.css only.
Page background: var(--bg-base). Mobile-first (375px base).

Include a DEV-ONLY state switcher dropdown at top:
"[DEV] Preview State:" — remove before deployment in Task 12.

STATE: "link_sent" (default)
Heading: "Upload Your Photos"
Subtext: "Take 1–3 clear photos of what needs to be removed."
Large camera emoji centered.
Two full-width buttons:
  "📷 Take a Photo" (input type=file accept=image/*)
  "🖼 Choose from Library" (same file input)
Counter: "0 photos uploaded" (updates on file selection).

STATE: "photos_uploading"
Photo thumbnails (URL.createObjectURL previews).
Pulsing progress bar at ~60% (mock animation).
Text: "Uploading your photos..."

STATE: "analysis_running"
Large centered Spinner.
Text: "Analyzing your photos..."
Subtext: "This usually takes less than 30 seconds."

STATE: "quote_approved"
Card header: "Your Estimate Is Ready" in var(--color-green).
MANDATORY DISCLAIMER — cannot be missed:
  background: #FEF08A, border: 2px solid #EAB308, rounded, padding
  Bold: "⚠️ Preliminary Visual Estimate Only"
  Smaller: "Final price confirmed after on-site inspection."
Itemized list from MOCK_SESSION_PENDING.analysisResult.items:
  each row: item name + volume + price contribution
Subtotal + surcharges breakdown.
TOTAL row (large, bold): "$412.50"
Full-width primary button: "✅ Accept This Estimate"
Secondary link: "Questions? Call us back"

STATE: "booking_confirmed"
Heading: "Estimate Accepted!"
Booking slot: "2:00 PM – 4:00 PM today"
Divider.
Heading: "Please Sign to Confirm"
HTML5 Canvas signature pad (100% width, 150px height):
  - Draws on touch/mouse events, 2px black stroke on white
  - "Clear" button below
Full-width button: "Sign & Confirm Work Order"
  Disabled until at least one stroke drawn on canvas.
After signing: button → "✓ Signed!" and transition to next state.

STATE: "job_complete"
✅ Large checkmark (centered, 64px emoji).
Heading: "You're all set, Marcus!"
Booking reminder text.
Divider.
"How was your experience?" + StarRating component.
Textarea: "Any comments?" (280 char max).
Full-width button: "Submit Feedback"
After submit: "Thank you! We appreciate it. 🙌"

All touch targets ≥ 48×48px. Use MOCK_SESSION_PENDING for quote data.
```

### Verify:
`http://localhost:3000/portal/test-token`
Use dev switcher to walk all states. Check signature canvas draws. Check disclaimer box.

**Full customer portal live. ✅**

---

## 11:00 AM — Task 7: Expert Seal Live Feed 🎨
**Duration: 40 min | Visual win: ✅ Primary operator dashboard**

### Paste this prompt:

```
TASK 7 — Expert Seal Live Feed

Build app/dashboard/page.tsx. Mobile-first.

STYLING: Create styles/dashboard.css and import it at the top of this
file. Use .db-* class names (e.g. .db-page, .db-stats, .db-card, .db-btn).
Do NOT use Tailwind classes. Use CSS variables from design-system.css only.
Page background: var(--bg-base).

STATS BAR (always visible at top — does not scroll)
4 KPI cards in 2×2 grid:
  "Active Jobs" → 3 (var(--color-green))
  "Today's Revenue" → $1,312.50 (var(--color-green))
  "Conversion Rate" → 78% (var(--color-navy))
  "Volume" → 12.4 yd³ (var(--color-stone))
Each: var(--bg-raised) background, border-radius var(--radius-xl),
box-shadow var(--shadow-sm), label + large bold value.

SCROLLABLE SESSION CARD FEED
Header: "Live Work Orders"
Render MOCK_SESSIONS sorted by most-recently-updated first.

For status "pending_approval" — FULL expanded card:
  TOP ROW: Customer name + phone + StatusPill (Pending Approval, amber)
  VISUAL BREAKDOWN TRAY:
    "Dax identified these items:" heading
    List each item: name, volume, count
    3 placeholder photo thumbnails (gray boxes 80×80px)
    "Total volume: 3.5 cubic yards"
  PRICING PANEL:
    "Base estimate: $362.50" (smaller text)
    "Interior surcharge: $50.00"
    Large editable input: $412.50
      min-height 48px, large font, border 2px solid var(--color-green)
    Checkbox toggle: "Add Heavy Item Surcharge (+$50)"
  APPROVE BUTTON:
    Full card width. Min 56px height. Background var(--color-green).
    Text: "✅ Approve & Release Quote" white bold.
    On click: green pulse animation → "✓ Quote Released!" for 2 seconds.

For status "quote_approved" — collapsed card:
  Name + StatusPill + "Approved: $375.00" + "View Details" link

For status "booking_confirmed" — collapsed card:
  Name + StatusPill + "Slot: 2:00 PM – 4:00 PM" + address

BOTTOM OF PAGE (below cards, grayed out, non-interactive):
Gray italic text: "Autonomous Mode (V2 Preview)"
Smaller: "Coming soon — Dax will auto-approve within your guardrails."
```

### While Claude Code builds (~15 min) — QA the portal.
Open `http://localhost:3000/portal/test-token`, walk all 5 states, note any issues.

### Verify:
`http://localhost:3000/dashboard` — 4 KPIs, pending card with breakdown tray,
Approve button full-width, green. Click it — pulse animation.

**Primary dashboard live. ✅**

---

## 11:40 AM — SHORT BREAK (10 min)

5 screens live in 3.5 hours. The remaining 5 tasks (8–10 + ADK) are all fast.
Get water. Step outside for 5 minutes.

---

## 11:50 AM — Task 8: Schedule + Settings Pages 🎨
**Duration: 30 min | Visual win: ✅ Remaining dashboard tabs**

### Paste this prompt:

```
TASK 8 — Schedule and Settings Pages

STYLING: Both pages import styles/dashboard.css (already created in
Task 7). Add new .db-schedule-* and .db-settings-* classes to that
file as needed. Do NOT use Tailwind classes.

PAGE 1: app/dashboard/schedule/page.tsx
Header: "Upcoming Jobs"
3 mock job cards (use MOCK_SESSION_BOOKED + 2 fabricated ones with
realistic south Atlanta / Fairburn GA addresses):

Each Card:
  LEFT: Date + time block ("Today • 2:00–4:00 PM")
  CENTER: Customer name + job site address (e.g. "142 Cascade Rd, Atlanta, GA 30311")
  RIGHT: Two buttons:
    "📍 Navigate" → opens https://maps.google.com/?q=[address] in new tab
    "📋 Details" → links to /dashboard
  StatusPill: "Booking Confirmed" green

Empty state: "No upcoming jobs. New bookings appear here."

PAGE 2: app/dashboard/settings/page.tsx

Section 1 — Business Profile:
  Input: Company Name (pre-filled "ATL Junk Pros")
  Input: Business Phone (pre-filled "678-555-0100")
  Two time selects: Operating Hours (pre-filled 8 AM / 8 PM)
  Primary button: "Save Changes" → shows "✓ Saved!" toast for 2 seconds

Section 2 — Call Forwarding:
  Read-only input: "HireDax System Number" (placeholder "+1-404-DAX-LINE")
  High-contrast info box (var(--color-navy) bg, white text):
    "To activate: dial *72 + the number above from your business phone."
    "To disable: dial *73."

Section 3 — Notifications:
  Checkbox: "Push notifications for new estimates" (checked)
  Checkbox: "SMS backup alerts" (checked)
  Save button.
```

### Verify:
Schedule: 3 jobs listed, Navigate button opens Google Maps.
Settings: pre-filled form, Save → confirmation toast.

**Schedule + Settings live. ✅**

---

## 12:20 PM — Task 9: Login Page (UI) 🎨
**Duration: 20 min | Visual win: ✅ Login screen — the judge entry point**

### Paste this prompt:

```
TASK 9 — Operator Login Page (UI)

STYLING: Create styles/auth.css and import it at the top of this file.
Use .auth-* class names (e.g. .auth-page, .auth-card, .auth-input,
.auth-btn). Do NOT use Tailwind classes. Use CSS variables only.

Build app/login/page.tsx.
Centered card (max-width ~400px) on var(--bg-base) background,
vertically centered in full viewport height. Finalized design system
(Fraunces/Manrope, bone/navy/green).

Card contents top to bottom:
  Logo component (same Hire+Dax wordmark used on marketing + dashboard)
  "by Amazing.ai" — Manrope, var(--text-accent), 14px
  24px spacer
  Input: Email (type="email", label "Email")
  Input: Password (type="password", label "Password")
  Primary full-width green button: "Sign In"
  Inline error area (hidden until needed) — var(--status-error-text)
  Divider line
  Small centered text: "New to HireDax?" + link "Set up your account →" → /onboarding
  Footer: "© 2026 AmazingDotAi, LLC" — centered, var(--text-secondary), 12px

Build the UI and local form state now. Add a clearly-marked
handleSignIn() STUB with a // TODO(Task 13): wire signInWithEmailAndPassword
comment. The stub should NOT fake a redirect to /dashboard that bypasses
auth — real Firebase Auth is wired in Task 13 on Day 2. For now the stub can
just log the values and show "Sign-in is wired on Day 2."

No Firebase wiring yet — that is Task 13.
```

### Verify:
`http://localhost:3000/login` — centered card with logo, email, password, Sign In,
inline error area, and the onboarding link. Confirm the new brand renders.

**Login screen (UI) live. ✅ Real Firebase Auth lands in Task 13 (Day 2).**

---

## 12:35 PM — Task 10: Dashboard Layout + Navigation 🎨
**Duration: 15 min | Visual win: ✅ Fully navigable app**

### Paste this prompt:

```
TASK 10 — Dashboard Layout and Navigation

STYLING: Add navigation styles to styles/dashboard.css using
.db-nav-* class names (e.g. .db-nav, .db-nav-tab, .db-nav-tab-active,
.db-sidebar, .db-sidebar-link). Do NOT use Tailwind classes.

Create app/dashboard/layout.tsx wrapping all dashboard routes.

Install lucide-react first: npm install lucide-react
Import icons: ClipboardList, Calendar, Settings2

MOBILE (< 768px):
  Fixed bottom tab bar, var(--bg-raised) background, border-top.
  Three tabs, each ≥ 48px height:
    ClipboardList icon + "Work Orders" → /dashboard
    Calendar icon + "Schedule" → /dashboard/schedule
    Settings2 icon + "Settings" → /dashboard/settings
  Active tab: var(--color-green) text + icon, bold
  Inactive: var(--color-navy) at 50% opacity
  "Work Orders" tab: red badge with count "1" (hardcoded — pending sessions)

DESKTOP (≥ 768px):
  Fixed left sidebar, 240px wide, var(--bg-raised) background.
  Logo component at top (same Hire+Dax wordmark used everywhere).
  Same three nav items as sidebar links with icons.
  Active link: var(--color-green) with left border accent.

HEADER (mobile only): Logo component centered, var(--bg-raised) bg.

Content area: renders {children} with bottom padding on mobile
to prevent content hiding behind the tab bar.
```

### Verify:
`http://localhost:3000/dashboard` — bottom tabs on mobile, sidebar on desktop.
Tap all three tabs — each navigates to correct page.

**Fully navigable app. ✅**

---

## 12:50 PM — 🎉 VISUAL CHECKPOINT (10 min)

Every screen in HireDax is now live with mock data. Walk it in the exact order
a judge will, end to end:

**On your phone (port forward or local IP):**
1. Marketing landing page (`/`) → tap **Operator Login** in the header
2. Login screen → tap "Set up your account →" → Onboarding (all 7 steps)
3. Complete Setup → Dashboard → tap Work Orders, Schedule, Settings
4. Open Portal: `/portal/test-token` → use dev switcher through all states
5. Check signature canvas draws with your finger
6. Check the disclaimer is impossible to miss in quote_approved state

This is the full marketing → login → onboarding → dashboard → portal flow.
Note any layout issues on the real device. Don't fix them now — flag for Task 23.

> Note: login is UI-only today (the handler is a stub). Real Firebase Auth —
> the judge sign-in path — is wired tomorrow in Task 13.

---

## 1:00 PM — LUNCH (30 min) + ADK Scaffold in Terminal 2 🐍

**Eat lunch. While you eat, run the ADK scaffold in Terminal 2.**

### In Terminal 2 (right pane):

```bash
# Make sure you are in hiredax-workspace/ root
cd ..   # if you are currently in hiredax/
pwd     # must show: .../hiredax-workspace

# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.bashrc   # or ~/.zshrc

# Install Agents CLI + install ADK skills into Claude Code
uvx google-agents-cli setup

# Scaffold the dax-agent project
agents-cli create dax-agent --agent adk -d cloud_run --yes

cd dax-agent
uv sync
```

### After uv sync, paste this into Claude Code (specify the dax-agent/ directory):

```
TASK 15 — ADK Agent Scaffold (Python)

I am now working in the dax-agent/ directory, NOT the Next.js app.
This is the Python ADK multi-agent service.

Read HIREDAX_SSD_v4.md section 1.9 completely.

Today (Day 1) we scaffold the ROOT EstimatorAgent only, so it talks locally.
The GroundingAgent sub-agent is built tomorrow (Day 2, Task 16b) — but create
the agents/ folder now so the import path is ready.

Replace the scaffolded files with the HireDax ADK agent code:

1. dax_agent/__init__.py — exports root_agent
2. dax_agent/agent.py — EstimatorAgent (root LlmAgent) with McpToolset for
   Google Managed Firestore MCP + two function tools. Use the code from
   SSD v4 1.9, BUT for today comment out the grounding_agent import and the
   get_pricing_context tool line (we add them Day 2). Leave a "# Day 2: add
   GroundingAgent here" marker so it's obvious where they go.
3. dax_agent/tools/__init__.py — empty
4. dax_agent/tools/send_sight_link.py — Surge.app function tool (SSD v4 1.9)
5. dax_agent/tools/analyze_photos.py — Gemini Vision function tool (SSD v4 1.9)
6. dax_agent/agents/__init__.py — create empty (GroundingAgent lands here Day 2)
7. pyproject.toml — google-adk[gcp]>=2.2.0 dependency (SSD v4 1.9)

Create DESIGN_SPEC.md using the content from SSD v4 section 1.9 (include the
multi-agent description — it documents the Day 2 target architecture).

Create .env with placeholder lines:
GOOGLE_CLOUD_PROJECT=
SURGE_API_KEY=
SURGE_ACCOUNT_ID=
NEXT_PUBLIC_APP_URL=http://localhost:3000
GOOGLE_APPLICATION_CREDENTIALS=

Do not modify business logic. Use the code exactly as written in the SSD.
```

### After files are written:

```bash
# In Terminal 2, still in dax-agent/
uv sync
adk web
# Should show: ADK Web Server started — http://localhost:8080
```

---

## 1:30 PM — ADK Local Verification 🐍
**Duration: 20 min**

Open `http://localhost:8080` in a new browser tab.

**Test 1:**
```
Hi, I need to get rid of a couch and a bunch of boxes from my garage.
```
Dax should respond conversationally (warm greeting, ask for name/details).
In the **Trace panel** (right side) you should see tool definitions listed.

**Test 2:**
```
Can you just give me a price right now without the photos?
```
Dax should politely decline and explain photos are needed — Expert Seal gate in action.

**Test 3:**
Look in the Trace panel for:
- `send_sight_link` as a registered tool
- `analyze_photos` as a registered tool
- `firestore_get_document` from McpToolset
- `firestore_update_document` from McpToolset

**Confirm:**
- [ ] Dax responds conversationally ✅
- [ ] Dax refuses to quote without photos ✅
- [ ] All 4 tools appear in trace panel ✅

> Tools will fail if called (env vars are empty) — that is expected and correct.
> We wire real credentials tomorrow on Day 2.

**ADK agent scaffolded and talking locally. ✅**

---

## 1:50 PM — Commit Everything to GitHub 📦
**Duration: 10 min — non-negotiable**

```bash
# In Terminal 1, from hiredax-workspace/ root:

# Create workspace .gitignore
cat > .gitignore << 'EOF'
node_modules/
.next/
__pycache__/
*.pyc
.venv/
.env
.env.local
.env.*.local
dax-agent/.env
.claude/settings.json
.claude/settings.local.json
.firebase/
.DS_Store
Thumbs.db
EOF

git add .
git status   # Review — should include hiredax/ and dax-agent/

git commit -m "Day 1 (Jun 8): All frontend screens + ADK agent scaffold

Frontend (Next.js):
- Project scaffold with design system tokens
- 9 shared UI components + /dev QA page
- Landing page (responsive, branded)
- Onboarding wizard (7 steps complete)
- Customer portal (all 5 states)
- Expert Seal live feed with session cards
- Schedule + Settings pages
- Login page
- Dashboard tab/sidebar navigation

Python ADK Agent:
- Scaffolded via agents-cli with ADK template
- EstimatorAgent (root LlmAgent) with McpToolset (Google Firestore MCP)
- send_sight_link function tool (Surge.app)
- analyze_photos function tool (Gemini Vision)
- agents/ folder created for Day 2 GroundingAgent
- Verified talking locally at localhost:8080"

git push origin main
```

---

## 2:00 PM — Day 1 State of the Build

| Asset | Status |
|---|---|
| Next.js app at localhost:3000 | ✅ |
| Landing page (branded, responsive) | ✅ |
| Login page | ✅ |
| Onboarding wizard (7 steps) | ✅ |
| Expert Seal dashboard (mock data) | ✅ |
| Schedule page (mock jobs) | ✅ |
| Settings page | ✅ |
| Customer portal (all 5 states) | ✅ |
| Dashboard navigation | ✅ |
| ADK EstimatorAgent at localhost:8080 | ✅ |
| GitHub repo with clean commit | ✅ |
| **Hours used today** | **~6h** |
| **Hours remaining to deadline** | **~75h (to 5 PM PST Thu Jun 11)** |

---

## 2:00 PM Onward — Evening Extension (Recommended)

You have time and energy. Pushing into Day 2 territory tonight puts you
significantly ahead. These are Tasks 11–14 from SSD v4.

**You need a Firebase project before Task 11.** If you don't have one:
1. Go to https://console.firebase.google.com
2. Create project `hiredax-prod`
3. Enable Firestore (Native mode, us-central1)
4. Enable Firebase Storage
5. Enable Firebase Auth (Email/Password)
6. Project Settings → Your Apps → Add Web App → copy config
7. Project Settings → Service Accounts → Generate new private key → download JSON

Then add all Firebase config to `.env.local`.

### Task 11 — Firebase Setup (incl. Auth) (paste to Claude Code):

> These evening-extension prompts mirror SSD v4 Tasks 11–14. The Day 2 playbook
> is the authoritative source if anything differs — but doing them tonight puts
> you ahead. Auth is demo-critical, so the seed creates a real login account.

```
TASK 11 — Firebase Setup (incl. Auth)

1. lib/firebase.ts — client SDK:
   Use NEXT_PUBLIC_FIREBASE_* env vars for all config.
   Initialize and export: app, auth, db (Firestore), storage.
   Set auth persistence to browserLocalPersistence (sessions survive reloads).

2. lib/firebase-admin.ts — server Admin SDK:
   Use FIREBASE_ADMIN_PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY from env
   (handle the PRIVATE_KEY \n escaping). Export adminApp, adminDb, adminAuth.

3. lib/auth-context.tsx — AuthProvider:
   Use onAuthStateChanged; expose { operator, loading, signOut }. On auth
   change, fetch operators/{uid} and expose it as `operator`. Wrap the app
   in AuthProvider in the root layout.

4. hiredax/.env.example documenting all required variables:
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=
   FIREBASE_ADMIN_PROJECT_ID=
   FIREBASE_ADMIN_CLIENT_EMAIL=
   FIREBASE_ADMIN_PRIVATE_KEY=
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   DAX_AGENT_URL=http://localhost:8080
   VAPI_API_KEY=
   VAPI_ASSISTANT_ID=
   DEMO_OPERATOR_EMAIL=demo@hiredax.com
   DEMO_OPERATOR_PASSWORD=

5. firestore.rules:
   sessions/{token}: allow read if true, write if request.auth != null
   operators/{operatorId}: read/write if request.auth.uid === operatorId

6. Install: npm install firebase firebase-admin
```

### Task 12 — Wire Portal to Firestore:

```
TASK 12 — Wire Customer Portal to Firestore

Replace mock data in app/portal/[token]/page.tsx with live Firestore:

1. Import db, storage from lib/firebase.ts
2. useEffect: fetch session doc by token using doc(db,"sessions",token)
3. onSnapshot listener: portal updates in real-time on doc changes
4. Photo upload:
   - On file select: compress to ≤2MB using canvas
   - Upload to Storage: sessions/{token}/photos/{filename}
   - Add Storage URL to session.photos array
   - Update status: first photo → photos_uploading, all done → photos_complete
5. Signature:
   - Canvas to blob → Storage: sessions/{token}/signature.png
   - Write signatureUrl to doc + set work_order_signed status
6. Rating: write {rating, feedbackNote} to session doc
7. Remove DEV state switcher
8. Loading state while initial fetch pending
9. "Session not found" error card if token invalid
```

### Task 13 — Wire Login + Auth Guard + Dashboard to Firestore:

```
TASK 13 — Wire Login + Auth Guard + Dashboard to Firestore

PART A — Make login REAL (demo-critical):
1. Replace the Task 9 handleSignIn() stub in app/login/page.tsx with
   signInWithEmailAndPassword(auth, email, password).
   On success: read operators/{uid}; if onboardingComplete === false →
   /onboarding, else → /dashboard. On error: friendly inline message.
2. Auth guard: middleware.ts redirects logged-out /dashboard/* → /login;
   dashboard layout uses AuthProvider (spinner while loading, redirect to
   /login if no operator). Logged-in hits to /login → /dashboard.
3. Sign Out control in Settings → signOut() → /login.

PART B — Wire dashboard to Firestore:
4. Expert Seal feed: query sessions where operatorId == auth uid,
   onSnapshot, order by updatedAt desc.
5. "Approve & Release Quote": POST /api/quote/approve with
   {sessionToken, approvedPrice}; card updates via onSnapshot.
6. Schedule: query sessions status booking_confirmed+, order by bookingSlot.
7. Settings: read operator doc on load, write on "Save Changes".
8. Onboarding: write each step, set onboardingComplete on finish → /dashboard.
9. Loading skeletons + empty-state card when no sessions.
```

### Task 14 — Seed + Manual Integration + Login Test:

```
TASK 14 — Seed + Manual Integration + Login Test

Write a Firestore seed script at scripts/seed.ts:
- Creates the DEMO OPERATOR Firebase Auth user via Admin SDK using
  DEMO_OPERATOR_EMAIL / DEMO_OPERATOR_PASSWORD, onboardingComplete: true.
- Writes operators/{uid} using that auth uid as the doc id.
- Writes 3 sessions with operatorId === that uid (so the dashboard query
  returns them). Every optional field gets a concrete default.
- Prints the demo credentials at the end (for the README / Devpost testing field).
- Run with: npx ts-node scripts/seed.ts

After seeding, verify the JUDGE FLOW:
1. Marketing site (/) → tap Operator Login → /login
2. Sign in with the seeded demo credentials → lands on a populated dashboard
3. Refresh /dashboard → stays logged in (persistence)
4. Open /dashboard in a private window (logged out) → redirects to /login
5. Sign Out from Settings → returns to /login

Then verify REAL-TIME SYNC:
6. Logged in: dashboard in one tab, /portal/session-demo-001 in another
7. Change status in the Firebase console → both UIs update in < 2s
8. Click Approve on dashboard → portal shows the proposal card

Report pass/fail for each step.
```

---

## End of Day Checklist

```bash
# Final commit before closing
git add .
git commit -m "Day 1 EOD: [list what you completed beyond Tasks 1-10]"
git push origin main
```

**Mark your status:**
- [ ] Tasks 1–10 done (all frontend screens with mock data)
- [ ] ADK EstimatorAgent talking locally at localhost:8080
- [ ] Code pushed to GitHub
- [ ] Firebase project created (if evening extension)
- [ ] Tasks 11–14 wired (if evening extension)

---

## Tomorrow Morning (Tuesday, June 9 — Day 2)

**First 3 actions when you sit down:**
1. Terminal 1: `cd hiredax && npm run dev`
2. Terminal 2: `cd dax-agent && adk web`
3. Claude Code: paste the Day 2 session starter prompt (see HIREDAX_DAY2_PLAYBOOK.md)

**Day 2 targets (full detail in HIREDAX_DAY2_PLAYBOOK.md):**
- Firebase fully wired (Tasks 11–14) if not done tonight
- ADK tools connected to real Surge + Gemini Vision (Task 16)
- **GroundingAgent built + agent-to-agent delegation verified locally (Task 16b)**
- ADK multi-agent system deployed to Cloud Run (Task 17)
- Vapi webhook handler built (Task 18)
- FCM push notifications (Task 19)
- Full end-to-end Golden Thread working (Task 20)

**Wednesday June 10 targets:**
- Eval set run (Task 21)
- Architecture diagram (Task 22)
- Visual polish (Task 23)
- Production deploy + smoke test (Task 24)
- **VIDEO RECORDING** — must be done by Wednesday night

**Thursday June 11 — SUBMISSION DAY:**
- Submit to Devpost before 5:00 PM PST / 8:00 PM EST
- NO new code commits on Thursday
- Final review only

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Claude Code can't find CLAUDE.md | Verify it's in hiredax-workspace/ root, not in hiredax/ subfolder |
| `npm run dev` fails | Run `npm install` first in hiredax/ |
| `adk web` fails | Run `uv sync` in dax-agent/ first |
| Agent doesn't show tools | Check `dax_agent/__init__.py` exports `root_agent` |
| Styles not applying to a page | Confirm the page imports its dedicated .css file (e.g. `import '../../styles/dashboard.css'`) and that the CSS file imports are in app/layout.tsx in the correct order: design-system.css first, globals.css second |
| Port 3000 in use | `lsof -i :3000` then kill process, or `npm run dev -- -p 3001` |
| Port 8080 in use | `lsof -i :8080` then kill, or `adk web --port 8081` |
| TypeScript `any` errors | Ask Claude Code: "Fix all TypeScript strict mode errors" |
| Canvas signature not drawing | Ensure touch/pointer events are wired, not just mouse events |

---

*HireDax Day 1 Playbook v3 — Monday June 8, 2026*
*Hard deadline: Thursday June 11 at 5:00 PM PST (8:00 PM EST)*
*Build fast. Commit often. Ship Thursday. Let's go.*
