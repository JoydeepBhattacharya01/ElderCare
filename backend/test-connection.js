const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

console.log('🔍 Testing MongoDB Atlas Connection...\n');

const connectionString = process.env.MONGODB_URI;
console.log('Connection String:', connectionString ? 'Found ✅' : 'Missing ❌');

if (!connectionString) {
  console.error('❌ MONGODB_URI not found in config.env');
  process.exit(1);
}

mongoose.connect(connectionString)
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Ready State:', mongoose.connection.readyState);
    
    console.log('\n🎉 Your ElderCare app can now connect to MongoDB Atlas!');
    console.log('💡 You can now run: npm run dev');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB Atlas connection failed:');
    console.error('Error:', err.message);
    
    if (err.message.includes('authentication failed')) {
      console.log('\n🔧 Fix: Check username and password in connection string');
    } else if (err.message.includes('timeout')) {
      console.log('\n🔧 Fix: Check network access settings in MongoDB Atlas');
      console.log('   - Allow access from anywhere (0.0.0.0/0)');
    } else if (err.message.includes('ENOTFOUND')) {
      console.log('\n🔧 Fix: Check cluster URL in connection string');
    }
    
    process.exit(1);
  });

setTimeout(() => {
  console.log('⏰ Connection test timeout after 10 seconds');
  process.exit(1);
}, 10000);
