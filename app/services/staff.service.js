const { ObjectId } = require('mongodb');

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
        const result = await this.Staff.insertOne(staff);
        return staff;
    }

    async find(filter) {
        const cursor = await this.Staff.find(filter);
        return await cursor.toArray();
    }

    async findByUsername(username) {
        return await this.Staff.findOne({ username: username });
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
        const filter = { username: idOrUsername };
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