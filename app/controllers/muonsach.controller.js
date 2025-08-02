const MuonSachService = require("../services/muonsach.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
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
        const result = await muonsachService.update(req.params.id, req.body);
        if (!result || !result.value) {
            return next(new ApiError(404, "MuonSach not found"));
        }
        // If fine info is present, return it
        const updated = result.value;
        let response = { message: "MuonSach was updated successfully" };
        if (typeof updated.fine !== "undefined") {
            response.fine = updated.fine;
            response.daysLate = updated.daysLate;
        }
        return res.send(response);
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

exports.changeStatus = async (req, res, next) => {
    const { status } = req.body;
    if (!status) {
        return next(new ApiError(400, "Status is required"));
    }
    try {
        const muonsachService = new MuonSachService(MongoDB.client);
        const result = await muonsachService.update(req.params.id, { status });
        if (!result || !result.value) {
            return next(new ApiError(404, "MuonSach not found"));
        }
        return res.send({ message: "Status updated successfully", status: result.value.status });
    } catch (error) {
        return next(
            new ApiError(500, `Error updating status for muonsach with id=${req.params.id}`)
        );
    }
};