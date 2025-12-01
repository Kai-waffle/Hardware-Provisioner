# Waffle Hardware Provisioner

A TypeScript-based provisioning tool for configuring POS stations, printers, and network equipment with Notion database integration.

## Features

- 📱 Configure POS and CDS iPads for multiple stations
- 🖨️ Manage receipt, kitchen, and label printers
- 🌐 Infrastructure setup (routers, switches, cabling)
- 📊 Automatic Notion database integration
- 🔒 Secure API key management via Vercel environment variables
- ⚡ Built with Next.js and TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Notion account with API access
- A Notion database set up for orders

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Hardware-Provisioner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Notion credentials:
   ```
   NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Setting Up Notion Integration

### Step 1: Create a Notion Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **"+ New integration"**
3. Give it a name (e.g., "Hardware Provisioner")
4. Select the workspace where your database will be
5. Click **"Submit"**
6. Copy the **"Internal Integration Token"** (this is your `NOTION_API_KEY`)

### Step 2: Create a Notion Database

1. In Notion, create a new database (full page)
2. Add the following properties to your database:

   | Property Name | Type |
   |--------------|------|
   | Customer Name | Title |
   | Total Stations | Number |
   | POS iPads | Number |
   | CDS iPads | Number |
   | Total Printers | Number |
   | POS Stands | Number |
   | Cash Drawers | Number |
   | Card Readers | Number |
   | Router | Text |
   | Switch | Text |
   | Complexity | Select (options: LOW, MEDIUM, HIGH) |
   | Estimated Time | Text |

3. Click **"Share"** in the top right
4. Click **"Invite"** and select your integration
5. Copy the database ID from the URL:
   ```
   https://notion.so/xxxxxxxxxxxxx?v=yyyyy
                     ^^^^^^^^^^^^^
                     This is your NOTION_DATABASE_ID
   ```

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Import Project"**
3. Select your GitHub repository
4. Configure your project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

### Step 3: Add Environment Variables in Vercel

1. In your Vercel project dashboard, go to **"Settings"** → **"Environment Variables"**
2. Add the following variables:
   - **Name:** `NOTION_API_KEY`
     - **Value:** Your Notion integration token
     - **Environments:** Production, Preview, Development

   - **Name:** `NOTION_DATABASE_ID`
     - **Value:** Your Notion database ID
     - **Environments:** Production, Preview, Development

3. Click **"Save"**

### Step 4: Redeploy

After adding environment variables, trigger a new deployment:
1. Go to **"Deployments"** tab
2. Click the **"..."** menu on the latest deployment
3. Select **"Redeploy"**

Your app will now be live at `https://your-project.vercel.app`!

## Project Structure

```
Hardware-Provisioner/
├── pages/
│   ├── api/
│   │   └── notion/
│   │       └── create-order.ts    # Notion API endpoint
│   ├── _app.tsx                   # Next.js app wrapper
│   └── index.tsx                  # Main provisioner page
├── types/
│   └── provisioner.ts             # TypeScript type definitions
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore rules
├── next.config.js                 # Next.js configuration
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # This file
```

## API Endpoints

### POST `/api/notion/create-order`

Creates a new order page in your Notion database.

**Request Body:**
```typescript
{
  customerName: string;
  stations: Station[];
  peripherals: Peripherals;
  printers: PrinterPlacement[];
  networkEquipment: NetworkEquipment;
  complexity: Complexity;
  orderText: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message?: string;
  pageUrl?: string;
  error?: string;
}
```

## Security

- ✅ API keys are stored securely in Vercel environment variables
- ✅ No credentials are exposed to the client
- ✅ All Notion API calls go through server-side API routes
- ✅ Environment variables are never committed to git

## Development

### Type Safety

This project uses TypeScript for full type safety. All state interfaces are defined in `types/provisioner.ts`.

### Adding New Features

1. Update types in `types/provisioner.ts` if needed
2. Modify the UI in `pages/index.tsx`
3. Update the API route in `pages/api/notion/create-order.ts` if database schema changes
4. Test locally with `npm run dev`

## Troubleshooting

### "Notion API credentials not configured"

Make sure you've added `NOTION_API_KEY` and `NOTION_DATABASE_ID` to your environment variables.

### "Failed to create order in Notion"

1. Verify your integration has access to the database (check Share settings)
2. Ensure database properties match the expected schema
3. Check Vercel logs for detailed error messages

### Local development not connecting to Notion

Make sure your `.env.local` file exists and contains valid credentials.

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
