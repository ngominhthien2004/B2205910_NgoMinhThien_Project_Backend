const { ObjectId } = require('mongodb');

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
        const result = await this.Reader.insertOne(reader);
        return reader;
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

    async update(idOrUsername, payload) {
        let filter;
        if (ObjectId.isValid(idOrUsername)) {
            filter = { _id: new ObjectId(idOrUsername) };
        } else {
            filter = { username: idOrUsername };
        }
        const update = this.extractReaderData(payload);
        const result = await this.Reader.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        if (result.value) {
            return result.value;
        }
        // Nếu không trả về document, thử truy vấn lại
        const updatedDoc = await this.Reader.findOne(filter);
        return updatedDoc;
    }

    async delete(idOrUsername) {
        let filter;
        if (ObjectId.isValid(idOrUsername)) {
            filter = { _id: new ObjectId(idOrUsername) };
        } else {
            filter = { username: idOrUsername };
        }
        // Lấy thông tin trước khi xóa
        const reader = await this.Reader.findOne(filter);
        if (!reader) {
            return null;
        }
        await this.Reader.deleteOne(filter);
        return reader;
    }

    async deleteAll() {
        const result = await this.Reader.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = ReaderService;