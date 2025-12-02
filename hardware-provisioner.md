# Waffle Hardware Provisioner

**Version 4.1** | Last Updated: December 2, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start Guide](#quick-start-guide)
3. [How It Works](#how-it-works)
4. [Core Concepts](#core-concepts)
   - [Stations](#stations)
   - [Printers](#printers)
   - [Printer Placements](#printer-placements)
   - [Peripherals](#peripherals)
   - [Infrastructure](#infrastructure)
   - [Network Equipment](#network-equipment-auto-calculated)
   - [Complexity Level](#complexity-level-auto-calculated)
5. [Business Logic & Provisioning Decisions](#business-logic--provisioning-decisions)
6. [Technical Architecture](#technical-architecture)
7. [Outputs](#outputs)
8. [Notion Integration](#notion-integration)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)
11. [Known Issues & Improvements Needed](#known-issues--improvements-needed)
12. [Limitations](#limitations)
13. [Future Features](#future-features)
14. [Version History](#version-history)

---

## Overview

### What is the Waffle Hardware Provisioner?

The Waffle Hardware Provisioner is an intelligent web-based tool designed for **Waffle Account Managers (AMs)** to configure Point-of-Sale (POS) hardware orders for customer locations. It serves as a smart provisioning wizard that automatically calculates and recommends the optimal hardware setup based on customer constraints and location configurations.

### Use Case

**Primary Workflow:**
1. **Account Managers** speak with customers/clients about their store layouts, infrastructure availability, and operational needs
2. **AMs** input this information into the provisioner (customer constraints, number of stations, printer requirements, cable availability, etc.)
3. The **provisioner automatically calculates** recommended hardware (routers, switches, cables, printer models)
4. **AMs** review the generated order and export it (via clipboard or Notion)
5. **Waffle Operations Team** receives the order to prepare hardware packing, understand installation complexity, and plan deployment

### Who Should Use This Tool?

**Primary Users:**
- **Account Managers (AMs)**: Input customer requirements and generate hardware orders
- **Waffle Operations Team**: Receive provisioned orders to prepare hardware and plan installations

**Not for:**
- Direct customer use (AMs gather requirements from customers first)
- Installation technicians (though they benefit from the complexity estimates)

### What It Does

✅ **Intelligently provisions hardware** based on customer constraints
✅ **Calculates optimal network equipment** (routers, switches, cables)
✅ **Selects appropriate printer models** based on connectivity options
✅ **Estimates installation complexity** and time requirements
✅ **Generates formatted orders** for operations team
✅ **Integrates with Notion** for order tracking

---

## Quick Start Guide

### For Account Managers (First-Time Users)

**Step 1: Gather Customer Information**

Before opening the provisioner, speak with your customer and collect:
- Number of checkout stations needed
- Types of printers required (receipt, kitchen, label)
- Physical locations where printers will be placed
- Cable infrastructure availability (ethernet outlets, visible cable runs)
- Internet connectivity (existing ISP or need SIM card)
- Router placement constraints

**Step 2: Open the Provisioner**

Navigate to the Waffle Hardware Provisioner URL in your browser.

**Step 3: Complete the 5-Step Wizard**

The provisioner guides you through 5 steps:

1. **POS Stations & Peripherals**
   - Enter customer name
   - Add stations (specify POS iPad and optional CDS iPad for each)
   - Set quantities for peripherals (stands, cash drawers, card readers)
   - Review warnings if any

2. **Printers**
   - Set how many receipt printers needed
   - Set how many kitchen printers needed
   - Set how many label printers needed

3. **Printer Placement & Station Assignment**
   - For each printer, specify:
     - Physical location (front counter, kitchen, bar, etc.)
     - Which station controls it
     - Cable capability (can you run a visible LAN cable?)
     - Ethernet outlet availability (in-wall socket with built-in cabling)
     - Cable length needed (if applicable)
     - Distance from router (if WiFi)

4. **Infrastructure**
   - Select internet type (existing ISP or SIM card)
   - Specify router placement location
   - Answer ISP port availability (if applicable)
   - Select SIM provider (if applicable)

5. **Review & Submit**
   - Review complete order summary
   - Check auto-calculated network equipment
   - Note complexity level and estimated installation time
   - **Export via:**
     - "Copy to Clipboard" → Paste into your system
     - "Update on Notion DB" → Automatically create Notion page

**Step 4: Share with Operations**

Once exported, share the order with Waffle Operations team for hardware preparation.

### Tips for Efficient Use

- ✅ **Your progress auto-saves** - refresh the page and your data persists
- ✅ **Jump between steps** - click any step in the progress bar to navigate
- ✅ **Review warnings** - red alerts indicate configuration issues to fix
- ✅ **Use custom locations** - if predefined printer locations don't fit, select "Other" and type your own

---

## How It Works

### Workflow Overview

```
Customer Consultation
         ↓
   AM Gathers Info
         ↓
  Input to Provisioner (5 Steps)
         ↓
 Auto-Calculate Hardware
         ↓
   Review & Validate
         ↓
Export (Clipboard/Notion)
         ↓
 Operations Team Receives Order
         ↓
  Hardware Packing & Installation
```

### The 5-Step Process

1. **Stations & Peripherals** → Define checkout points and accessories
2. **Printers** → Set printer quantities by type
3. **Printer Placement** → Configure connectivity and station pairing
4. **Infrastructure** → Define network setup
5. **Review** → Validate and export

### Auto-Calculation Intelligence

The provisioner automatically determines:
- ✅ **Printer models** based on cable/WiFi constraints
- ✅ **Router type** based on internet source and range needs
- ✅ **Network switch** necessity based on port availability
- ✅ **Cable quantities** (5M and 10M ethernet cables)
- ✅ **Installation complexity** (LOW/MEDIUM/HIGH)
- ✅ **Estimated installation time** (1-2 hours)

---

## Core Concepts

### Stations

**What is a Station?**

A station represents a single **checkout point** in a restaurant or retail location where transactions occur.

**Configuration:**
- Each station has a unique number (Station 1, Station 2, etc.)
- Each station can have:
  - **POS iPad** (required for transactions)
  - **CDS iPad** (optional Customer Display System)

**Key Rules:**
- ⚠️ **CDS iPads require a paired POS iPad** - you cannot have a CDS without a POS
- Stations can share printers (configured in Printer Placement step)
- Peripherals are allocated to stations on-site by technicians

**Example:**
```
Station 1: POS iPad + CDS iPad
Station 2: POS iPad only
Station 3: POS iPad only
```

---

### Printers

**What are Printers?**

The provisioner supports **three types of printers** for different operational needs:

#### 1. Receipt Printers
- **Purpose**: Print customer transaction receipts
- **Typical Location**: Front counter, cashier station
- **Model Options**: TM-T82X (wired), M30-III (long-range WiFi)

#### 2. Kitchen Printers
- **Purpose**: Print orders to kitchen staff for food preparation
- **Typical Location**: Kitchen, prep area, bar
- **Model Options**: TM-T82X (wired), M30-III (long-range WiFi)

#### 3. Label Printers
- **Purpose**: Print item/product labels for packaging or inventory
- **Typical Location**: Packing area, prep station
- **Model**: ZD411 (Zebra brand, wired only)

**Configuration:**
- In Step 2, you simply set the **quantity** of each printer type
- In Step 3, you configure **placement and connectivity** for each individual printer

---

### Printer Placements

**What is Printer Placement?**

For each printer counted in Step 2, Step 3 requires detailed configuration of its **physical location** and **connectivity setup**.

#### Required Information Per Printer:

**1. Physical Location**
Where the printer will be physically installed.

**Predefined Options:**
- Front Counter
- Kitchen
- Bar
- Packing Area
- Cashier Station
- Prep Station
- Expo Line
- Drive-Thru Window
- Other (custom input)

**2. Station Pairing**
Which station (POS iPad) will control this printer? Printers are paired to stations so orders from that station route to the correct printer.

**3. Cable Capability**
*"Can we run a visible cable from our router to this printer?"*

- **Yes** → Wired connection preferred (more reliable)
- **No** → Check for ethernet outlet availability

**4. Cable Length (if can run visible cable)**
*"How long is the cable required?"*

- **1M** - Very short distance
- **3M** - Short distance
- **5M** - Medium distance
- **10M** - Long distance
- **Use WiFi Instead** - Prefer WiFi over running cable (automatically selects M30-III WiFi printer)

**5. Ethernet Outlet Availability (if cannot run visible cable)**
*"Is there an ethernet outlet (in-wall socket with built-in cabling) at this location?"*

- **Yes** → Ask for two cable lengths:
  - Cable length from router to ethernet outlet (1M, 3M, 5M)
  - Cable length from ethernet outlet to printer (1M, 3M, 5M)
- **No** → WiFi connection required, ask for distance from router

**6. Distance from Router** (for WiFi printers only)
*"How far is this printer from the router?"*

- **< 10M** → Standard WiFi router sufficient
- **> 10M** → Long-range WiFi router required

#### Connectivity Logic:

The provisioner determines printer connection type based on your answers:

| Can Run Cable? | Cable Length/WiFi Choice | Outlet Available? | Connection Type |
|---------------|-------------------------|------------------|-----------------|
| Yes | 1M, 3M, 5M, 10M | - | **LAN (cable length)M** |
| Yes | Use WiFi Instead | - | **WiFi (by choice)** |
| No | - | Yes | **LAN via Outlet** (with 2 cable segments) |
| No | - | No, < 10M | **WiFi** (standard router) |
| No | - | No, > 10M | **WiFi** (long-range router) |

---

### Peripherals

**What are Peripherals?**

Peripherals are **supporting hardware accessories** that attach to stations.

#### Types:

**1. POS Stands**
- iPad holders/mounts for checkout stations
- Typically one per station with a POS iPad

**2. Cash Drawers**
- Physical money storage units
- Connect to stations for cash transactions
- Typically one per station (with spares)

**3. Card Readers**
- Payment terminal devices for card transactions
- Must be paired with POS iPad stations
- **Not compatible with CDS-only stations**

#### Allocation:

- Operations team note: *"Account Managers will allocate peripherals to stations on-site during installation"*
- Provisioner tracks total quantities, not per-station assignment
- Spares are noted in the order (e.g., "3 assigned, 1 spare")

---

### Infrastructure

**What is Infrastructure?**

Infrastructure refers to the **network connectivity setup** at the customer location.

#### Key Questions:

**1. Internet Connection Type**

**Option 1: Customer Has Internet (ISP)**
- Customer has existing Internet Service Provider (e.g., Singtel, StarHub, M1)
- Waffle router connects to customer's ISP router
- More stable and preferred option

**Option 2: No Internet (SIM Card)**
- Customer has no internet connection
- Waffle provides SIM card-based cellular connectivity
- Backup option for locations without ISP

**2. Router Placement**
Physical location where Waffle router will be installed (e.g., "Back Office", "Under Counter", "Store Room")

**3. ISP Port Availability** (if customer has internet)
*"Does the customer's ISP router have at least 1 available LAN port for our use?"*

- **Yes** → Can connect directly to ISP router
- **No** → May need network switch to create additional ports

**4. SIM Provider** (if no internet)
Choose cellular provider for SIM card:

- **Singtel Heya** (Prepaid)
- **M1 Maxx** (Prepaid)
- **Starhub Prepaid** (⭐ Recommended)
- Other (custom input)

⚠️ **Important Note**: Some SIM providers may require physical SIM card size. Check router compatibility.

---

### Network Equipment (Auto-Calculated)

**What is Network Equipment?**

Based on your infrastructure and printer placement answers, the provisioner **automatically calculates** the required network hardware.

#### 1. Router Selection

The provisioner selects the optimal router model based on:
- Internet source (ISP vs SIM)
- Range requirements (standard vs long-range)

**Router Models:**

| Internet Source | Range Need | Router Model |
|----------------|------------|--------------|
| ISP | Standard | **ER605W Router** |
| ISP | Long-range | **ER706W Router** |
| SIM Card | Standard | **MR505 Router** |
| SIM Card | Long-range | **ER706W4G-V2 Router** |

**Long-range need** is determined by:
- Any WiFi printer with distance > 10M from router
- **Note:** Only WiFi printers with confirmed > 10M distance trigger long-range router selection

#### 2. Network Switch Recommendation

A **5-Port Network Switch** is recommended when:
- Customer ISP has no available ports AND multiple wired printers needed, OR
- Total wired devices exceed router's available LAN ports

**Why a Switch?**
- Expands available ethernet ports
- Allows multiple devices to connect when router ports are insufficient

#### 3. Cable Calculation

The provisioner counts required ethernet cables by length:

**1M, 3M, 5M, and 10M Cables:**
- Counts each cable length selected for direct router-to-printer connections
- Counts router-to-outlet cables when using ethernet outlets
- Counts outlet-to-printer cables when using ethernet outlets

**Example:**
- Printer 1: 5M cable from router = 1x 5M cable
- Printer 2: Router to outlet (3M) + Outlet to printer (1M) = 1x 3M cable + 1x 1M cable

**Not Counted:**
- WiFi printers (no cable needed)
- Built-in wall cabling (already installed)

---

### Complexity Level (Auto-Calculated)

**What is Complexity Level?**

An automatic assessment of **installation difficulty** to help operations team and technicians plan time and resources.

#### Complexity Levels:

**🟢 LOW Complexity** (Estimated Time: 1 hour)
- Few printers (typically ≤3)
- Mostly wireless setup
- Simple station configuration
- Minimal cabling required

**🟡 MEDIUM Complexity** (Estimated Time: 1.5 hours)
- Multiple wired printers (4-5 printers)
- Network switch installation needed
- Moderate cabling runs
- Standard station setup

**🔴 HIGH Complexity** (Estimated Time: 2 hours)
- Many printers (5+ printers)
- Label printers without cable capability
- Complex cabling requirements
- Multiple network devices
- Challenging router/printer placement

#### Factors Influencing Complexity:

✅ **Number of printers** (more printers = higher complexity)
✅ **Wired vs WiFi** (wired requires more installation work)
✅ **Label printers** (ZD411 requires reliable wired connection)
✅ **Network switch** (additional device to configure)
✅ **Cable runs** (longer cables = more installation effort)

---

## Business Logic & Provisioning Decisions

### Why Does the Provisioner Recommend Certain Hardware?

This section explains the **business reasoning** behind automatic recommendations.

### Printer Model Selection Logic

**Goal:** Choose the most reliable printer model based on connectivity constraints.

#### Receipt & Kitchen Printers:

**TM-T82X (Wired Model)**
- ✅ **When to use:** Cable can be run (≤10M) or ethernet outlet available
- ✅ **Why:** More reliable, faster printing, no WiFi interference issues
- ✅ **Best for:** High-traffic locations (front counter, kitchen)

**M30-III (WiFi Model)**
- ✅ **When to use:** Cable cannot be run OR distance >10M from router
- ✅ **Why:** Long-range WiFi capability, no cabling needed
- ✅ **Best for:** Remote locations, areas where cabling is impossible

#### Label Printers:

**ZD411 (Zebra, Wired Only)**
- ✅ **Only model** for label printing
- ✅ **Why wired-only:** Label printers require consistent, reliable connection for precise printing
- ⚠️ **Critical:** Always needs LAN connection (ethernet outlet or visible cable)

### Router Selection Logic

**Goal:** Provide sufficient network coverage while matching internet source.

#### Decision Tree:

**Customer Has Internet (ISP):**

1. **Check range needs:**
   - Any printer >10M requiring WiFi? → **ER706W** (long-range)
   - All printers within range? → **ER605W** (standard)

**Customer Has NO Internet (SIM Card):**

1. **Check range needs:**
   - Any printer >10M requiring WiFi? → **ER706W4G-V2** (long-range, SIM)
   - All printers within range? → **MR505** (standard, SIM)

**Why this matters:**
- Wrong router = poor WiFi coverage = printer failures
- Long-range routers cost more but prevent connectivity issues
- SIM-compatible routers ensure backup internet works

### Switch Recommendation Logic

**Goal:** Ensure enough network ports for all wired devices.

#### When is a Switch Recommended?

**Scenario 1: ISP Port Constraint**
- Customer ISP router has NO available ports
- AND we have wired printers requiring LAN
- → **Recommend 5-Port Switch** to expand connectivity

**Scenario 2: Port Overflow**
- Total wired devices > router's available LAN ports
- → **Recommend 5-Port Switch**

**Why:**
- Routers typically have 4-5 LAN ports
- ISP routers may have all ports occupied
- Switch provides 5 additional ports (minus 1 uplink to router = 4 usable)

### Complexity Scoring Logic

**Goal:** Accurately estimate installation time for technician planning.

#### Scoring Algorithm:

**Start with Base Complexity:** LOW

**Upgrade to MEDIUM if:**
- Total printers ≥ 4
- Network switch recommended
- 2+ wired printers requiring cable runs

**Upgrade to HIGH if:**
- Total printers ≥ 6
- Label printer with NO cable capability (requires special solutions)
- 4+ wired printers requiring cable runs
- Complex router placement + long cable runs

**Why:**
- Operations team needs accurate time estimates for scheduling
- Technicians need to know if they need extra equipment (ladders, cable management tools)
- High complexity jobs may require 2 technicians

### Cable Length Decision Logic

**Goal:** Use appropriate cable length to minimize waste and cost.

#### Selection Process:

**5M Cable:**
- Printer within 5 meters of router
- Short, direct cable run possible
- Less expensive, cleaner installation

**10M Cable:**
- Printer 5-10 meters from router
- Moderate cable run (across room, around obstacles)
- Standard installation

**WiFi (No Cable):**
- Printer >10M from router
- Cable run not feasible (across multiple rooms, floors)
- Saves on cable cost but requires strong WiFi coverage

**Why:**
- Buying 10M cables for 3M runs wastes money
- Using 5M cables for 8M runs won't reach
- WiFi for long distances avoids expensive 15-20M cable runs

---

## Technical Architecture

### Technology Stack

**Frontend:**
- **Framework:** Next.js 14.0.4 (React 18.2.0)
- **Language:** TypeScript 5.3.3
- **Styling:** Styled-JSX (built into Next.js)

**Backend:**
- **API Routes:** Next.js serverless functions
- **External Integration:** Notion API (@notionhq/client 2.2.15)

**Deployment:**
- **Platform:** Vercel
- **Environment:** Node.js runtime

### Project Structure

```
/Users/kai/Desktop/Hardware-Provisioner/
├── pages/
│   ├── api/
│   │   └── notion/
│   │       └── create-order.ts      # Notion API endpoint
│   ├── _app.tsx                     # Next.js app wrapper
│   └── index.tsx                    # Main provisioner UI (~1700 lines)
├── types/
│   └── provisioner.ts               # TypeScript interfaces
├── .env.example                     # Environment template
├── .env.local                       # Local secrets (gitignored)
├── next.config.js                   # Next.js config
├── tsconfig.json                    # TypeScript config
├── vercel.json                      # Vercel deployment config
├── package.json                     # Dependencies
└── README.md                        # Documentation
```

### State Management

**Primary State Object:**

```typescript
interface ProvisionerState {
  customerName: string;
  stations: Station[];
  peripherals: {
    stands: number;
    drawers: number;
    readers: number;
  };
  printers: {
    receipt: number;
    kitchen: number;
    label: number;
  };
  printersPlacement: PrinterPlacement[];
  infrastructure: {
    hasInternet: boolean;
    routerLocation: string;
    hasPort: boolean;
    simProvider: string;
    simProviderOther: string;
  };
}
```

**Persistence:**
- State saved to `localStorage` after every change
- Key: `provisionerState`
- Allows users to refresh browser and resume progress

**State Updates:**
- React `useState` hooks manage component state
- `useEffect` hooks sync state to localStorage
- Form inputs trigger state updates via event handlers

### Key Helper Functions

#### 1. `getPrinterModel(placement: PrinterPlacement, type: string): string`

**Purpose:** Determines optimal printer model based on connectivity.

**Logic:**
```typescript
if (type === 'label') return 'ZD411';

if (connection includes 'LAN') return 'TM-T82X';
if (connection === 'WiFi') return 'M30-III';
```

**Location:** [pages/index.tsx](pages/index.tsx)

---

#### 2. `getPrinterConnection(placement: PrinterPlacement): string`

**Purpose:** Generates connection specification string.

**Returns:**
- `"LAN (Ethernet Outlet)"` - Ethernet outlet available
- `"LAN 5M"` - 5M cable needed
- `"LAN 10M"` - 10M cable needed
- `"WiFi"` - Wireless connection

**Logic:**
```typescript
if (hasOutlet) return "LAN (Ethernet Outlet)";
if (canRunCable && cableLength === '5M') return "LAN 5M";
if (canRunCable && cableLength === '10M') return "LAN 10M";
return "WiFi";
```

**Location:** [pages/index.tsx](pages/index.tsx)

---

#### 3. `calculateNetworkEquipment(state: ProvisionerState): NetworkEquipment`

**Purpose:** Intelligently calculates required network hardware.

**Returns:**
```typescript
{
  router: string;           // Router model name
  switch: string;           // "5-Port Network Switch (Recommended)" or ""
  cables5M: number;         // Count of 5M cables
  cables10M: number;        // Count of 10M cables
}
```

**Logic Highlights:**
- Checks for long-range WiFi needs (>10M printers)
- Selects router based on ISP vs SIM + range
- Recommends switch if ISP has no ports or port overflow
- Counts cables by length from printer placements

**Location:** [pages/index.tsx](pages/index.tsx)

---

#### 4. `calculateComplexity(state: ProvisionerState, networkEquipment: NetworkEquipment): Object`

**Purpose:** Assesses installation difficulty.

**Returns:**
```typescript
{
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedTime: string;    // e.g., "1.5 hours"
}
```

**Factors:**
- Total printer count
- Wired printer count
- Label printer without cable capability (critical issue)
- Network switch requirement

**Location:** [pages/index.tsx](pages/index.tsx)

---

#### 5. `generateOrderText(state: ProvisionerState): string`

**Purpose:** Creates formatted text order for export.

**Output Format:**
```
Customer: [Name]

STATIONS:
- Station 1: POS iPad, CDS iPad
- Station 2: POS iPad

PERIPHERALS:
- POS Stands: 3 (2 assigned, 1 spare)
- Cash Drawers: 2
- Card Readers: 2

PRINTERS:
1. Receipt Printer - TM-T82X
   Location: Front Counter
   Connection: LAN 5M
   Paired to: Station 1

[... continues ...]

NETWORK EQUIPMENT:
- Router: ER605W
- Switch: 5-Port Network Switch (Recommended)
- Ethernet Cables (5M): 2
- Ethernet Cables (10M): 1

COMPLEXITY: MEDIUM (Estimated Time: 1.5 hours)
```

**Location:** [pages/index.tsx](pages/index.tsx)

---

#### 6. `updateNotionDatabase(state: ProvisionerState): Promise<void>`

**Purpose:** Sends order data to Notion API endpoint.

**Process:**
1. Generates order text
2. Calculates network equipment and complexity
3. POST request to `/api/notion/create-order`
4. Displays success message with Notion page URL
5. Handles errors gracefully

**Location:** [pages/index.tsx](pages/index.tsx)

---

### API Endpoint: `/api/notion/create-order`

**File:** [pages/api/notion/create-order.ts](pages/api/notion/create-order.ts)

**Method:** POST

**Request Body:**
```typescript
{
  customerName: string;
  totalStations: number;
  posIPads: number;
  cdsIPads: number;
  totalPrinters: number;
  posStands: number;
  cashDrawers: number;
  cardReaders: number;
  router: string;
  switch: string;
  complexity: string;
  estimatedTime: string;
  orderText: string;
}
```

**Process:**
1. Validates environment variables (`NOTION_API_KEY`, `NOTION_DATABASE_ID`)
2. Creates Notion client instance
3. Creates new page in database with properties
4. Adds order text as code block in page content
5. Returns Notion page URL on success

**Response:**
```typescript
// Success
{ success: true, url: "https://notion.so/..." }

// Error
{ success: false, error: "Error message" }
```

**Environment Variables Required:**
- `NOTION_API_KEY`: Notion integration token
- `NOTION_DATABASE_ID`: Target database ID

**Security:**
- Server-side only execution (credentials never exposed to client)
- Environment variables in `.env.local` (gitignored)

---

### Notion Database Schema

**Required Properties:**

| Property Name | Type | Values |
|--------------|------|--------|
| Customer Name | Title | Text |
| Total Stations | Number | Integer |
| POS iPads | Number | Integer |
| CDS iPads | Number | Integer |
| Total Printers | Number | Integer |
| POS Stands | Number | Integer |
| Cash Drawers | Number | Integer |
| Card Readers | Number | Integer |
| Router | Text/Rich Text | Router model name |
| Switch | Text/Rich Text | Switch info or empty |
| Complexity | Select | LOW, MEDIUM, HIGH |
| Estimated Time | Text | e.g., "1.5 hours" |

**Page Content:**
- Order text formatted as code block

---

### UI Components & Features

**1. Sticky Progress Bar**
- Shows current step (1-5)
- Clickable navigation to any step
- Visual indicator of progress

**2. Form Validation**
- Red warning alerts for invalid configurations
- Examples:
  - CDS iPad without paired POS iPad
  - Card readers without POS stations
  - Missing required fields

**3. Dynamic Form Sections**
- Questions appear/disappear based on previous answers
- Example: ISP port question only shows if customer has internet

**4. Button Groups**
- Toggle-style selection for yes/no questions
- Visual feedback for selected option

**5. Counter Controls**
- Increment/decrement buttons for quantities
- Prevents negative values

**6. Help Text & Notes**
- Contextual guidance throughout form
- Example: Explaining what an ethernet outlet is

**7. Card-Based Layout**
- Clean, organized visual hierarchy
- Grouped related inputs

**8. Toast Messages**
- Success notifications (order copied, Notion updated)
- Error messages (Notion submission failed)

---

## Outputs

### What Does the Provisioner Generate?

The provisioner creates a **formatted hardware order** that includes:

### 1. Customer Information
- Customer name
- Order timestamp (when exported)

### 2. Station Configuration
```
STATIONS:
- Station 1: POS iPad, CDS iPad
- Station 2: POS iPad
- Station 3: POS iPad
```

### 3. Peripheral Summary
```
PERIPHERALS:
- POS Stands: 4 (3 assigned, 1 spare)
- Cash Drawers: 3 (3 assigned, 0 spare)
- Card Readers: 3 (3 assigned, 0 spare)

Note: Account Managers will allocate peripherals to stations on-site.
```

### 4. Printer Details
For each printer:
```
1. Receipt Printer - TM-T82X
   Location: Front Counter
   Connection: LAN 5M
   Paired to: Station 1

2. Kitchen Printer - M30-III
   Location: Kitchen
   Connection: WiFi (>10M from router)
   Paired to: Station 2
```

### 5. Network Equipment
```
NETWORK EQUIPMENT:
- Router: ER605W Router
- Switch: 5-Port Network Switch (Recommended)
- Ethernet Cables (5M): 2
- Ethernet Cables (10M): 1
```

### 6. Installation Complexity
```
COMPLEXITY: MEDIUM (Estimated Time: 1.5 hours)
```

### 7. Important Notice
```
⚠️ Important: Please ensure that sufficient power points are available
at the customer's location for all hardware equipment (iPads, printers,
routers, switches, etc.).
```

This notice appears at the bottom of every review to remind AMs to verify power availability before finalizing orders.

### Export Options

**Option 1: Copy to Clipboard**
- Click "Copy to Clipboard" button
- Paste into email, chat, or ordering system
- Text format for easy sharing

**Option 2: Update on Notion DB**
- Click "Update on Notion DB" button
- Automatically creates new Notion page
- Structured database entry for tracking
- Returns Notion page URL for quick access

---

## Notion Integration

### Setup Requirements

**1. Create Notion Integration**
- Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
- Create new integration
- Copy "Internal Integration Token"

**2. Create Notion Database**
- Create new database in Notion
- Add required properties (see schema above)
- Share database with your integration

**3. Configure Environment Variables**

Create `.env.local` file:
```env
NOTION_API_KEY=secret_xxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Finding Database ID:**
- Open database in Notion
- URL format: `notion.so/workspace/DATABASE_ID?v=...`
- Copy the 32-character ID between workspace and `?v=`

### How It Works

**User Flow:**
1. User completes provisioner form
2. Clicks "Update on Notion DB"
3. Frontend calls `/api/notion/create-order`
4. Server creates Notion page
5. User receives success message with page URL

**Data Flow:**
```
Frontend (index.tsx)
    ↓ POST request
API Route (/api/notion/create-order.ts)
    ↓ Notion API call
Notion Database
    ↓ Page URL
Frontend (success message)
```

### Troubleshooting Notion Integration

**Error: "Missing Notion credentials"**
- Check `.env.local` file exists
- Verify `NOTION_API_KEY` and `NOTION_DATABASE_ID` are set
- Restart dev server after adding env variables

**Error: "Could not find database"**
- Verify database ID is correct
- Ensure database is shared with integration
- Check integration has "Insert content" permission

**Error: "Failed to create page"**
- Verify database properties match expected schema
- Check "Complexity" property is Select type with LOW/MEDIUM/HIGH options
- Ensure number properties accept integers

---

## Troubleshooting

### Common Issues & Solutions

#### Issue: I Want to Restart My Order

**Solution:**
- Navigate to **Step 5 (Review & Submit)**
- Click **"Start New Order"** button at the bottom
- This clears all data and returns you to Step 1
- ⚠️ Warning: All progress will be lost (cannot undo)

**Alternative:**
- Refresh the page and manually clear each step
- Or clear browser localStorage manually (for advanced users)

---

#### Issue: I Lost My Progress After Closing the Browser

**Solution:**
- The provisioner **auto-saves** to your browser's localStorage
- Open the provisioner again in the **same browser**
- Your data should automatically restore

**If data is still missing:**
- Check if you're using the same browser (Chrome vs Safari)
- Check if you're in Incognito/Private mode (doesn't save localStorage)
- Check if browser cookies/localStorage are enabled

---

#### Issue: I Can't Click "Next" Button

**Possible Causes & Solutions:**

**1. Validation Errors**
- Check for **red warning messages** on the current step
- Fix all warnings before proceeding
- Example: Remove CDS iPads if no POS iPad is paired

**2. Missing Required Fields**
- Ensure all required fields are filled
- Customer name must be entered in Step 1
- All printer placement questions must be answered in Step 3

**3. Browser Issue**
- Try refreshing the page (your data will persist)
- Try a different browser (Chrome, Safari, Firefox)

---

#### Issue: Warning "CDS iPad requires a POS iPad"

**Solution:**
- Each station with a CDS iPad must also have a POS iPad
- **Option 1:** Add a POS iPad to the station with CDS
- **Option 2:** Remove the CDS iPad from that station
- Stations can have:
  - ✅ POS only
  - ✅ POS + CDS
  - ❌ CDS only (not valid)

---

#### Issue: Notion Submission Failed

**Possible Causes & Solutions:**

**1. No Internet Connection**
- Check your internet connectivity
- Try again once connected

**2. Notion Integration Not Set Up**
- Verify `.env.local` file exists with credentials
- Contact developer/operations team for setup

**3. Notion Database Offline**
- Check if Notion is accessible
- Try accessing Notion database directly
- Contact Notion support if service is down

**Workaround:**
- Use **"Copy to Clipboard"** instead
- Manually paste order into Notion or other system

---

#### Issue: Printer Model Seems Wrong

**Check the Logic:**
- **Label printers** always use ZD411 (wired only)
- **Receipt/Kitchen printers:**
  - TM-T82X for wired connections (LAN)
  - M30-III for WiFi or >10M distance

**If model still seems incorrect:**
- Review your answers in Step 3 (Printer Placement)
- Check "Can we run a visible LAN cable?" answer
- Check cable length or distance from router
- Model selection is automatic based on these answers

---

#### Issue: Wrong Router Recommended

**Check the Logic:**
- Router depends on:
  - Internet type (ISP vs SIM)
  - Range needs (any printer >10M requiring WiFi)

**Verify Your Inputs:**
- Step 4: Did you select correct internet type?
- Step 3: Did you mark any printers as >10M from router?

**Expected Routers:**
- **ER605W**: ISP + standard range
- **ER706W**: ISP + long-range
- **MR505**: SIM + standard range
- **ER706W4G-V2**: SIM + long-range

---

#### Issue: Network Switch Not Recommended (But I Think I Need One)

**Check the Logic:**
- Switch is recommended when:
  - ISP has no available ports + wired printers needed
  - Total wired devices > router LAN ports

**Verify Your Inputs:**
- Step 4: Did you answer "No" to ISP port availability?
- Step 3: Do you have multiple wired printers (LAN connections)?

**Manual Override:**
- If you believe a switch is needed, manually add it to your order notes
- Discuss with operations team for non-standard setups

---

#### Issue: Order Text is Missing Information

**Solution:**
- Review each step for completeness
- Ensure all stations are configured
- Ensure all printer placements are filled out
- Check Step 5 summary matches your expectations

**If data is still missing:**
- Try clicking "Previous" and "Next" to refresh calculations
- Refresh browser and review Step 5 again
- Contact developer if issue persists

---

#### Issue: Page is Slow or Freezing

**Solutions:**
- **Close other browser tabs** (frees memory)
- **Refresh the page** (data will persist)
- **Clear browser cache** (may lose saved progress)
- **Try a different browser**
- **Check device resources** (CPU/memory usage)

---

#### Issue: Custom Printer Location Not Saving

**Solution:**
- When selecting "Other" for printer location
- Ensure you **type in the custom location** in the text field
- Field must not be empty
- Click outside the field or press Enter to confirm

---

## FAQ

### General Questions

#### Q: Can I save my progress and come back later?

**A:** Yes! The provisioner automatically saves your progress to your browser's localStorage. You can close the browser and return later - your data will still be there. Just make sure you use the **same browser** and are not in Incognito/Private mode.

---

#### Q: What happens if I refresh the page?

**A:** Your progress is saved automatically. Refreshing will reload your current state, and you can continue where you left off.

---

#### Q: Do I need to fill out all fields?

**A:** Yes, all required fields must be completed to proceed to the next step. Optional fields (like custom printer locations) can be left blank if using predefined options.

---

#### Q: Can I edit after submitting to Notion?

**A:** The provisioner does not currently support editing Notion entries. If you need to make changes:
- **Option 1:** Edit the Notion page directly in Notion
- **Option 2:** Create a new order with correct information and delete the old Notion page
- **Future feature:** Edit capability may be added in future versions

---

#### Q: What if the customer's setup doesn't fit the available options?

**A:**
- Use **"Other"** options where available (printer locations, SIM providers)
- Add custom notes in the order text after exporting
- Discuss non-standard setups with operations team
- Operations can manually adjust the order as needed

---

### Hardware & Provisioning Questions

#### Q: How do I know which router model to recommend?

**A:** The provisioner automatically selects the router based on:
- Customer's internet type (ISP vs SIM card)
- WiFi range requirements (based on printer distances)

You don't need to choose - it's calculated for you!

---

#### Q: What's the difference between an ethernet outlet and a visible cable?

**A:**
- **Ethernet outlet:** An in-wall socket (like a power outlet) with built-in ethernet cabling behind the wall. Looks professional, no visible cables.
- **Visible cable:** An ethernet cable you run visibly from router to printer (e.g., along walls, under carpet). Functional but visible.

If the location has an ethernet outlet, select "Yes" for outlet availability. If not, you'll need a visible cable.

---

#### Q: Why does the provisioner recommend WiFi for some printers and wired for others?

**A:**
- **Wired (LAN) is preferred** when possible: more reliable, faster, no interference
- **WiFi is used** when:
  - Cable cannot be run to that location
  - Distance is >10M (cable would be too long/expensive)
  - Customer doesn't want visible cables

The provisioner optimizes based on your answers about cable capability and distance.

---

#### Q: Can I order fewer peripherals than stations?

**A:** Yes! Peripherals are allocated on-site by installation technicians. You can order:
- Fewer cash drawers if some stations don't handle cash
- Fewer card readers if some stations are cash-only
- Fewer stands if some iPads will be handheld

The order will note "X assigned, Y spare" based on quantities.

---

#### Q: What if I need more than the listed printer locations?

**A:** Select **"Other"** from the location dropdown and type your custom location (e.g., "Outdoor Patio", "Second Floor Bar"). This gives you flexibility for unique setups.

---

#### Q: Why is my order marked as HIGH complexity?

**A:** HIGH complexity is assigned when:
- You have 6+ printers (more installation work)
- You have label printers without cable capability (requires special solutions)
- You have 4+ wired printers (extensive cabling)

This helps operations allocate sufficient time and resources for installation.

---

### Technical Questions

#### Q: What browsers are supported?

**A:** The provisioner works on all modern browsers:
- ✅ Chrome (recommended)
- ✅ Safari
- ✅ Firefox
- ✅ Edge

Ensure you're using a recent version for best performance.

---

#### Q: Does the provisioner work on mobile/tablet?

**A:** Yes, the interface is responsive and works on mobile devices. However, **desktop/laptop is recommended** for easier form filling and viewing the full summary.

---

#### Q: Why isn't my order appearing in Notion?

**A:** Check the following:
- Is your internet connection stable?
- Is the Notion integration properly configured? (contact operations/developer)
- Did you receive an error message? (share it with operations team)

**Workaround:** Use "Copy to Clipboard" and manually paste into Notion or your ordering system.

---

#### Q: Can I use this provisioner offline?

**A:**
- **Filling out the form:** Yes, the form works offline (localStorage)
- **Submitting to Notion:** No, requires internet connection
- **Copying to clipboard:** Yes, works offline

You can complete the form offline and submit when you reconnect.

---

### Workflow Questions

#### Q: Should I consult the customer before or after using the provisioner?

**A:** **Before!** The provisioner is designed for AMs to input information gathered from customer consultations. Talk to the customer about their layout, constraints, and needs first, then input that data into the provisioner.

---

#### Q: Who receives the order after I export?

**A:** The order goes to the **Waffle Operations Team** who will:
- Prepare the hardware for packing
- Plan the installation based on complexity
- Coordinate with installation technicians

If you use Notion export, operations team can track orders in the shared database.

---

#### Q: Can I modify the order after operations receives it?

**A:** Contact the operations team directly to request changes. Depending on timing, they may be able to adjust the order before packing/shipping. For Notion orders, you can also edit the Notion page directly.

---

#### Q: How long does it take operations to prepare the hardware?

**A:** This depends on hardware availability and order queue. Contact the operations team for current lead times. The complexity level you provide helps them plan accordingly.

---

#### Q: What if I realize I made a mistake after submitting?

**A:**
- **Option 1:** Create a new corrected order and notify operations to disregard the old one
- **Option 2:** Contact operations immediately with corrections
- **Option 3:** Edit the Notion page directly if using Notion export

Always communicate with operations about changes to avoid packing errors.

---

## Known Issues & Improvements Needed

### Version 3.9 - Pending Updates

#### 1. ISP Terminology Clarification

**Issue:** The question "Does the customer's ISP router have at least 1 available LAN port for our use?" assumes users know what ISP stands for.

**Planned Fix:** Add inline explanation or tooltip defining ISP (Internet Service Provider) for clarity.

**Current Workaround:** AMs can reference this documentation or ask operations team if unsure.

---

#### 2. Label Printer Connectivity Warning

**Issue:** When a label printer (ZD411) is configured without ethernet outlet availability or LAN cable capability, there is no warning to AMs about connectivity constraints.

**Planned Fix:** Add a prominent warning message in Step 3 when this scenario is detected:

> ⚠️ **Label Printer Connectivity Issue Detected**
>
> The ZD411 label printer requires a reliable wired (LAN) connection to function properly. Since no ethernet outlet or LAN cable connection is available at the selected location, please inform the customer of the following options:
>
> **Option 1:** Move the label printer closer to the Waffle router so a LAN cable can be connected
>
> **Option 2:** Move the Waffle router closer to the label printer location
>
> **Option 3:** If neither option is feasible, Waffle Operations will need to order an additional spare router configured in WiFi repeater mode to provide LAN connectivity to the label printer
>
> Please coordinate with the customer before finalizing this order.

**Current Workaround:** AMs should manually check label printer placements and consult with operations if WiFi-only setup is required.

---

## Limitations

### Current Constraints

#### 1. No Ordering Functionality

**Limitation:** The provisioner calculates and generates hardware orders but **does not place actual orders** with suppliers or inventory systems.

**Current Workflow:**
1. AM uses provisioner to generate order
2. AM exports order (clipboard or Notion)
3. AM/Operations manually orders hardware via separate platform

**Future Plan:** Integrate ordering functionality to streamline end-to-end process.

---

#### 2. Incomplete Hardware Catalog

**Limitation:** The provisioner does not yet include **all available hardware equipment** options.

**Missing Items (Examples):**
- Alternative router models
- Additional printer brands/models
- Specialty peripherals (e.g., barcode scanners, kitchen displays)
- Cabling accessories (cable management, wall mounts)

**Current Workaround:** AMs can manually add unlisted hardware to order notes or coordinate with operations for special equipment.

**Future Plan:** Expand hardware catalog as new equipment is standardized.

---

#### 3. Single-Location Orders Only

**Limitation:** The provisioner is designed for **one customer location per order**. Multi-location customers require separate orders.

**Current Workaround:** Create multiple orders (one per location) and note the relationship in order comments.

---

#### 4. No User Accounts / Order History

**Limitation:** The provisioner does not have user authentication or order history tracking.

**Impact:**
- Cannot view past orders within the tool
- Cannot track which AM created which order
- Relies on Notion database for order tracking

**Current Workaround:** Use Notion database to track orders and assign to AMs.

---

#### 5. No Real-Time Inventory Check

**Limitation:** The provisioner does not check real-time hardware inventory availability.

**Impact:**
- May recommend hardware that is out of stock
- Operations team must manually verify inventory before fulfilling order

**Current Workaround:** Operations team checks inventory upon receiving order and communicates back-order items to AMs.

---

## Future Features

### Planned Enhancements

> **Note:** This section will be populated as new features are planned and prioritized.

Currently, no specific future features have been defined beyond addressing the known issues listed above.

**Potential Ideas for Consideration:**
- Integration with ordering/inventory platform
- User authentication and order history
- Multi-location order support
- Real-time inventory checking
- Automated customer quote generation
- Installation scheduling integration
- Hardware compatibility checker
- Cost estimation calculator

---

## Version History

### v4.1 - December 2, 2025 (Current)

**Critical Bug Fix:**
- ✅ **Fixed router model swap:** Corrected router selection logic
  - ISP + long-range now correctly recommends **ER706W** (was incorrectly showing ER706W4G-V2)
  - SIM + long-range now correctly recommends **ER706W4G-V2** (was incorrectly showing ER706W)
- ✅ **Updated documentation:** All references to router models now reflect correct specifications
  - ER706W: LAN-only router for ISP connections
  - ER706W4G-V2: 4G/SIM-compatible router for cellular connections

**Impact:**
- Prevents ordering wrong router models for customer setups
- Ensures ISP customers get LAN routers and SIM customers get 4G-compatible routers
- Critical fix for hardware procurement accuracy

---

### v4.0 - December 2, 2025

**Major Changes:**
- ✅ **Updated question text:** "Can we run a visible cable from our router to this printer?"
- ✅ **New cable length options:** 1M, 3M, 5M, 10M, and "Use WiFi Instead"
- ✅ **WiFi printer selection:** "Use WiFi Instead" automatically selects M30-III WiFi printer
- ✅ **Ethernet outlet dual-cable setup:** When using ethernet outlets, now asks for two cable lengths:
  - Router to ethernet outlet (1M, 3M, 5M)
  - Ethernet outlet to printer (1M, 3M, 5M)
- ✅ **Fixed router selection logic:** Only selects long-range routers (ER706W/ER706W4G-V2) when WiFi printer distance is confirmed > 10M
- ✅ **Power points notice:** Added important notice on review page reminding AMs to verify power point availability
- ✅ **Improved cable counting:** Now counts all cable lengths (1M, 3M, 5M, 10M) including outlet cables

**Bug Fixes:**
- ✅ Router recommendation now correctly considers WiFi distance (previously selected long-range router unnecessarily)
- ✅ Cable counting now includes outlet segment cables

**Impact:**
- More accurate hardware provisioning
- Better cable inventory management
- Reduced over-specification of expensive long-range routers
- Clearer guidance for AMs on cable requirements

---

### v3.9 - December 1, 2025

**New Features:**
- ✅ Added Notion database integration via "Update on Notion DB" button
- ✅ Notion API endpoint for automated order page creation
- ✅ Environment variable configuration for secure Notion credentials

**Improvements:**
- ✅ Improved form question sequences for better user flow
- ✅ Enhanced UI button styling and interactions
- ✅ Better error handling for Notion submissions

**Documentation:**
- ✅ Created comprehensive `hardware-provisioner.md` documentation
- ✅ Added business logic explanations for provisioning decisions
- ✅ Added technical architecture section for developers
- ✅ Added troubleshooting and FAQ sections

---

### v3.8 - Prior Version

**Features:**
- Hardware provisioning wizard (5-step form)
- Automatic network equipment calculation
- Complexity level assessment
- Copy to clipboard export functionality
- localStorage state persistence

**Limitations:**
- No Notion integration (manual order tracking required)

---

## Contact & Support

**For Technical Issues:**
- Contact: Waffle Operations Team
- Developer: Kai (Operations Team)

**For Provisioning Questions:**
- Contact: Account Manager Team Lead
- Reference: This documentation

**For Feature Requests:**
- Submit to: Waffle Operations Team
- Include: Detailed use case and business justification

---

**Document Version:** 1.0
**Last Updated:** December 1, 2025
**Maintained By:** Waffle Operations Team
