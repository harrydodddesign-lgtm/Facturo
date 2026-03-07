# Supabase Database Setup Guide

This guide will help you set up your Supabase database for the Facturo application in **less than 10 minutes**.

## 📋 Prerequisites

- A Supabase account (free tier is fine)
- Your Facturo app running locally

## 🚀 Step-by-Step Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `Facturo` (or any name you prefer)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to initialize

### Step 2: Get Your API Credentials

1. In your Supabase project, click **Settings** (gear icon) in sidebar
2. Click **API** in the settings menu
3. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 3: Add Credentials to Your App

1. In your Facturo project, create or edit `.env.local` file:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. Replace the values with your actual credentials from Step 2

### Step 4: Run Database Migration

1. In Supabase dashboard, click **SQL Editor** in the sidebar
2. Click **"New Query"**
3. Open the file `supabase-migration.sql` in your project
4. Copy **all the SQL content**
5. Paste into Supabase SQL Editor
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. You should see: ✅ Success. No rows returned

### Step 5: Verify Tables Created

1. Click **Table Editor** in Supabase sidebar
2. You should see 4 tables:
   - `clients`
   - `settings`
   - `templates`
   - `invoices`
3. Click each table to verify structure

### Step 6: Test Your App

1. **Restart your Next.js dev server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Remove demo mode cookie**:
   - Open browser DevTools (F12)
   - Go to **Application** → **Cookies** → `http://localhost:3000`
   - Delete the `demo_mode` cookie (if it exists)

3. **Create a new account**:
   - Navigate to `http://localhost:3000/signup`
   - Create an account with your email
   - Check your email for verification (or use magic link)
   - Log in

4. **Test functionality**:
   - Create a new client
   - Create an invoice
   - Go to Supabase → Table Editor → `clients` to see your data!

## ✅ What Was Created

### Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| **clients** | Store client information | Name, contact, address, currency preference |
| **settings** | User invoice settings | Invoice prefix, default IVA/IRPF, accountant mode |
| **templates** | Invoice templates | Layout preferences, field visibility |
| **invoices** | Invoice data | Line items, totals, status, payment tracking |

### Security Features

- ✅ **Row Level Security (RLS)** enabled on all tables
- ✅ Users can only see/edit their own data
- ✅ Automatic `user_id` enforcement
- ✅ Cascading deletes (if user deleted, their data is too)

### Automatic Features

- ✅ **Auto-updating timestamps** - `updated_at` updates automatically
- ✅ **UUID primary keys** - Unique IDs for all records
- ✅ **Indexes** - Fast queries on common lookups
- ✅ **Constraints** - Data validation (status, layout types)

## 🔧 Troubleshooting

### Issue: "Invalid credentials"
**Solution**: Check that your `.env.local` values match Supabase dashboard exactly. Restart dev server after changing.

### Issue: "Row Level Security policy violation"
**Solution**: Make sure you're logged in. RLS policies require authentication.

### Issue: "Table already exists"
**Solution**: The migration is idempotent (safe to run multiple times). It will skip existing tables.

### Issue: No data showing in app
**Solution**: 
1. Verify you're logged in (not demo mode)
2. Check browser console for errors
3. Verify `.env.local` is in project root
4. Restart dev server

### Issue: Email verification required
**Solution**: 
- Check your email spam folder
- Or in Supabase: Authentication → Settings → disable "Email Confirmations"

## 📊 Database Schema Diagram

```
auth.users (Supabase managed)
    ↓
    ├── clients (client_code, name, preferred_currency)
    │
    ├── settings (invoice_prefix, default_iva, default_irpf)
    │
    ├── templates (layout, fields)
    │
    └── invoices
        ├── → clients (FK: client_id)
        ├── → templates (FK: template_id)
        └── Fields: status, line_items, totals, payment info
```

## 🎯 Next Steps After Setup

1. **Customize settings** - Go to Settings page and configure defaults
2. **Create invoice template** - Set up your preferred template
3. **Add clients** - Import or create your clients
4. **Test invoicing workflow** - Create an invoice end-to-end
5. **Test PDF export** - Verify PDFs generate correctly

## 🔐 Security Best Practices

- ✅ Never commit `.env.local` to git (already in `.gitignore`)
- ✅ Use environment variables for production
- ✅ Enable 2FA on your Supabase account
- ✅ Regularly backup your database (Supabase → Database → Backups)
- ✅ Review RLS policies before production

## 💡 Optional Enhancements

### Add Storage for Logos/Attachments

Uncomment the storage section in `supabase-migration.sql` to enable file uploads.

### Add Email Notifications

Configure Supabase Edge Functions to send email notifications when invoices are created/paid.

### Add Backup Automation

Set up daily backups in Supabase dashboard under Database → Backups.

---

## 📞 Need Help?

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Ensure dev server was restarted after adding credentials

**Your database is now production-ready!** 🎉
