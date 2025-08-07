const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

class StaffService {
    constructor(client) {
        this.Staff = client.db().collection('staffs');
    }

    extractStaffData(payload) {
        const staff = {
            idStaff: payload.idStaff,
            nameStaff: payload.nameStaff,
            roleStaff: payload.roleStaff,
            addressStaff: payload.addressStaff,
            phoneStaff: payload.phoneStaff,
            username: payload.username,
            password: payload.password,
        };
        Object.keys(staff).forEach(
            (key) => staff[key] === undefined && delete staff[key]
        );
        return staff;
    }

    async create(payload) {
        const staff = this.extractStaffData(payload);
        if (staff.password) {
            staff.password = await bcrypt.hash(staff.password, 10);
        }
        const result = await this.Staff.insertOne(staff);
        return result.insertedId ? { ...staff, _id: result.insertedId } : null;
    }

    async find(filter) {
        const cursor = await this.Staff.find(filter);
        return await cursor.toArray();
    }

    async findByUsername(username) {
        return await this.Staff.findOne({ username: username });
    }

    async comparePassword(staff, password) {
        if (!staff || !staff.password) return false;
        return await bcrypt.compare(password, staff.password);
    }

    async findById(idOrUsername) {
        if (ObjectId.isValid(idOrUsername)) {
            return await this.Staff.findOne({ _id: new ObjectId(idOrUsername) });
        }
        return await this.Staff.findOne({ username: idOrUsername });
    }

    async update(idOrUsername, payload) {
        let filter;
        if (ObjectId.isValid(idOrUsername)) {
            filter = { _id: new ObjectId(idOrUsername) };
        } else {
            filter = { username: idOrUsername };
        }
        const update = this.extractStaffData(payload);

        // Nếu có trường password và không rỗng, băm mật khẩu trước khi cập nhật
        if (update.password) {
            update.password = await bcrypt.hash(update.password, 10);
        } else {
            // Nếu không gửi password mới, loại bỏ trường password khỏi update để không ghi đè thành undefined/rỗng
            delete update.password;
        }

        const result = await this.Staff.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        if (result.value) {
            return result.value;
        }
        const updatedDoc = await this.Staff.findOne(filter);
        return updatedDoc;
    }

    async delete(idOrUsername) {
        let filter;
        if (ObjectId.isValid(idOrUsername)) {
            filter = { _id: new ObjectId(idOrUsername) };
        } else {
            filter = { username: idOrUsername };
        }
        const staff = await this.Staff.findOne(filter);
        if (!staff) {
            return null;
        }
        await this.Staff.deleteOne(filter);
        return staff;
    }

    async deleteAll() {
        const result = await this.Staff.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = StaffService;