# 🗑️ How to Clear All Database Data

## ⚠️ WARNING
This will **permanently delete ALL data** from your MongoDB database including:
- All deliveries
- All drivers
- All customers
- All trip sheets

**This action CANNOT be undone!**

---

## 📊 Current Data Count
Based on the last check:
- **Deliveries:** 48
- **Drivers:** 4
- **Customers:** 45
- **TripSheets:** 4
- **TOTAL:** 101 documents

---

## 🔧 Option 1: Interactive Safe Delete (Recommended)

Run this command and follow the prompts:

```bash
cd backend
node scripts/clearAllDataSafe.js
```

You will be asked to:
1. Type `yes` to confirm
2. Type `DELETE ALL` to double confirm

---

## ⚡ Option 2: Direct Delete (No Confirmation)

**USE WITH CAUTION!** This deletes immediately without asking:

```bash
cd backend
node scripts/clearAllData.js
```

---

## 🌐 Option 3: Delete via MongoDB Atlas Dashboard

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in to your account
3. Navigate to your cluster (Cluster0)
4. Click "Browse Collections"
5. For each collection (deliveries, drivers, customers, tripsheets):
   - Click the collection name
   - Click "DELETE COLLECTION" button
   - Confirm deletion

---

## 📝 Step-by-Step Instructions (Recommended Method)

### Step 1: Open Terminal
```bash
cd /Users/vishalkhandelwal/Desktop/Real\ time\ tracking/backend
```

### Step 2: Run the Safe Delete Script
```bash
node scripts/clearAllDataSafe.js
```

### Step 3: Follow the Prompts
- When asked "Are you sure you want to delete ALL data?", type: `yes`
- When asked to confirm, type: `DELETE ALL`

### Step 4: Verify
You should see output like:
```
✅ Deleted 48 deliveries
✅ Deleted 4 drivers
✅ Deleted 45 customers
✅ Deleted 4 trip sheets
✨ Database cleared successfully!
```

---

## 🔄 After Clearing Data

Once data is cleared, you can:

1. **Upload new trip sheets** via the Upload page
2. **Create new drivers** (they'll be created automatically from trip sheets)
3. **Start fresh** with clean data

---

## 🆘 Need Help?

If you encounter any errors:
1. Make sure MongoDB is running
2. Check your `.env` file has correct `MONGODB_URI`
3. Ensure you're in the `backend` directory when running scripts

---

## 🛡️ Safety Tips

- **Backup First**: If you might need this data later, export it to Excel first from the Dashboard
- **Test Environment**: Consider clearing test data first to verify the process
- **No Undo**: Remember, there's no way to recover deleted data!

---

## 📋 Quick Command Reference

```bash
# Check current data count (without deleting)
cd backend
node -e "const mongoose = require('mongoose'); const config = require('./config'); mongoose.connect(config.MONGODB_URI).then(async () => { const db = mongoose.connection.db; const collections = await db.listCollections().toArray(); for (const col of collections) { const count = await db.collection(col.name).countDocuments(); console.log(col.name + ':', count); } process.exit(); });"

# Safe delete with confirmation
node scripts/clearAllDataSafe.js

# Direct delete (no confirmation)
node scripts/clearAllData.js
```

---

**Remember: Always be sure before running delete operations!** 🚨

