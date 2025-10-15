const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Start WhatsApp Web in a separate process
console.log('🚀 Starting WhatsApp Web...');

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "delivery-portal-whatsapp"
  }),
  puppeteer: {
    headless: false,
    executablePath: process.platform === 'darwin' && process.arch === 'arm64' 
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  }
});

client.on('qr', (qr) => {
  console.log('📱 WhatsApp QR Code generated!');
  console.log('🔍 Scan this QR code with your WhatsApp mobile app:');
  qrcode.generate(qr, { small: true });
  console.log('📱 Open WhatsApp on your phone > Settings > Linked Devices > Link a Device');
});

client.on('ready', () => {
  console.log('✅ WhatsApp Web is ready!');
  console.log('🎯 You can now upload PDFs and send messages to customers!');
});

client.on('authenticated', () => {
  console.log('🔐 WhatsApp Web authenticated successfully!');
});

client.on('auth_failure', (msg) => {
  console.error('❌ WhatsApp Web authentication failed:', msg);
});

client.on('disconnected', (reason) => {
  console.log('⚠️ WhatsApp Web disconnected:', reason);
});

// Initialize WhatsApp Web
client.initialize().catch(error => {
  console.error('❌ Failed to initialize WhatsApp Web:', error);
});

