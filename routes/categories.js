// routes/categories.js
import express from 'express';
import Category from '../models/Category.js';
import Bookmark from '../models/Bookmark.js';

const router = express.Router();

// 添加新的主類別
router.post('/add', async (req, res) => {
  const { userId, name } = req.body; // 從請求體中提取 name
  
  // 創建 Category 實例時包含 userId
  const category = new Category({ userId, name, level: 0 });
  try {
      await category.save();
      res.status(201).json({ message: 'Main category created successfully', category });
  } catch (error) {
      console.error('Error creating main category:', error); // 輸出錯誤信息
      res.status(500).json({ error: 'Failed to create main category' });
  }
});

// 添加新的次類別
router.post('/add/sub', async (req, res) => {
  const { userId, parentId, name } = req.body; // 從請求參數中提取 userId/parentId/name

  const category = new Category({ userId, name, parentId, level: 1 });
  try {
    await category.save();
    res.status(201).json({ message: 'Sub-category created successfully', category });
  } catch (error) {
    console.error('Error creating sub-category:', error);
    res.status(500).json({ error: 'Failed to create sub-category' });
  }
});

// 刪除特定類別
router.delete('/', async (req, res) => {
  const { id } = req.query; // 從路徑參數中獲取類別 ID

  try {
    // 查找要刪除的類別
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: '類別未找到' }); // 類別不存在
    }

    // 刪除該類別下的所有書簽
    await Bookmark.deleteMany({ categoryId: id });

    // 查找所有子類別
    const subCategories = await Category.find({ parentId: id });

    // 刪除子類別下的所有書簽
    for (const subCategory of subCategories) {
      await Bookmark.deleteMany({ categoryId: subCategory._id });
    }

    // 查找並刪除所有子類別
    await Category.deleteMany({ parentId: id });

    // 刪除當前類別
    await Category.findByIdAndDelete(id);

    res.json({ message: '類別及其相關書簽和子類別刪除成功' }); // 返回成功消息
  } catch (error) {
    console.error('刪除類別失敗:', error);
    res.status(500).json({ error: '刪除類別失敗' });
  }
});

// 更新特定類別
router.put('/', async (req, res) => {
  const { id, name, parentId } = req.body; // 從查詢參數中提取類別 ID

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, parentId },
      { new: true, runValidators: true } // 返回更新後的文檔，並啓用驗證
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' }); // 如果類別不存在，返回 404
    }

    res.json({ message: 'Category updated successfully', updatedCategory }); // 返回成功消息和更新後的類別
  } catch (error) {
    console.error('Error updating category:', error); // 輸出錯誤信息
    res.status(500).json({ error: 'Failed to update category' }); // 返回錯誤回響
  }
});

// 獲取特定用戶的所有類別
router.get('/all', async (req, res) => {
  const { userId } = req.query;
  try {
    const categories = await Category.find({ userId }).populate('parentId');
    res.json(categories);
  } catch (error) {
    console.error('Failed to fetch categories for user:', error);
    res.status(500).json({ error: 'Failed to fetch categories for user' });
  }
});

export default router;
