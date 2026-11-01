const fs = require('fs');

let server = fs.readFileSync('backend/server.js', 'utf8').replace(/\r\n/g, '\n');

if (!server.includes('/api/enterprise')) {
  server = server.replace(
    "app.use('/api/tickets', require('./routes/ticketRoutes'));",
    "app.use('/api/tickets', require('./routes/ticketRoutes'));\napp.use('/api/enterprise', require('./routes/enterpriseRoutes'));"
  );
  fs.writeFileSync('backend/server.js', server, 'utf8');
  console.log('Registered /api/enterprise in backend/server.js');
}
