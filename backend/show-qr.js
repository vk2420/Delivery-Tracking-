const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🚀 Starting WhatsApp Web to show QR code...');

const client = new Client({
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ],
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  }
});

client.on('qr', (qr) => {
  console.log('\n📱 SCAN THIS QR CODE WITH YOUR WHATSAPP:');
  console.log('==========================================');
  qrcode.generate(qr, { small: true });
  console.log('==========================================');
  console.log('📱 Open WhatsApp > Settings > Linked Devices > Link a Device');
  console.log('📱 Then scan the QR code above');
});

client.on('ready', () => {
  console.log('✅ WhatsApp Web is ready! You can now send messages.');
  process.exit(0);
});

client.on('authenticated', () => {
  console.log('✅ WhatsApp Web authenticated successfully!');
});

client.initialize();








