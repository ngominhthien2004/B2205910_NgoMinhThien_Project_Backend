const { ObjectId } = require('mongodb');
const BookService = require("./book.service");
const MongoDB = require("../utils/mongodb.util");

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
        const result = await this.MuonSach.insertOne(muonsach);
        return result.insertedId ? muonsach : null;
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
        const existed = await this.MuonSach.findOne(filter);
        console.log("Filter:", filter, "Existed:", existed);
        if (!existed) {
            return null;
        }

        let update = this.extractMuonSachData(payload);
        if (Object.keys(update).length === 1 && update.status) {
            update = { ...existed, status: update.status };
        }

        // --- Bổ sung cập nhật availableCopies ---
        // Lấy trạng thái cũ và mới
        const prevStatus = existed.status;
        const newStatus = update.status;
        const idBook = existed.idBook;

        // Nếu chuyển từ pending sang approved, giảm availableCopies
        if (prevStatus === "pending" && newStatus === "approved") {
            const bookService = new BookService(MongoDB.client);
            const book = await bookService.findByIdBook(idBook);
            if (book && book.availableCopies > 0) {
                await bookService.update(book._id, { availableCopies: book.availableCopies - 1 });
            }
        }
        // Nếu chuyển từ borrowed/approved sang returned, tăng availableCopies
        if (
            (prevStatus === "borrowed" || prevStatus === "approved") &&
            newStatus === "returned"
        ) {
            const bookService = new BookService(MongoDB.client);
            const book = await bookService.findByIdBook(idBook);
            if (book) {
                await bookService.update(book._id, { availableCopies: book.availableCopies + 1 });
            }
        }

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
            { returnDocument: "after" }
        );
        console.log("Update result:", result);
        return result;
    }

    async delete(id) {
        if (!ObjectId.isValid(id)) {
            return null;
        }
        const result = await this.MuonSach.findOneAndDelete({
            _id: new ObjectId(id)
        });
        // Trả về document đã xóa
        return result;
    }

    async deleteAll() {
        const result = await this.MuonSach.deleteMany({});
        // Trả về số lượng đã xóa
        return result.deletedCount;
    }
}

module.exports = MuonSachService;