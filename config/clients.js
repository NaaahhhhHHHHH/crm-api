const fs = require('fs');
const ini = require('ini');
const path = require('path');

function loadClients() {
  const filePath = path.join(__dirname, 'clients.ini');

  if (!fs.existsSync(filePath)) {
    console.error('Missing clients.ini file in config/');
    return [];
  }

  const parsed = ini.parse(fs.readFileSync(filePath, 'utf-8'));
  
  const clients = Object.keys(parsed).map(key => ({
    client_id: parsed[key].client_id,
    client_secret: parsed[key].client_secret,
    redirect_uri: parsed[key].redirect_uri,
  }));

  console.log(`Loaded ${clients.length} OAuth clients`);
  return clients;
}

module.exports = { loadClients };
