const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'static')));
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'static'));
let loggedInUser = null;

const fakeDB = {
    users: [
        {
            id: 1,
            name: 'Ca map',
            email: 'email@gmail.com',
            password: 'password123',
            balance: 500,
        }
    ]
};


const requireLogin = (req, res, next) => {
    if (!loggedInUser) {
        return res.redirect('/login');
    }
    next();
};

app.get('/', requireLogin, (req, res) => {
    res.render('index', { user: loggedInUser });
});



app.get('/login', (req, res) => {
    if (loggedInUser) {
        return res.redirect('/');
    }
    res.render('login', { user: null, message: '' });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = fakeDB.users.find(u => u.email === email && u.password === password);
    if (user) {
        loggedInUser = user;
        res.redirect('/');
    } else {
        res.render('login', { user: null, message: 'User name chưa tồn tại trong hệ thống' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
