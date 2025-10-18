# Vercel Deployment Setup Instructions

## 🚀 Initialize Admin Accounts on Vercel

After the deployment completes, you need to initialize the admin accounts in the production database.

### Step 1: Wait for Deployment
Wait 2-3 minutes for Vercel to deploy the latest changes.

### Step 2: Initialize Admins

Open your browser and navigate to:
```
https://delivery-tracking-blue.vercel.app/api/setup/init-admins
```

Or use this curl command:
```bash
curl -X POST https://delivery-tracking-blue.vercel.app/api/setup/init-admins
```

You should see a response like:
```json
{
  "success": true,
  "message": "Admin initialization complete",
  "results": [
    {
      "username": "admin_jeddah",
      "region": "Jeddah",
      "status": "created"
    },
    {
      "username": "admin_yanbu",
      "region": "Yanbu",
      "status": "created"
    },
    ...
  ]
}
```

### Step 3: Verify Admin Accounts

Check if admins were created successfully:
```
https://delivery-tracking-blue.vercel.app/api/setup/check-admins
```

You should see:
```json
{
  "success": true,
  "count": 5,
  "admins": [
    {
      "_id": "...",
      "username": "admin_jeddah",
      "region": "Jeddah",
      "role": "admin",
      "isActive": true
    },
    ...
  ]
}
```

### Step 4: Test Login

Now you can login at:
```
https://delivery-tracking-blue.vercel.app/login
```

Use any of these credentials:
- **Jeddah**: `admin_jeddah` / `jeddah123`
- **Yanbu**: `admin_yanbu` / `yanbu123`
- **Albaha**: `admin_albaha` / `albaha123`
- **Taif**: `admin_taif` / `taif123`
- **Madina**: `admin_madina` / `madina123`

---

## 🔒 Security Note

After initialization is complete, you may want to disable the setup endpoints by:
1. Removing the `/api/setup` route from `backend/server.js`
2. Redeploying to Vercel

This prevents unauthorized access to the setup endpoints.

---

## ✅ Checklist

- [ ] Wait for Vercel deployment to complete
- [ ] Call `/api/setup/init-admins` endpoint
- [ ] Verify with `/api/setup/check-admins`
- [ ] Test login with admin credentials
- [ ] (Optional) Remove setup endpoints and redeploy

---

## 🐛 Troubleshooting

### Error: 401 Unauthorized on Login
**Problem**: Admin accounts not initialized
**Solution**: Run the `/api/setup/init-admins` endpoint

### Error: 500 Internal Server Error
**Problem**: MongoDB connection issue
**Solution**: Check Vercel environment variables (`MONGODB_URI`)

### Error: Admin already exists
**Problem**: Admins already initialized
**Solution**: This is normal. Try logging in directly.

