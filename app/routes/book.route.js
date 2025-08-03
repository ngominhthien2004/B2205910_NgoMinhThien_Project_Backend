const express = require('express');
const books = require('../controllers/book.controller');

const router = express.Router();

router.route('/')
    .get(books.getAllBook) // lấy tất cả sách
    .post(books.create)
    .delete(books.deleteAll);

router.route('/available')
    .get(books.getAvailableBook); // lấy sách còn availableCopies > 0


router.route('/title')
    .get(books.findByTitle); // tìm kiếm sách theo tiêu đề
    
router.route('/:id')
    .get(books.findOne)
    .put(books.update)
    .delete(books.delete);



module.exports = router;