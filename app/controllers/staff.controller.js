const StaffService = require("../services/staff.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
    if (!req.body?.nameStaff) {
        return next(new ApiError(400, "Staff name can not be empty"));
    }

    try {
        const staffService = new StaffService(MongoDB.client);
        // Kiểm tra username không trùng với staff khác
        if (req.body?.username) {
            const existing = await staffService.findByUsername(req.body.username);
            if (existing) {
                return next(new ApiError(409, "Username already exists in staff"));
            }
        }
        const document = await staffService.create(req.body);
        const { password, passwordStaff, ...staffWithoutPassword } = document;
        return res.status(201).send({
            message: "Staff created successfully",
            staff: staffWithoutPassword
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the staff")
        );
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const staffService = new StaffService(MongoDB.client);
        const { name } = req.query;
        if (name) {
            documents = await staffService.find({ nameStaff: { $regex: new RegExp(name, 'i') } });
        } else {
            documents = await staffService.find({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving staffs")
        );
    }
    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const staffService = new StaffService(MongoDB.client);
        const document = await staffService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Staff not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error retrieving staff with id=${req.params.id}`
            )
        );
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }

    try {
        const staffService = new StaffService(MongoDB.client);
        const document = await staffService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Staff not found"));
        }
        const { password, passwordStaff, ...staffWithoutPassword } = document;
        return res.send({
            message: "Staff was updated successfully",
            staff: staffWithoutPassword
        });
    } catch (error) {
        return next(
            new ApiError(500, `Error updating staff with id=${req.params.id}`)
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const staffService = new StaffService(MongoDB.client);
        const document = await staffService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Staff not found"));
        }
        const { password, passwordStaff, ...staffWithoutPassword } = document;
        return res.send({
            message: "Staff was deleted successfully",
            staff: staffWithoutPassword
        });
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Could not delete staff with id=${req.params.id}`)
        );
    }
};

exports.register = async (req, res, next) => {
    const { username, password, nameStaff } = req.body;
    if (!username || !password || !nameStaff) {
        return next(new ApiError(400, "Username, password, and staff name are required"));
    }
    try {
        const staffService = new StaffService(MongoDB.client);
        const existing = await staffService.findByUsername(username);
        if (existing) {
            return next(new ApiError(409, "Username already exists"));
        }
        const document = await staffService.create(req.body);
        const { password: _, passwordStaff, ...staffWithoutPassword } = document;
        return res.status(201).send({
            message: "Register successfully",
            staff: staffWithoutPassword
        });
    } catch (error) {
        return next(new ApiError(500, "An error occurred during registration"));
    }
};

exports.deleteAll = async (_req, res, next) => {
    try {
        const staffService = new StaffService(MongoDB.client);
        const deletedCount = await staffService.deleteAll();
        return res.send({
            message: `${deletedCount} staffs were deleted successfully`
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all staffs")
        );
    }
};