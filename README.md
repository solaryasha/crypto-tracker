\
# Crypto Tracker Next.js

This is a [Next.js](https://nextjs.org/) project designed to track cryptocurrency prices and display detailed information, leveraging real-time data updates from the CoinCap API.

## Overview

The application provides:
- A homepage displaying a list of top cryptocurrencies with near real-time price updates.
- Detailed pages for each cryptocurrency, showing metadata and live price information via Server-Sent Events (SSE).
- A responsive design for usability across different devices.
- Dark mode support.

## Getting Started

### Prerequisites

- Node.js (LTS version recommended, e.g., 18.x or 20.x)
- A package manager: npm, yarn, pnpm, or bun (the project uses npm by default in its scripts)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

To start the development server (with Turbopack for faster builds):

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The main application page can be found at `src/app/page.tsx`. This page auto-updates as you edit the file.

## Architecture & Approach

### Core Technologies
-   **Framework**: Next.js 15 (utilizing the App Router, Server Components, and Server-Side Rendering (SSR) for optimal performance and SEO).
-   **Language**: TypeScript (for type safety and improved developer experience).
-   **Styling**: TailwindCSS (a utility-first CSS framework for rapid UI development).
-   **State Management**: Redux Toolkit (for centralized and predictable application state management, particularly for handling cryptocurrency data, loading states, and real-time updates).
-   **API Integration**: CoinCap API v2 (as the primary source for cryptocurrency data).

### Real-Time Price Updates
The application implements two strategies for real-time price updates:
1.  **Coin Detail Page (`/coin/[id]`):** Uses Server-Sent Events (SSE). A dedicated backend API route (`src/app/api/prices/[id]/route.ts`) polls the CoinCap API every 30 seconds for the specific coin's price and streams these updates to the connected client.
2.  **Homepage Cryptocurrency List (`/`):** Employs client-side polling. The `CryptoList` component fetches price updates for the displayed assets directly from the CoinCap API every 3 seconds.

### Key Directory Structure
The project follows a standard Next.js App Router structure with some additions:
```
crypto-tracker/
├── public/              # Static assets
├── src/                 # Source code
│   ├── app/             # Next.js App Router: pages, layouts, API routes
│   │   ├── api/         # Backend API routes (e.g., for SSE)
│   │   ├── coin/[id]/   # Dynamic route for individual coin details
│   │   └── page.tsx     # Homepage
│   ├── components/      # Reusable React components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API client logic (e.g., coincapApi.ts)
│   ├── store/           # Redux Toolkit setup (store, slices, hooks)
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── eslint.config.mjs    # ESLint configuration
├── next.config.ts       # Next.js configuration
├── package.json         # Project dependencies and scripts
├── tailwind.config.ts   # TailwindCSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Assumptions & Trade-offs

-   **CoinCap API Reliability & Rate Limits:** The application assumes the CoinCap API is reliable and available. The polling intervals (3s for list, 30s for SSE backend) are chosen to balance data freshness with respect for potential API rate limits.
-   **Real-time Update Strategy:**
    *   The SSE approach for the detail page centralizes polling on the backend, reducing the number of direct client-to-CoinCap connections for a specific coin being viewed. However, the 30-second polling interval on the backend means price updates for the detail page can have a latency of up to 30 seconds plus processing time.
    *   Client-side polling for the homepage list provides more frequent updates (every 3 seconds) but results in more direct API calls from each client.
-   **State Management:** Redux Toolkit provides robust state management, which is beneficial for complex applications with shared state and asynchronous operations. This comes with some initial boilerplate and a learning curve compared to simpler state management solutions.
-   **Modern Browser Focus:** The application is built with modern web technologies and is best experienced on up-to-date web browsers. Support for older or legacy browsers may be limited.
-   **Development Tooling:** The `npm run dev` script utilizes `next dev --turbopack` for faster development builds. Turbopack is still in beta, so while it offers speed improvements, there might be occasional differences compared to the standard Next.js development server.
-   **Error Handling:** The application includes error handling for API requests and displays error messages or uses error boundaries. However, the sophistication of retry mechanisms or user feedback for all possible error scenarios might vary.

## Learn More (Next.js)

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
