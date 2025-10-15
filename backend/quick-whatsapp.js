const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🚀 Starting WhatsApp Web...');

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "quick-whatsapp"
  }),
  puppeteer: {
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  }
});

client.on('qr', (qr) => {
  console.log('📱 SCAN THIS QR CODE WITH YOUR WHATSAPP:');
  console.log('📱 Open WhatsApp > Settings > Linked Devices > Link a Device');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp Web is ready!');
  console.log('✅ You can now send messages!');
});

client.on('authenticated', () => {
  console.log('✅ WhatsApp Web Authenticated!');
});

client.initialize();


