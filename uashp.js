const express = require('express');
const bodyParser = require('body-parser');
const koneksi = require('./config/database');
const app = express();
const PORT = process.env.PORT || 5000;

const multer = require('multer')
const path = require('path')

var cors = require('cors');
app.use(cors({
    origin: '*'
}));

// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// script upload

app.use(express.static("./public"))
 //! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
}); // script untuk penggunaan multer saat upload
 
//=================== 17 maret 2023 == Penjelasan teori
 

// create data / insert data
app.post('/api/handphone',upload.single('image'),(req, res) => {


    const data = { ...req.body };
     const imei = req.body.imei;
    const brand = req.body.brand;
    const chipset = req.body.chipset;
    const ram = req.body.ram;
    const harga = req.body.harga;


    if (!req.file) {
        console.log("No file upload");
        const querySql = 'INSERT INTO handphone (imei,brand,chipset,ram,harga) values (?,?,?,?,?);';
         
        // jalankan query
        koneksi.query(querySql,[ imei,brand,chipset,ram,harga], (err, rows, field) => {
            // error handling
            if (err) {
                return res.status(500).json({ message: 'Gagal insert data!', error: err });
            }
       
            // jika request berhasil
            res.status(201).json({ success: true, message: 'Berhasil insert data!' });
        });
    } else {
        console.log(req.file.filename)
        var imgsrc = 'http://localhost:5000/images/' + req.file.filename;
        const foto =   imgsrc;
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySql = 'INSERT INTO handphone (imei,brand,foto,chipset,ram,harga) values (?,?,?,?,?,?);';
 
// jalankan query
koneksi.query(querySql,[ imei,brand,foto,chipset,ram,harga], (err, rows, field) => {
    // error handling
    if (err) {
        return res.status(500).json({ message: 'Gagal insert data!', error: err });
    }

    // jika request berhasil
    res.status(201).json({ success: true, message: 'Berhasil insert data!' });
});
}
});




// read data / get data
app.get('/api/handphone', (req, res) => {
    // buat query sql
    const querySql = 'SELECT * FROM handphone';

    // jalankan query
    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});


// update data
app.put('/api/handphone/:imei', (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySearch = 'SELECT * FROM handphone WHERE imei = ?';
    const imei = req.body.imei;
    const brand = req.body.brand;
    const chipset = req.body.chipset;
    const ram = req.body.ram;
    const harga = req.body.harga;

    const queryUpdate = 'UPDATE handphone SET brand=?,chipset=?,ram=?,harga=? WHERE imei = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.imei, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query update
            koneksi.query(queryUpdate, [brand,chipset,ram,harga, req.params.imei], (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika update berhasil
                res.status(200).json({ success: true, message: 'Berhasil update data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// delete data
app.delete('/api/handphone/:imei', (req, res) => {
    // buat query sql untuk mencari data dan hapus
    const querySearch = 'SELECT * FROM handphone WHERE imei = ?';
    const queryDelete = 'DELETE FROM handphone WHERE imei = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.imei, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query delete
            koneksi.query(queryDelete, req.params.imei, (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika delete berhasil
                res.status(200).json({ success: true, message: 'Berhasil hapus data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
