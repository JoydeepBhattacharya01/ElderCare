# 🍃 MongoDB Atlas Connection Guide

## Complete Setup for ElderCare App

### Step 1: MongoDB Atlas Account Setup

1. **Create Account**:
   - Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Click "Try Free" or "Sign Up"
   - Use your email: `subhosreebanerjeedms154@gmail.com`

2. **Create Organization & Project**:
   - Organization: "ElderCare"
   - Project: "ElderCare-Production"

### Step 2: Create Database Cluster

1. **Build Database**:
   - Click "Build a Database"
   - Choose **M0 Sandbox** (Free tier)
   - Provider: **AWS** (recommended)
   - Region: Choose closest to your users
   - Cluster Name: `Cluster0` (default)

2. **Security Setup**:
   - **Database User**: `subhosreebanerjeedms154`
   - **Password**: `subhosreebanerjeedms154`
   - **Privileges**: Read and write to any database

3. **Network Access**:
   - Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
   - This is needed for Render deployment

### Step 3: Get Connection String

Your connection string is already configured:
```
mongodb+srv://subhosreebanerjeedms154:subhosreebanerjeedms154@cluster0.jyx2lgy.mongodb.net/eldercare?retryWrites=true&w=majority&appName=Cluster0
```

**Connection String Breakdown**:
- **Protocol**: `mongodb+srv://`
- **Username**: `subhosreebanerjeedms154`
- **Password**: `subhosreebanerjeedms154`
- **Cluster**: `cluster0.jyx2lgy.mongodb.net`
- **Database**: `eldercare`
- **Options**: `retryWrites=true&w=majority&appName=Cluster0`

### Step 4: Update Your Local Configuration

1. **Update `backend/config.env`**:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://subhosreebanerjeedms154:subhosreebanerjeedms154@cluster0.jyx2lgy.mongodb.net/eldercare?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=eldercare_jwt_secret_key_2024
   GOOGLE_AI_API_KEY=AIzaSyDJpgN_dQOuxfpSKrQwca8IpYYjjpE2FyY
   NEWS_API_KEY=your_news_api_key_here
   ```

### Step 5: Test Connection Locally

1. **Start your app**:
   ```bash
   npm run dev
   ```

2. **Check console output**:
   ```
   Server running on port 5000
   MongoDB connected  ✅
   ```

3. **Test database operations**:
   - Register a new user
   - Add medications
   - Create tasks
   - Check if data persists

### Step 6: Database Structure

Your ElderCare app will create these collections automatically:

```
eldercare/
├── users           # User accounts and profiles
├── medications     # Medication schedules
├── tasks          # Daily tasks and reminders
├── healthlogs     # Health monitoring data
├── chats          # AI chat history (optional)
└── appointments   # Telemedicine appointments
```

### Step 7: MongoDB Atlas Dashboard

**Monitor Your Database**:
1. Go to MongoDB Atlas dashboard
2. Click on your cluster
3. **Collections**: View your data
4. **Metrics**: Monitor performance
5. **Logs**: Check connection logs

### Step 8: Security Best Practices

1. **Database User Permissions**:
   ```
   Current: Read and write to any database
   Recommended for Production: Limit to specific database
   ```

2. **Network Security**:
   ```
   Current: 0.0.0.0/0 (anywhere)
   For Production: Consider specific IP ranges
   ```

3. **Connection String Security**:
   - Never commit connection strings to Git
   - Use environment variables
   - Rotate passwords regularly

### Step 9: Troubleshooting Common Issues

#### Issue 1: Connection Timeout
```
MongoNetworkTimeoutError: connection timed out
```
**Solutions**:
- Check network access settings (0.0.0.0/0)
- Verify cluster is running
- Check firewall settings

#### Issue 2: Authentication Failed
```
MongoServerError: bad auth : authentication failed
```
**Solutions**:
- Verify username: `subhosreebanerjeedms154`
- Verify password: `subhosreebanerjeedms154`
- Check database user exists

#### Issue 3: Database Not Found
```
Database 'eldercare' not found
```
**Solution**:
- MongoDB creates database automatically on first write
- Register a user to create the database

#### Issue 4: SSL/TLS Errors
```
SSL/TLS connection error
```
**Solution**:
- Use `mongodb+srv://` (not `mongodb://`)
- Ensure Node.js version supports TLS 1.2+

### Step 10: Test Your Connection

**Quick Test Script** (run in your backend directory):
```javascript
// test-connection.js
const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully!');
    console.log('Database:', mongoose.connection.db.databaseName);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
```

Run test:
```bash
cd backend
node test-connection.js
```

### Step 11: Production Deployment

For Render deployment, your connection string is already configured in:
- `render.yaml`
- Environment variables section

### Step 12: Monitoring and Maintenance

1. **Atlas Monitoring**:
   - Database size and growth
   - Connection count
   - Query performance

2. **Backup Strategy**:
   - Atlas provides automatic backups
   - M0 tier: Limited backup retention
   - Consider upgrading for production

3. **Performance Optimization**:
   - Create indexes for frequently queried fields
   - Monitor slow queries
   - Optimize data models

### Connection Status Check

**Expected Console Output**:
```
Server running on port 5000
MongoDB connected
Google AI API error, using fallback: Request failed with status code 404
```

The MongoDB connection should work even if Google AI API shows errors.

### Database Collections Preview

After running your app, you should see:

**Users Collection**:
```json
{
  "_id": "ObjectId",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashed_password",
  "healthCondition": "Diabetes",
  "emergencyContact": "Jane Doe - 555-0123"
}
```

**Medications Collection**:
```json
{
  "_id": "ObjectId",
  "userId": "user_object_id",
  "name": "Metformin",
  "dosage": "500mg",
  "frequency": "twice daily",
  "times": ["08:00", "20:00"]
}
```

### Success Indicators

✅ **Connection Successful When**:
- Console shows "MongoDB connected"
- User registration works
- Data persists between app restarts
- Atlas dashboard shows connections

❌ **Connection Failed When**:
- Timeout errors
- Authentication failures
- Data doesn't persist
- No connections in Atlas dashboard

---

**Your MongoDB Atlas is now ready for ElderCare! 🎉**

**Next Steps**: Test locally, then deploy to Render with the same connection string.
