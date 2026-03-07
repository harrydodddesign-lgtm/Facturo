# Facturo - Invoicing App Walkthrough

I have successfully built **Facturo**, a browser-based invoicing application for freelancers in Spain. The app features a minimalist, Apple-like design and full integration with Supabase for authentication and data storage.

## Demo

I have started the application and recorded a quick tour of the landing page and login screen.

![Facturo Demo](file:///Users/harrydodd/.gemini/antigravity/brain/a9df552c-bf73-483b-8a66-a4fe4a4a0dc0/facturo_demo_landing_1763669196540.webp)

> [!NOTE]
> To log in and use the full features (creating clients, invoices, etc.), you must connect your own Supabase database as described in the Setup Instructions.

## Features Implemented

### 1. Authentication & User Management
- **Supabase Auth**: Secure login and signup flows.
- **Protected Routes**: Middleware ensures only authenticated users can access the app.
- **User Isolation**: Row Level Security (RLS) policies ensure users only see their own data.

### 2. Core Invoicing Features
- **Clients**: Manage client details (Name, Address, Tax ID, Currency).
- **Templates**: Create reusable invoice templates with customizable layouts.
- **Invoices**:
    - Automatic numbering (`INV-YYYY-CLIENT-SEQ`).
    - Multi-currency support (Internal EUR, Client Currency).
    - Spanish Tax Handling (IVA, IRPF calculations).
    - Line item management.
- **PDF Export**: Generate professional PDF invoices directly from the browser.

### 3. Design System
- **Apple-like UI**: Clean, greyscale aesthetic with ample whitespace and refined typography.
- **Responsive**: Works on desktop and mobile.
- **Components**: Reusable UI components (Cards, Tables, Forms) built with Tailwind CSS.

## Setup Instructions

To run the application locally, follow these steps:

1.  **Supabase Setup**:
    - Create a new project at [database.new](https://database.new).
    - Go to the SQL Editor and run the contents of `supabase/schema.sql`.
    - Get your Project URL and Anon Key from Project Settings > API.

2.  **Environment Variables**:
    - Open `.env.local` in the project root.
    - Replace the placeholder values with your actual Supabase credentials:
      ```bash
      NEXT_PUBLIC_SUPABASE_URL=your-project-url
      NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
      ```

3.  **Run the App**:
    ```bash
    npm run dev
    ```
    - Open [http://localhost:3000](http://localhost:3000) in your browser.

## Verification

I have verified the application by running a full production build (`npm run build`), which passed successfully. This ensures:
- All TypeScript types are correct.
- All pages and components compile without errors.
- Static generation works as expected.

## Next Steps

- **Deploy**: Deploy the app to Vercel or another hosting provider.
- **Payments**: Integrate Stripe or another payment provider.
- **Multi-user**: Expand the schema for team features if needed.

Enjoy using Facturo!
