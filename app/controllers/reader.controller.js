const ReaderService = require("../services/reader.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
    if (!req.body?.lastNameReader || !req.body?.firstNameReader) {
        return next(new ApiError(400, "Tên và họ của độc giả không được để trống"));
    }

    try {
        const readerService = new ReaderService(MongoDB.client);
        const document = await readerService.create(req.body);
        // Trả về document vừa tạo (không trả về password)
        const { password, ...readerWithoutPassword } = document;
        return res.send({
            message: "Độc giả được tạo thành công",
            reader: readerWithoutPassword
        });
    } catch (error) {
        return next(
            new ApiError(500, "Lỗi xảy ra khi tạo độc giả")
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
            new ApiError(500, "Lỗi xảy ra khi truy xuất danh sách độc giả")
        );
    }

    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const readerService = new ReaderService(MongoDB.client);
        const document = await readerService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Độc giả không tồn tại"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500, 
                `Lỗi xảy ra khi truy xuất độc giả với id=${req.params.id}`
            )
        );
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Dữ liệu để cập nhật không được để trống"));
    }

    try {
        const readerService = new ReaderService(MongoDB.client);
        const document = await readerService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Độc giả không tồn tại"));
        }
        // Trả về thông tin độc giả vừa update (không trả về password)
        const { password, ...readerWithoutPassword } = document;
        return res.send({
            message: "Độc giả được cập nhật thành công",
            reader: readerWithoutPassword
        });
    } catch (error) {
        return next(
            new ApiError(500, `Lỗi xảy ra khi cập nhật độc giả với id=${req.params.id}`)
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const readerService = new ReaderService(MongoDB.client);
        const document = await readerService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Độc giả không tồn tại"));
        }
        // Trả về thông tin độc giả đã xóa (không trả về password)
        const { password, ...readerWithoutPassword } = document;
        return res.send({
            message: "Độc giả đã được xóa thành công",
            reader: readerWithoutPassword
        });
    } catch (error) {
        // Có thể log error để debug chi tiết hơn
        // console.error(error);
        return next(
            new ApiError(
                500, 
                `Lỗi xảy ra khi xóa độc giả với id=${req.params.id}`)
        );
    }
};


exports.deleteAll = async (_req, res, next) => {
    try {
        const readerService = new ReaderService(MongoDB.client);
        const deletedCount = await readerService.deleteAll();
        return res.send({ 
            message: `${deletedCount} độc giả đã được xóa thành công`
         });
    } catch (error) {
        return next(
            new ApiError(500, "Lỗi xảy ra khi xóa tất cả độc giả")
        );
    }
};

exports.register = async (req, res, next) => {
    const { username, password, lastNameReader, firstNameReader } = req.body;
    if (!username || !password || !lastNameReader || !firstNameReader) {
        return next(new ApiError(400, "Tên đăng nhập, mật khẩu, họ và tên là bắt buộc"));
    }
    try {
        const readerService = new ReaderService(MongoDB.client);
        const existing = await readerService.findByUsername(username);
        if (existing) {
            return next(new ApiError(409, "Tên đăng nhập đã tồn tại"));
        }
        const document = await readerService.create(req.body);
        // Không trả về password
        const { password: _, ...readerWithoutPassword } = document;
        return res.status(201).send({
            message: "Đăng ký thành công",
            reader: readerWithoutPassword
        });
    } catch (error) {
        return next(new ApiError(500, "Lỗi xảy ra trong quá trình đăng ký"));
    }
};