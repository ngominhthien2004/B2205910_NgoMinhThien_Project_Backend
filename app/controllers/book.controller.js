const BookService = require("../services/book.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
    if (!req.body?.title) {
        return next(new ApiError(400, "Title can not be empty"));
    }

    try {
        const bookService = new BookService(MongoDB.client);
        const document = await bookService.create(req.body);
        return res.send({
            message: "Book was created successfully",
            data: document
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the book")
        );
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const bookService = new BookService(MongoDB.client);
        const {title} = req.query;
        if (title) {
            documents = await bookService.findByTitle(title);
        } else {
            documents = await bookService.find({});
        } 
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving books")
        );
    }

    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const bookService = new BookService(MongoDB.client);
        let document;
        if (req.params.id.length === 24 && /^[a-fA-F0-9]+$/.test(req.params.id)) {
            document = await bookService.findById(req.params.id);
        } else {
            document = await bookService.findByIdBook(req.params.id);
        }
        if (!document) {
            return next(new ApiError(404, "Book not found"));
        }
        return res.send(document);
    } catch (error) {
        console.error(error); // Thêm dòng này để debug lỗi thực tế
        return next(
            new ApiError(
                500, 
                `Error retrieving book with id=${req.params.id}`
            )
        );
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }

    try {
        const bookService = new BookService(MongoDB.client);
        const document = await bookService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Book not found"));
        }
        return res.send({ message: "Book was updated successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Error updating book with id=${req.params.id}`)
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const bookService = new BookService(MongoDB.client);
        const document = await bookService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Book not found"));
        }
        return res.send({ message: "Book was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(
                500, 
                `Could not delete book with id=${req.params.id}`)
        );
    }
};

exports.deleteAll = async (_req, res, next) => {
    try {
        const bookService = new BookService(MongoDB.client);
        const deletedCount = await bookService.deleteAll();
        return res.send({ 
            message: `${deletedCount} books were deleted successfully`
         });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all books")
        );
    }
};

exports.getAllBook = async (req, res, next) => {
    try {
        const bookService = new BookService(MongoDB.client);
        const documents = await bookService.find({});
        return res.send(documents);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving all books")
        );
    }
};

exports.getAvailableBook = async (req, res, next) => {
    try {
        const bookService = new BookService(MongoDB.client);
        const documents = await bookService.find({ availableCopies: { $gt: 0 } });
        return res.send(documents);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving available books")
        );
    }
};

exports.findByTitle = async (req, res, next) => {
    try {
        const bookService = new BookService(MongoDB.client);
        const title = req.query.title;
        if (!title) {
            return next(new ApiError(400, "Title query is required"));
        }
        const documents = await bookService.findByTitle(title);
        return res.send(documents);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error retrieving books with title=${req.query.title}`
            )
        );
    }
};