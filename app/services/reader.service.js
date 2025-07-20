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
        };
        
        Object.keys(reader).forEach(
            (key) => reader[key] === undefined && delete reader[key]
        );
        return reader;
    }

    async create(payload) {
        const reader = this.extractReaderData(payload);
        const result = await this.Reader.findOneAndUpdate(
            reader,
            { $set: reader },
            { returnDocument: 'after', upsert: true }
        );
        return result;
    }

    async find(filter) {
        const cursor = await this.Reader.find(filter);
        return await cursor.toArray();
    }

    async findByName(name) {
        return await this.find({
            name: { $regex: new RegExp(name), $options: 'i' }
        });
    }

    async findById(id) {
        return await this.Reader.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null
        });
    }

    async update(id, payload) {
        const filter = { 
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null 
        };
        const update = this.extractReaderData(payload);
        const result = await this.Reader.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }

    async delete(id) {
        const result = await this.Reader.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null
        });
        return result;
    }

    async deleteAll() {
        const result = await this.Reader.deleteMany({});
        return result;
    }
}

module.exports = ReaderService;