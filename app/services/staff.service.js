const { ObjectId } = require('mongodb');

class StaffService {
    constructor(client) {
        this.Staff = client.db().collection('staffs');
    }

    extractStaffData(payload) {
        const staff = {
            idStaff: payload.idStaff,
            nameStaff: payload.nameStaff,
            passwordStaff: payload.passwordStaff,
            roleStaff: payload.roleStaff,
            addressStaff: payload.addressStaff,
            phoneStaff: payload.phoneStaff,
        };
        
        Object.keys(staff).forEach(
            (key) => staff[key] === undefined && delete staff[key]
        );
        return staff;
    }

    async create(payload) {
        const staff = this.extractStaffData(payload);
        const result = await this.Staff.findOneAndUpdate(
            staff,
            { $set: staff },
            { returnDocument: 'after', upsert: true }
        );
        return result;
    }

    async find(filter) {
        const cursor = await this.Staff.find(filter);
        return await cursor.toArray();
    }

    async findByName(name) {
        return await this.find({
            name: { $regex: new RegExp(name), $options: 'i' }
        });
    }

    async findById(id) {
        return await this.Staff.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null
        });
    }

    async update(id, payload) {
        const filter = { 
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null 
        };
        const update = this.extractStaffData(payload);
        const result = await this.Staff.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }

    async delete(id) {
        const result = await this.Staff.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null
        });
        return result;
    }

    async deleteAll() {
        const result = await this.Staff.deleteMany({});
        return result;
    }
}

module.exports = StaffService;