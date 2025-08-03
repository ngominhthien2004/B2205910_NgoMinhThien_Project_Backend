const { ObjectId } = require('mongodb');

class BookService {
    constructor(client) {
        this.Book = client.db().collection('books');
    }

    extractBookData(payload) {
        const book = {
            idBook: payload.idBook,
            title: payload.title,
            description: payload.description,
            category: payload.category,
            price: payload.price,
            totalCopies: payload.totalCopies, // tổng số sách
            availableCopies: payload.availableCopies, // số sách còn lại để cho mượn
            releaseDate: payload.releaseDate ? new Date(payload.releaseDate) : undefined,
            publisher: payload.publisher,
            author: payload.author,
        };
        
        Object.keys(book).forEach(
            (key) => book[key] === undefined && delete book[key]
        );
        return book;
    }

    async create(payload) {
        const book = this.extractBookData(payload);
        const result = await this.Book.insertOne(book);
        // Trả về document vừa tạo (có _id)
        return result.insertedId ? { ...book, _id: result.insertedId } : null;
    }

    async find(filter) {
        const cursor = await this.Book.find(filter);
        return await cursor.toArray();
    }

    async findByTitle(title) {
        return await this.find({
            title: { $regex: new RegExp(title), $options: 'i' }
        });
    }

    async findById(id) {
        return await this.Book.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null
        });
    }

    async findByIdBook(idBook) {
        return await this.Book.findOne({ idBook: idBook });
    }

    async update(id, payload) {
        const filter = { 
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null 
        };
        const update = this.extractBookData(payload);
        const result = await this.Book.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        // Trả về document sau khi cập nhật
        return result.value;
    }

    async delete(id) {
        const result = await this.Book.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null
        });
        // Trả về document đã xóa
        return result;
    }

    async deleteAll() {
        const result = await this.Book.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = BookService;