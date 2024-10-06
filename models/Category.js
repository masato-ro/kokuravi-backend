// models/Category.js
import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
  }, // 关联用户
  name: { 
    type: String, 
    required: true,
  },
  parentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category',
   }, // 主类别（可选）
  level: { 
    type: Number, 
    default: 0, 
  } // 分类层级（0: 主类别，1: 次类别）
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
