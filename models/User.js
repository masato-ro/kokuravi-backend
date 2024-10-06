// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // 新增 email 字段
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }], // 用户的类别
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bookmark' }] // 用户的书签
});

const User = mongoose.model('User', userSchema);
export default User;
