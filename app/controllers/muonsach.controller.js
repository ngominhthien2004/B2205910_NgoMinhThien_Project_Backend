const MuonSachService = require("../services/muonsach.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
    try {
        const muonsachService = new MuonSachService(MongoDB.client);
        const document = await muonsachService.create(req.body);
        if (!document) {
            return next(new ApiError(500, "Không thể tạo phiếu mượn sách"));
        }
        return res.send({
            message: "Tạo phiếu mượn sách thành công",
            muonsach: document
        });
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

    // Thêm thông báo trả về danh sách
    return res.send({
        message: "Lấy danh sách phiếu mượn sách thành công",
        muonsachs: documents
    });
};

exports.findOne = async (req, res, next) => {
    try {
        const muonsachService = new MuonSachService(MongoDB.client);
        const document = await muonsachService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "MuonSach not found"));
        }
        // Thêm thông báo trả về chi tiết
        return res.send({
            message: "Lấy thông tin phiếu mượn sách thành công",
            muonsach: document
        });
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
        const updated = await muonsachService.update(req.params.id, req.body);
        if (!updated) {
            return next(new ApiError(404, "MuonSach not found"));
        }
        return res.send({
            message: "Cập nhật phiếu mượn sách thành công",
            muonsach: updated
        });
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
        return res.send({ message: "Xóa phiếu mượn sách thành công" });
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
            message: `Đã xóa thành công ${deletedCount} phiếu mượn sách`
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
        const updated = await muonsachService.update(req.params.id, { status });
        console.log("Controller updated:", updated);
        if (updated === null || updated === undefined) {
            return next(new ApiError(404, "MuonSach not found"));
        }
        return res.send({
            message: "Cập nhật trạng thái phiếu mượn sách thành công",
            muonsach: updated
        });
    } catch (error) {
        return next(
            new ApiError(500, `Error updating status for muonsach with id=${req.params.id}`)
        );
    }
};