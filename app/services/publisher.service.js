const { ObjectId } = require('mongodb');

class PublisherService {
    constructor(client) {
        this.Publisher = client.db().collection('publishers');
    }

    extractPublisherData(payload) {
        const publisher = {
            idPublisher: payload.idPublisher,
            namePublisher: payload.namePublisher,
            addressPublisher: payload.addressPublisher,
        };
        
        Object.keys(publisher).forEach(
            (key) => publisher[key] === undefined && delete publisher[key]
        );
        return publisher;
    }

    async create(payload) {
        const publisher = this.extractPublisherData(payload);
        const result = await this.Publisher.findOneAndUpdate(
            publisher,
            { $set: publisher },
            { returnDocument: 'after', upsert: true }
        );
        return result.value;
    }

    async find(filter) {
        const cursor = await this.Publisher.find(filter);
        return await cursor.toArray();
    }

    async findByName(name) {
        return await this.find({
            name: { $regex: new RegExp(name), $options: 'i' }
        });
    }

    async findById(id) {
        return await this.Publisher.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null
        });
    }

    async update(id, payload) {
        const filter = { 
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null 
        };
        const update = this.extractPublisherData(payload);
        const result = await this.Publisher.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }

    async delete(id) {
        const result = await this.Publisher.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null
        });
        return result;
    }

    async deleteAll() {
        const result = await this.Publisher.deleteMany({});
        return result;
    }
}

module.exports = PublisherService;