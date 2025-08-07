const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs'); // thêm dòng này

class ReaderService {
    constructor(client) {
        this.Reader = client.db().collection('readers');
    }

    extractReaderData(payload) {
        const reader = {
            idReader: payload.idReader,
            lastNameReader: payload.lastNameReader,
            firstNameReader: payload.firstNameReader,
            dateOfBirthReader: payload.dateOfBirthReader,
            genderReader: payload.genderReader,
            addressReader: payload.addressReader,
            phoneReader: payload.phoneReader,
            username: payload.username,
            password: payload.password,
        };
        
        Object.keys(reader).forEach(
            (key) => reader[key] === undefined && delete reader[key]
        );
        return reader;
    }

    async create(payload) {
        const reader = this.extractReaderData(payload);
        if (reader.password) {
            reader.password = await bcrypt.hash(reader.password, 10); // băm mật khẩu
        }
        const result = await this.Reader.insertOne(reader);
        // Trả về document vừa tạo (có _id)
        return result.insertedId ? { ...reader, _id: result.insertedId } : null;
    }

    async find(filter) {
        const cursor = await this.Reader.find(filter);
        return await cursor.toArray();
    }

    async findByUsername(username) {
        return await this.Reader.findOne({ username: username });
    }

    async findById(idOrUsername) {
        if (ObjectId.isValid(idOrUsername)) {
            return await this.Reader.findOne({ _id: new ObjectId(idOrUsername) });
        }
        return await this.Reader.findOne({ username: idOrUsername });
    }

    async update(id, payload) {
        if (!ObjectId.isValid(id)) return null;
        const filter = { _id: new ObjectId(id) };
        const update = this.extractReaderData(payload);
        const result = await this.Reader.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        // Trả về document sau khi cập nhật
        return result;
    }

    async delete(id) {
        if (!ObjectId.isValid(id)) return null;
        const result = await this.Reader.findOneAndDelete({
            _id: new ObjectId(id)
        });
        // Trả về document đã xóa
        return result;
    }

    async deleteAll() {
        const result = await this.Reader.deleteMany({});
        return result.deletedCount;
    }

    async comparePassword(reader, password) {
        if (!reader || !reader.password) return false;
        return await bcrypt.compare(password, reader.password);
    }
}

module.exports = ReaderService;