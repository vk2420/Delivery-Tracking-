# 🚚 Delivery Portal - Real-time Tracking System

A comprehensive delivery tracking system with driver mobile app, built with React, Express, and MongoDB.

## 🚀 Features

- **Real-time Delivery Tracking**: Track deliveries from upload to completion
- **Driver Mobile App**: Drivers can update delivery status with comments
- **Dashboard Management**: Admin dashboard with filtering and remarks
- **PDF Parsing**: Automated trip sheet processing with multi-driver support
- **Cluster & Concept Filtering**: Organize deliveries by location and business unit
- **WhatsApp Integration**: Automated customer notifications (currently frozen)
- **MongoDB Integration**: Robust data storage and retrieval

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Dashboard**: Admin interface for managing deliveries
- **Driver App**: Mobile-friendly interface for drivers
- **Upload System**: Trip sheet processing and data management

### Backend (Express + Node.js)
- **API Routes**: RESTful endpoints for all operations
- **PDF Parser**: AI-powered trip sheet extraction
- **Database Models**: MongoDB schemas for data persistence
- **WhatsApp Integration**: Customer communication system

## 📱 Driver App Features

- **Login**: Employee number-based authentication
- **Delivery List**: View assigned deliveries
- **Status Updates**: Mark deliveries as delivered, not delivered, or postponed
- **Comments**: Add reasons for failed/postponed deliveries
- **Real-time Sync**: Updates reflect immediately in dashboard

## 🎯 Dashboard Features

- **Delivery Management**: View and manage all deliveries
- **Filtering**: By cluster, concept, driver, status
- **Remarks System**: Multi-user comment tracking
- **RTS Tracking**: Return to sender management
- **Statistics**: Real-time delivery metrics

## 🚀 Deployment

### Vercel (Recommended)
1. Upload entire project to Vercel
2. Set environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_ENV`: `production`
3. Deploy automatically

### Alternative Platforms
- **Railway**: Backend deployment
- **Netlify**: Frontend deployment
- **Render**: Full-stack deployment

## 📋 Environment Variables

```bash
MONGODB_URI=mongodb://localhost:27017/delivery_portal
NODE_ENV=production
REACT_APP_API_URL=https://your-backend-url.com
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Installation
```bash
# Install dependencies
npm install --prefix frontend
npm install --prefix backend

# Start development servers
npm run dev
```

### Project Structure
```
delivery-portal/
├── frontend/          # React application
├── backend/           # Express server
├── vercel.json        # Vercel configuration
├── package.json       # Root dependencies
└── README.md          # This file
```

## 📞 Support

For technical support or feature requests, please contact the development team.

---

**Built with ❤️ for efficient delivery management**