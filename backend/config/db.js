const dns = require('dns');
const mongoose = require('mongoose');

// Optional resolver override. Some Windows/VPN setups point Node's c-ares at a
// local stub that refuses SRV queries, which breaks mongodb+srv with:
// "querySrv ECONNREFUSED". Setting DNS_SERVERS in .env fixes it without
// touching the OS. Leave unset in environments with healthy DNS (e.g. Render).
if (process.env.DNS_SERVERS) {
  const servers = process.env.DNS_SERVERS.split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (servers.length > 0) {
    dns.setServers(servers);
    console.log(`DNS resolver override: ${servers.join(', ')}`);
  }
}

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error(
      'MONGO_URI is missing. Copy backend/.env.example to backend/.env and add your Atlas connection string.'
    );
  }

  mongoose.set('strictQuery', true);

  const conn = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    dbName: process.env.MONGO_DB_NAME || 'taskflow',
  });

  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  mongoose.connection.on('error', (error) => {
    console.error(`MongoDB connection error: ${error.message}`);
  });

  return conn;
};

module.exports = connectDB;
