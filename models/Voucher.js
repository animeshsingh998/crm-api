import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
  {
    name: String,
    discount: Number
  },
  { timestamps: true }
);

const Voucher = mongoose.model("Voucher", voucherSchema);
export default Voucher;
