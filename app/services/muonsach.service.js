const { ObjectId } = require('mongodb');

class MuonSachService {
    constructor(client) {
        this.MuonSach = client.db().collection('muonsachs');
    }

    extractMuonSachData(payload) {
        const allowedStatuses = ['pending', 'approved', 'borrowed', 'returned'];
        let status = payload.status;
        if (!allowedStatuses.includes(status)) {
            status = 'pending';
        }
        const muonsach = {
            idReader: payload.idReader,
            idBook: payload.idBook,
            ngayMuon: payload.ngayMuon,
            ngayTra: payload.ngayTra,
            status: status,
        };
        
        Object.keys(muonsach).forEach(
            (key) => muonsach[key] === undefined && delete muonsach[key]
        );
        return muonsach;
    }

    async create(payload) {
        const muonsach = this.extractMuonSachData(payload);
        const result = await this.MuonSach.findOneAndUpdate(
            muonsach,
            { $set: muonsach },
            { returnDocument: 'after', upsert: true }
        );
        return result;
    }

    async find(filter) {
        const cursor = await this.MuonSach.find(filter);
        return await cursor.toArray();
    }

    async findByName(name) {
        return await this.find({
            name: { $regex: new RegExp(name), $options: 'i' }
        });
    }

    async findById(id) {
        return await this.MuonSach.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null
        });
    }

    async update(id, payload) {
        const filter = { 
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null 
        };
        const update = this.extractMuonSachData(payload);

        // Check if status is being updated to "Đã trả"
        if (update.status === "Đã trả") {
            // Fetch the current record to get ngayTra (due date)
            const current = await this.MuonSach.findOne(filter);
            if (current && current.ngayTra) {
                const actualReturnDate = payload.actualReturnDate ? new Date(payload.actualReturnDate) : new Date();
                const dueDate = new Date(current.ngayTra);
                if (actualReturnDate > dueDate) {
                    // Calculate days late
                    const msPerDay = 24 * 60 * 60 * 1000;
                    const daysLate = Math.ceil((actualReturnDate - dueDate) / msPerDay);
                    // Example fine: 5000 VND per day late
                    update.fine = daysLate * 5000;
                    update.daysLate = daysLate;
                    update.returnedAt = actualReturnDate;
                } else {
                    update.fine = 0;
                    update.daysLate = 0;
                    update.returnedAt = actualReturnDate;
                }
            }
        }

        const result = await this.MuonSach.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }

    async delete(id) {
        const result = await this.MuonSach.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null
        });
        return result;
    }

    async deleteAll() {
        const result = await this.MuonSach.deleteMany({});
        return result;
    }
}

module.exports = MuonSachService;