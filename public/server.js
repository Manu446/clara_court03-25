const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const Database = require('better-sqlite3');

const app = express();
const dbFile = path.join(__dirname,'data','database.sqlite');
const db = new Database(dbFile);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/uploads', express.static(path.join(__dirname,'uploads')));
app.use('/', express.static(path.join(__dirname,'public')));

// File upload setup
if(!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');
const storage = multer.diskStorage({
  destination: (req,file,cb) => cb(null,'uploads/'),
  filename: (req,file,cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g,'_'))
});
const upload = multer({storage});

// API: listings
app.get('/api/listings', (req,res) => {
  const q = req.query.q || '';
  const city = req.query.city || '';
  let sql = 'SELECT * FROM listings WHERE 1=1';
  const params = {};
  if(q){ sql += ' AND (title LIKE @q OR description LIKE @q)'; params.q = `%${q}%`; }
  if(city){ sql += ' AND city = @city'; params.city = city; }
  const rows = db.prepare(sql).all(params);
  res.json(rows);
});

app.get('/api/listings/:id', (req,res)=>{
  const row = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
  if(!row) return res.status(404).json({error:'Not found'});
  res.json(row);
});

// Admin create listing (simple protection)
app.post('/api/admin/listings', upload.single('image'), (req,res)=>{
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  if(req.headers['x-admin-pass'] !== adminPass) return res.status(401).json({error:'Unauthorized'});
  const {title,description,price_per_night,city} = req.body;
  const image = req.file ? req.file.filename : null;
  const info = db.prepare('INSERT INTO listings (title,description,price_per_night,city,image_filename) VALUES (@title,@description,@price_per_night,@city,@image)').run({title,description,price_per_night,city,image});
  const created = db.prepare('SELECT * FROM listings WHERE id = ?').get(info.lastInsertRowid);
  res.json(created);
});

// Bookings
app.post('/api/bookings', (req,res)=>{
  const {listing_id, guest_name, guest_email, checkin, checkout} = req.body;
  // basic validation
  if(!listing_id || !guest_name || !guest_email || !checkin || !checkout) return res.status(400).json({error:'Missing fields'});
  const listing = db.prepare('SELECT price_per_night FROM listings WHERE id = ?').get(listing_id);
  if(!listing) return res.status(400).json({error:'Listing not found'});
  const days = Math.max(1, Math.ceil((new Date(checkout) - new Date(checkin))/(1000*60*60*24)));
  const total_price = days * listing.price_per_night;
  const info = db.prepare('INSERT INTO bookings (listing_id,guest_name,guest_email,checkin,checkout,total_price) VALUES (@listing_id,@guest_name,@guest_email,@checkin,@checkout,@total_price)').run({listing_id,guest_name,guest_email,checkin,checkout,total_price});
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(info.lastInsertRowid);
  res.json(booking);
});

app.listen(PORT, ()=> console.log('Server running on', PORT));
