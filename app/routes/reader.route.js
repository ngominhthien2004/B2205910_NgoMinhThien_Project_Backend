const ReaderService = require("../services/reader.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
    if (!req.body?.name) {
        return next(new ApiError(400, "Name can not be empty"));
    }

    try {
        const readerService = new ReaderService(MongoDB.client);
        const document = await readerService.create(req.body);
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the reader")
        );
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const readerService = new ReaderService(MongoDB.client);
        const {name} = req.query;
        if (name) {
            documents = await readerService.findByName(name);
        } else {
            documents = await readerService.find({});
        } 
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving readers")
        );
    }

    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const readerService = new ReaderService(MongoDB.client);
        const document = await readerService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Reader not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500, 
                `Error retrieving reader with id=${req.params.id}`
            )
        );
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }

    try {
        const readerService = new ReaderService(MongoDB.client);
        const document = await readerService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Reader not found"));
        }
        return res.send({ message: "Reader was updated successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Error updating reader with id=${req.params.id}`)
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const readerService = new ReaderService(MongoDB.client);
        const document = await readerService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Reader not found"));
        }
        return res.send({ message: "Reader was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(
                500, 
                `Could not delete reader with id=${req.params.id}`)
        );
    }
};

exports.deleteAll = async (_req, res, next) => {
    try {
        const readerService = new ReaderService(MongoDB.client);
        const deletedCount = await readerService.deleteAll();
        return res.send({ 
            message: `${deletedCount} readers were deleted successfully`
         });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all readers")
        );
    }
};