const MuonSachService = require("../services/muonsach.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
    if (!req.body?.name) {
        return next(new ApiError(400, "Name can not be empty"));
    }

    try {
        const muonsachService = new MuonSachService(MongoDB.client);
        const document = await muonsachService.create(req.body);
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the muonsach")
        );
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const muonsachService = new MuonSachService(MongoDB.client);
        const {name} = req.query;
        if (name) {
            documents = await muonsachService.findByName(name);
        } else {
            documents = await muonsachService.find({});
        } 
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving muonsachs")
        );
    }

    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const muonsachService = new MuonSachService(MongoDB.client);
        const document = await muonsachService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "MuonSach not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500, 
                `Error retrieving muonsach with id=${req.params.id}`
            )
        );
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }

    try {
        const muonsachService = new MuonSachService(MongoDB.client);
        const document = await muonsachService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "MuonSach not found"));
        }
        return res.send({ message: "MuonSach was updated successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Error updating muonsach with id=${req.params.id}`)
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const muonsachService = new MuonSachService(MongoDB.client);
        const document = await muonsachService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "MuonSach not found"));
        }
        return res.send({ message: "MuonSach was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(
                500, 
                `Could not delete muonsach with id=${req.params.id}`)
        );
    }
};

exports.findAllFavorite = async (_req, res, next) => {
    try {
        const muonsachService = new MuonSachService(MongoDB.client);
        const documents = await muonsachService.findFavorite();
        return res.send(documents);
    } catch (error) {
        return next(
            new ApiError(
                500, 
                "An error occurred while retrieving favorite muonsachs")
        );
    }
};

exports.deleteAll = async (_req, res, next) => {
    try {
        const muonsachService = new MuonSachService(MongoDB.client);
        const deletedCount = await muonsachService.deleteAll();
        return res.send({ 
            message: `${deletedCount} muonsachs were deleted successfully`
         });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all muonsachs")
        );
    }
};