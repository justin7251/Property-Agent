# Property Agent Website — Build Spec

## Overview
A real estate agent dashboard web app built with **Next.js 15 (App Router)** and **Chakra UI v3**.
The app manages properties, inquiries, agents, landlords, and revenue reports.

---

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **UI**: Chakra UI v3
- **Icons**: react-icons (lu set)
- **Data Fetching**: React Query (TanStack Query v5)
- **Language**: TypeScript
- **Font**: DM Sans (via next/font/google)

---

## What Already Exists

### `app/(dashboard)/dashboard/page.tsx`
A single-file dashboard shell. Contains:
- Sidebar with nav links (Dashboard, Properties, Inquiries, Agents, Reports, Settings)
- Top bar with mail, bell, and avatar
- Properties Overview stat cards (Available Units, Revenue, Total Clients) using a custom SVG `ProgressRing`
- Map placeholder with a popup property card and location pins
- Recent Inquiries table
- Agent Leaderboard with a mini bar chart

### `app/providers.tsx`
Chakra UI v3 `ChakraProvider` wrapping `defaultSystem`.

### `app/layout.tsx`
Root layout with DM Sans font and Providers.

---

## Critical Rules — Read Before Writing Any Code

### Chakra UI v3 — DO NOT USE these components, they throw `[chakra-ui > factory] No valid child found`:
- ❌ `CircularProgress.Root / .Circle / .Track / .Range`
- ❌ `Avatar.Root / .Fallback / .Image`
- ❌ `For` iterator component

### Instead USE these proven safe alternatives:
- ✅ Custom SVG `ProgressRing` component (already exists in dashboard page — copy it)
- ✅ Custom `InitialsAvatar` component (already exists in dashboard page — copy it)
- ✅ Native `.map()` for iteration
- ✅ `Box`, `Flex`, `Text`, `Icon`, `Stack`, `Badge`, `Button`, `Table.Root` are all safe

---

## Project Structure to Build

```
app/
├── layout.tsx                         # already exists
├── page.tsx                           # redirect to /dashboard
├── providers.tsx                      # already exists
│
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
│
└── (dashboard)/
    ├── layout.tsx                     # extract sidebar + topbar here
    ├── dashboard/page.tsx             # already exists — refactor to use shared layout
    ├── properties/
    │   ├── page.tsx
    │   ├── [id]/page.tsx
    │   └── new/page.tsx
    ├── inquiries/
    │   ├── page.tsx
    │   └── [id]/page.tsx
    ├── agents/
    │   ├── page.tsx
    │   ├── [id]/page.tsx
    │   └── new/page.tsx
    ├── landlords/
    │   ├── page.tsx
    │   ├── [id]/page.tsx
    │   └── new/page.tsx
    └── reports/
        ├── page.tsx
        └── revenue/page.tsx

components/
├── layout/
│   ├── Sidebar.tsx
│   └── Topbar.tsx
├── ui/
│   ├── ProgressRing.tsx
│   ├── InitialsAvatar.tsx
│   ├── PageHeader.tsx
│   ├── DataTable.tsx
│   └── EmptyState.tsx
├── properties/
│   ├── PropertyCard.tsx
│   ├── PropertyTable.tsx
│   └── PropertyForm.tsx
├── inquiries/
│   ├── InquiryTable.tsx
│   ├── InquiryStatusBadge.tsx
│   └── InquiryDetail.tsx
├── agents/
│   ├── AgentCard.tsx
│   └── AgentForm.tsx
├── landlords/
│   ├── LandlordCard.tsx
│   └── LandlordForm.tsx
└── reports/
    ├── RevenueChart.tsx
    └── ReportSummaryCard.tsx

types/
├── property.ts
├── inquiry.ts
├── agent.ts
├── landlord.ts
└── report.ts

lib/
├── mockData.ts                        # all hardcoded data lives here
└── utils.ts

hooks/
├── useProperties.ts
├── useInquiries.ts
├── useAgents.ts
├── useLandlords.ts
└── useReports.ts
```

---

## Types to Define

### `types/property.ts`
```ts
export type PropertyStatus = 'available' | 'rented' | 'under_review' | 'off_market'

export interface Property {
  id: string
  title: string
  address: string
  price: number
  priceUnit: 'mo' | 'yr'
  status: PropertyStatus
  type: 'condo' | 'apartment' | 'house' | 'office'
  bedrooms: number
  bathrooms: number
  sqft: number
  agentId: string
  landlordId: string
  images: string[]
  createdAt: string
}
```

### `types/inquiry.ts`
```ts
export type InquiryStatus = 'new' | 'in_progress' | 'resolved' | 'closed'

export interface Inquiry {
  id: string
  clientName: string
  clientEmail: string
  propertyId: string
  propertyTitle: string
  agentId: string
  status: InquiryStatus
  message: string
  date: string
}
```

### `types/agent.ts`
```ts
export interface Agent {
  id: string
  name: string
  email: string
  phone: string
  totalSales: number
  activeListings: number
  closedDeals: number
  joinedAt: string
}
```

### `types/landlord.ts`
```ts
export interface Landlord {
  id: string
  name: string
  email: string
  phone: string
  totalProperties: number
  activeProperties: number
  revenue: number
  joinedAt: string
}
```

### `types/report.ts`
```ts
export interface RevenueReport {
  month: string
  revenue: number
  expenses: number
  profit: number
}

export interface AgentPerformance {
  agentId: string
  agentName: string
  sales: number
  inquiries: number
  closedDeals: number
}
```

---

## Pages — What Each Should Contain

### `(dashboard)/layout.tsx`
- Import `Sidebar` and `Topbar` from components
- Wrap children in a `Flex` with sidebar on the left, main content on the right
- This replaces the inline sidebar/topbar currently in `dashboard/page.tsx`

### `(dashboard)/dashboard/page.tsx`
- Refactor to remove inline Sidebar and Topbar (now in layout)
- Keep: StatCards, MapPlaceholder, RecentInquiries table, AgentLeaderboard

### `properties/page.tsx`
- Page header: "Properties" + "Add Property" button
- Filter bar: status dropdown, type dropdown, search input
- Grid of `PropertyCard` components (image placeholder, title, price, status badge, agent name, view button)
- Empty state if no results

### `properties/[id]/page.tsx`
- Property image banner
- Title, address, price, status badge
- Details grid: bedrooms, bathrooms, sqft, type
- Assigned agent info
- Landlord info
- Inquiry history for this property

### `properties/new/page.tsx`
- Form: title, address, price, type, bedrooms, bathrooms, sqft, assign agent, assign landlord, status
- Submit creates a new property

### `inquiries/page.tsx`
- Page header: "Inquiries"
- Filter by status (new, in_progress, resolved, closed)
- `InquiryTable` with columns: Client, Property, Agent, Date, Status, Actions
- Clicking a row goes to `inquiries/[id]`

### `inquiries/[id]/page.tsx`
- Client name and contact info
- Property linked
- Agent assigned
- Status badge + ability to change status
- Original message
- Reply/notes thread area (UI only, no backend needed)

### `agents/page.tsx`
- Page header: "Agents" + "Add Agent" button
- Grid or table of `AgentCard`: name, initials avatar, total sales, active listings, closed deals
- Click goes to `agents/[id]`

### `agents/[id]/page.tsx`
- Agent profile: name, email, phone, joined date
- Stats: total sales, active listings, closed deals
- List of assigned properties
- List of handled inquiries

### `agents/new/page.tsx`
- Form: name, email, phone

### `landlords/page.tsx`
- Page header: "Landlords" + "Add Landlord" button
- Table: name, email, total properties, active properties, revenue
- Click goes to `landlords/[id]`

### `landlords/[id]/page.tsx`
- Landlord profile: name, email, phone
- Stats: total properties, active, revenue
- List of owned properties

### `landlords/new/page.tsx`
- Form: name, email, phone

### `reports/page.tsx`
- Summary cards: Total Revenue, Total Expenses, Net Profit, Occupancy Rate
- Link cards to sub-pages: Revenue Report, Agent Performance

### `reports/revenue/page.tsx`
- Bar chart: monthly revenue vs expenses (use plain CSS bars like the existing MiniBarChart pattern)
- Table: month, revenue, expenses, profit per row

---

## Mock Data — `lib/mockData.ts`
All data should be hardcoded here for now. Create at minimum:
- 10 properties
- 8 inquiries
- 5 agents
- 4 landlords
- 6 months of revenue data

---

## Shared UI Components

### `components/ui/PageHeader.tsx`
Props: `title`, `subtitle?`, `action?` (renders a button on the right)

### `components/ui/DataTable.tsx`
Generic table wrapper using `Table.Root` from Chakra UI v3.
Props: `columns`, `data`, `onRowClick?`

### `components/ui/EmptyState.tsx`
Props: `title`, `description`, `icon?`
Shown when a list has no items.

### `components/ui/InquiryStatusBadge.tsx`
Maps status string to color:
- `new` → blue
- `in_progress` → yellow
- `resolved` → green
- `closed` → gray

---

## Design Tokens — Stay Consistent
```
Background:     #F4F7FB
Sidebar:        white
Cards:          white, border gray.100, borderRadius 2xl
Primary blue:   #2563EB
Success green:  #22C55E
Font:           DM Sans
Active nav bg:  #2563EB (white text)
Inactive nav:   gray.500 text, transparent bg
```

---

## Build Order (recommended)
1. Extract `Sidebar` and `Topbar` into `components/layout/`
2. Create `(dashboard)/layout.tsx` using them
3. Define all types in `types/`
4. Create `lib/mockData.ts` with all fake data
5. Build `properties/` pages
6. Build `inquiries/` pages
7. Build `agents/` pages
8. Build `landlords/` pages
9. Build `reports/` pages
10. Add `(auth)/login` and `register` last

---

## Notes
- Use **mock data only** — no backend, no API calls, no database
- Every page must use the shared `(dashboard)/layout.tsx` — do not repeat sidebar/topbar inline
- Do not use Chakra compound components listed in the Critical Rules section above
- Keep all pages as `"use client"` for now
- Navigation between pages should use Next.js `<Link>` or `router.push`
