# 🚀 Netlify + Railway Deployment Guide

## 📱 **Frontend: Deploy to Netlify**

### **Method 1: Drag & Drop (Fastest)**

1. **Go to**: [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. **Drag the `frontend/build` folder** directly onto the page
3. **Get your Netlify URL**: `https://your-app-name.netlify.app`

### **Method 2: Connect GitHub**

1. **Go to**: [https://app.netlify.com](https://app.netlify.com)
2. **Click "New site from Git"**
3. **Connect to GitHub** and select your repository
4. **Build settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
5. **Deploy!**

---

## 🚂 **Backend: Deploy to Railway**

### **Step 1: Create Railway Account**

1. **Go to**: [https://railway.app](https://railway.app)
2. **Sign up with GitHub**

### **Step 2: Deploy Backend**

1. **Click "New Project"**
2. **Select "Deploy from GitHub repo"**
3. **Choose your repository**: `vk2420/Delivery-Tracking-`
4. **Configure**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

### **Step 3: Add Environment Variables**

1. **Go to your Railway project**
2. **Click "Variables" tab**
3. **Add**:
   - `MONGODB_URI`: `mongodb+srv://delivery_portal:Bholenath%407@cluster0.yqkckxe.mongodb.net/delivery_portal?retryWrites=true&w=majority&appName=Cluster0`
   - `NODE_ENV`: `production`
   - `PORT`: `3001`

### **Step 4: Get Railway URL**

1. **Go to "Settings" → "Domains"**
2. **Copy your Railway URL**: `https://your-app.railway.app`

---

## 🔗 **Connect Frontend to Backend**

### **Update Netlify Environment Variables**

1. **Go to your Netlify site dashboard**
2. **Go to "Site settings" → "Environment variables"**
3. **Add**:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://your-railway-url.railway.app`

### **Update netlify.toml**

Replace the backend URL in `netlify.toml`:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-railway-url.railway.app/api/:splat"
  status = 200
```

---

## 🎯 **Final URLs**

- **Frontend**: `https://your-app.netlify.app`
- **Backend**: `https://your-app.railway.app`
- **Driver App**: `https://your-app.netlify.app/driver`
- **Dashboard**: `https://your-app.netlify.app/dashboard`

---

## ✅ **Benefits of This Setup**

- ✅ **Netlify**: Excellent for React apps, fast CDN, easy deployments
- ✅ **Railway**: Great for Node.js backends, automatic deployments
- ✅ **Both free tiers** are generous
- ✅ **Automatic deployments** from GitHub
- ✅ **Custom domains** available
- ✅ **SSL certificates** included

---

## 🚀 **Quick Start Commands**

```bash
# Build frontend for Netlify
cd frontend && npm run build

# Test backend locally
cd backend && npm start
```

**Ready to deploy!** 🎉
