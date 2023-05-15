const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const { db } = require('./model/dbConnection');  
const jwt = require('jsonwebtoken');


app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


// menampilkan data
app.get('/api/read_users', (req, res) => {
    const sqlQuery = "Select * from users";

    db.query(sqlQuery, (err, rows) => {
        if (err) {
            console.log(err);

        } else {
            res.send(rows);
            console.log(rows);
        }
    });
});

// menampilkan data berdasarkan id user
app.get('/api/read_user/:id', (req, res) => {
    const userId = req.params.id;

    const sqlQuery = "Select * from users where id = ?";

    db.query(sqlQuery, userId, (err,rows) => {
        if(err){
            console.log(err);
        } else {
            res.send(rows);
            console.log(rows);
        }
    });
});

// menambah data user
app.post('/api/create_user', (req,res) => {
    const email = req.body.email;
    const name = req.body.name;
    const role = req.body.role;
    const phone = req.body.phone;
    const address = req.body.address;
    const password = req.body.password;

    const sqlQuery = "insert into users (email, name, role, phone, address, password) values (?, ?, ?, ?,?, ?)";
    db.query(sqlQuery, [email, name, role, phone, address, password], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
            console.log(result);
        }
    });

} );

// update data user
app.put('/api/update_user', (req, res) => {
    const email = req.body.email;
    const id = req.body.id;
    const password = req.body.password;

    const sqlQuery = "update users set email = ?, password = ? where id = ?";
    db.query(sqlQuery, [email,password,id], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
            console.log(result);
        }
    });

});

//delete user
app.delete('/api/delete_user', (req, res) => {
    const userId = req.body.user_id;

    const sqlQuery = "delete from users where id = ?";
    db.query(sqlQuery, userId, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
            console.log(result);
        }
    })
});

//login auth
app.post('/api/login', (req, res) => {
    // const password = req.body.password;
    const email = req.body.email;
    const password = req.body.password;
    
    const sqlQuery = "select * from users where email = ? AND password = ?";

    db.query(sqlQuery, [email,password], (err,result) =>{
        if (err) {
            console.log(err);
        } else {
            if(result.length === 0) {
                res.send('email atau password salah')
            } else {
                const token = jwt.sign({ email } , 'my_secret_key');
                res.send([result, token]);
                console.log([result]);
            }
            
        }
    })
    

    // res.json({
    //     token: token,
    // })
});


app.get('/api/protected', ensureToken , (req, res) => {

    jwt.verify(req.token, 'my_secret_key', (err, data) => {
        if(err){
            res.sendStatus(403);
        } else {
            res.json({
                text: 'protected',
                data: data
            });
        }
    })

});

function ensureToken (req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}

app.listen(3001, () => {
    console.log('Server Berhasil Berjalan');
});
