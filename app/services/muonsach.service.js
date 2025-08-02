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
        // Trả về document đã tạo
        return result.value;
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
        if (!ObjectId.isValid(id)) {
            return null;
        }
        return await this.MuonSach.findOne({
            _id: new ObjectId(id)
        });
    }

    async update(id, payload) {
        if (!ObjectId.isValid(id)) {
            console.log("Invalid ObjectId:", id);
            return null;
        }
        const filter = { _id: new ObjectId(id) };

        // Kiểm tra document có tồn tại không
        const existed = await this.MuonSach.findOne(filter);
        console.log("Filter:", filter, "Existed:", existed);
        if (!existed) {
            return null;
        }

        // Nếu chỉ update status, merge với existed để không mất dữ liệu
        let update = this.extractMuonSachData(payload);
        if (Object.keys(update).length === 1 && update.status) {
            update = { ...existed, status: update.status };
        }
        console.log("Update payload:", update);

        // Check if status is being updated to "Đã trả" hoặc "returned"
        if (update.status === "Đã trả" || update.status === "returned") {
            // Fetch the current record to get ngayTra (due date)
            const current = await this.MuonSach.findOne(filter);
            if (current && current.ngayTra) {
                const ngayTraThucTe = payload.ngayTraThucTe ? new Date(payload.ngayTraThucTe) : new Date();
                const dueDate = new Date(current.ngayTra);
                if (ngayTraThucTe > dueDate) {
                    // Calculate days late
                    const msPerDay = 24 * 60 * 60 * 1000;
                    const daysLate = Math.ceil((ngayTraThucTe - dueDate) / msPerDay);
                    // Example fine: 5000 VND per day late
                    update.fine = daysLate * 5000;
                    update.daysLate = daysLate;
                } else {
                    update.fine = 0;
                    update.daysLate = 0;
                }
                update.ngayTraThucTe = ngayTraThucTe;
            }
        }

        const result = await this.MuonSach.findOneAndUpdate(
            filter,
            { $set: update },
            { returnOriginal: false }
        );
        console.log("Update result:", result);
        return result.value;
    }

    async delete(id) {
        if (!ObjectId.isValid(id)) {
            return null;
        }
        const result = await this.MuonSach.findOneAndDelete({
            _id: new ObjectId(id)
        });
        // Trả về document đã xóa
        return result.value;
    }

    async deleteAll() {
        const result = await this.MuonSach.deleteMany({});
        // Trả về số lượng đã xóa
        return result.deletedCount;
    }
}

module.exports = MuonSachService;