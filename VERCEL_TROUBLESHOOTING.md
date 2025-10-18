# Vercel Deployment Troubleshooting Guide

## 🔍 **Issue: Multiple Vercel Deployments**

You currently have **multiple Vercel deployment URLs**:

1. `delivery-tracking-blue.vercel.app` ✅ (Working - admins initialized)
2. `delivery-tracking-2cyuxgyfo.vercel.app` ⚠️ (Needs admin init)
3. `delivery-tracking-p58epv3x2.vercel.app` ⚠️ (New deployment)

---

## ✅ **Solution: Use ONE Primary Deployment**

### **Step 1: Choose Your Primary URL**

**Recommended:** `delivery-tracking-blue.vercel.app` (already working)

### **Step 2: Set It As Production Domain**

1. Go to **Vercel Dashboard**: https://vercel.com/
2. Select your project: **Delivery-Tracking-**
3. Go to **Settings** → **Domains**
4. Set `delivery-tracking-blue.vercel.app` as **Production Domain**
5. **Delete** or **disable** the other preview deployments

---

## 🔧 **How to Fix Current Issues**

### **For the Working URL (delivery-tracking-blue.vercel.app):**

✅ **Already working!**
- Admin accounts initialized
- Login working
- All features functional

**Just use this URL**: https://delivery-tracking-blue.vercel.app/login

---

### **For Other URLs (if you want to use them):**

After the latest deployment completes:

1. **Initialize admins** for each URL:
   ```bash
   curl -X POST https://[YOUR-URL]/api/setup/init-admins
   ```

2. **Verify it worked**:
   ```bash
   curl https://[YOUR-URL]/api/setup/check-admins
   ```

3. **Test login**:
   - Go to: `https://[YOUR-URL]/login`
   - Use: `admin_jeddah` / `jeddah123`

---

## 🎯 **Recommended Action Plan**

### **Option 1: Stick with Working URL (Easiest)**

1. Bookmark: `https://delivery-tracking-blue.vercel.app/`
2. Share this URL with your team
3. **Done!** Everything is already working there.

### **Option 2: Use Latest Deployment**

1. Wait 3-5 minutes for deployment to complete
2. Check: `https://delivery-tracking-p58epv3x2.vercel.app/api/health`
3. If you see `"mongodb":"Connected"`, proceed to step 4
4. Initialize admins:
   ```bash
   curl -X POST https://delivery-tracking-p58epv3x2.vercel.app/api/setup/init-admins
   ```
5. Test login at: `https://delivery-tracking-p58epv3x2.vercel.app/login`

### **Option 3: Clean Up Deployments (Best Practice)**

1. Go to Vercel Dashboard
2. Keep only ONE production deployment
3. Delete preview/branch deployments
4. Set a custom domain (optional but professional)

---

## 🐛 **Common Errors & Solutions**

### **Error: "GET / 404 (Not Found)"**

**Cause:** Frontend build not deploying correctly

**Solution:**
1. Check Vercel build logs
2. Ensure `vercel.json` is correct (already fixed in latest push)
3. Wait for deployment to complete
4. Clear browser cache

### **Error: "401 Unauthorized" on Login**

**Cause:** Admin accounts not initialized

**Solution:**
```bash
curl -X POST https://[YOUR-URL]/api/setup/init-admins
```

### **Error: "Route not found"**

**Cause:** Deployment still in progress

**Solution:** Wait 2-3 minutes and try again

---

## 📊 **How to Check Deployment Status**

### **Method 1: Vercel Dashboard**
1. Go to: https://vercel.com/
2. Click on your project
3. Check **Deployments** tab
4. Look for "Ready" status

### **Method 2: Health Check API**
```bash
curl https://[YOUR-URL]/api/health
```

**Should return:**
```json
{
  "success": true,
  "message": "Delivery Portal API is running",
  "environment": "Vercel",
  "mongodb": "Connected"
}
```

---

## 🎯 **Quick Start (Right Now)**

**If you want to use it immediately:**

1. **Go to**: https://delivery-tracking-blue.vercel.app/login
2. **Login with**: `admin_jeddah` / `jeddah123`
3. **Start working!**

**If you want to wait for the latest deployment:**

1. Wait 3-5 minutes
2. Check: `https://delivery-tracking-p58epv3x2.vercel.app/`
3. If working, initialize admins
4. Then login

---

## 🔒 **Security Recommendations**

After everything is working:

1. **Remove setup endpoints** (optional):
   - Comment out `app.use('/api/setup', setupRoutes);` in `backend/server.js`
   - Redeploy

2. **Change admin passwords**:
   - Create a password change endpoint
   - Or update passwords directly in MongoDB

3. **Set up custom domain**:
   - More professional than `*.vercel.app`
   - Better for production use

---

## 📝 **Summary**

**Current Working URL:**
```
https://delivery-tracking-blue.vercel.app/
```

**Login Credentials:**
| Region | Username | Password |
|--------|----------|----------|
| Jeddah | admin_jeddah | jeddah123 |
| Yanbu | admin_yanbu | yanbu123 |
| Albaha | admin_albaha | albaha123 |
| Taif | admin_taif | taif123 |
| Madina | admin_madina | madina123 |

**Status:** ✅ Fully Operational

---

## 🆘 **Still Having Issues?**

1. Check Vercel deployment logs
2. Verify MongoDB connection in environment variables
3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
4. Try incognito/private browsing mode
5. Check browser console for errors (F12)

