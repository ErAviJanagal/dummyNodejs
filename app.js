const express = require('express');
const bodyParser = require('body-parser'); // Import body-parser
const apiRoutes = require('./routes/api');
const path = require('path');
const crudController = require('./controllers/crudcontroller'); // Adjust the path as needed
const cookieParser = require('cookie-parser');
const multer = require('multer');

const { upload  } = require('./helper');

// const sequelize = require('../config/helpers.js'); // Make sure to configure your database connection
const publicPath = path.join(__dirname, 'public');
// console.log(publicPath)
const app = express();
app.use(cookieParser());

const PORT = 3000;
const session = require('express-session');
const flash = require('express-flash');
const crypto = require('crypto');
const authenticateToken = require('./middleware/authMiddleware');
THIS IS THE BUGGED COMMENT
const secretKey = process.env.SECRET_KEY;
// Middleware for session handling
app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true
}));
console.log('bugged push');
// Middleware for flash messages
app.use(flash());
app.set('view engine', 'ejs');
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

// Use body-parser middleware to handle JSON requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



app.get('/', function(_, res){
  res.sendFile(`${publicPath}/index.html`);
});

app.post('/register', crudController.register);
app.post('/login', crudController.login);
app.get('/signUp', crudController.signUp);
app.get('/signIn', crudController.signIn);
app.get('/logout', (req, res) => {
  // Clear the authentication token on the client side
  res.clearCookie('jwtToken');

  // Redirect to a logout success or home page
  res.redirect('/signIn');
});


app.get('/list',authenticateToken, crudController.list);
app.get('/users',authenticateToken, crudController.users);
app.post('/addUser', authenticateToken, upload.single('image'), crudController.addUser);
app.get('/editUser/:id', authenticateToken,crudController.editUser);
app.get('/deleteUser/:id',authenticateToken, crudController.deleteUser);
app.post('/updateUser/:id',authenticateToken, upload.single('image'), crudController.updateUser);

app.get('*', function(_, res){
  res.sendFile(`${publicPath}/404.html`);
});


app.use('/', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

console.log('bc');