// routes/bookmarks.js
import express from 'express';
import Bookmark from '../models/Bookmark.js';

const router = express.Router();

// 添加新的書籤
router.post('/add', async (req, res) => {
  const { userId, categoryId, parentId, url, name, icon, description } = req.body;

  const bookmark = new Bookmark({ 
    userId, 
    categoryId, 
    parentId, 
    url, 
    name, 
    icon, 
    description,
  });

  try {
    await bookmark.save();
    res.status(201).json({ message: 'Bookmark created successfully', bookmark });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    res.status(500).json({ error: 'Failed to create bookmark' });
  }
});

// 修改特定書籤
router.put('/', async (req, res) => {
  const { id, categoryId, url, name, icon, description } = req.body; // 從請求體中提取更新的數據

  try {
    const updatedBookmark = await Bookmark.findByIdAndUpdate(
      id,
      { categoryId, url, name, icon, description },
      { new: true, runValidators: true } // 返回更新後的文檔，並進行驗證
    );

    if (!updatedBookmark) {
      return res.status(404).json({ error: 'Bookmark not found' }); // 如果書籤不存在，返回 404
    }
    
    res.json({ message: 'Bookmark updated successfully', updatedBookmark }); // 返回更新後的書籤信息
  } catch (error) {
    console.error('Error updating bookmark:', error); // 輸出錯誤信息
    res.status(500).json({ error: 'Failed to update bookmark' }); // 返回錯誤響應
  }
});

// 刪除特定書籤
router.delete('/', async (req, res) => {
  const { id } = req.query; // 從查詢參數中提取書籤 ID

  try {
    const deletedBookmark = await Bookmark.findByIdAndDelete(id); // 根據 ID 刪除書籤

    if (!deletedBookmark) {
      return res.status(404).json({ error: 'Bookmark not found' }); // 如果書籤不存在，返回 404
    }
    
    res.json({ message: 'Bookmark deleted successfully' }); // 返回成功消息
  } catch (error) {
    console.error('Error deleting bookmark:', error); // 輸出錯誤信息
    res.status(500).json({ error: 'Failed to delete bookmark' }); // 返回錯誤響應
  }
});

// 獲取特定用戶的所有書籤
router.get('/all', async (req, res) => {
  const { userId } = req.query;
  try {
    const bookmarks = await Bookmark.find({ userId }).populate('categoryId');
    res.json(bookmarks);
  } catch (error) {
    console.error('Failed to fetch bookmarks for user:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks for user' });
  }
});

// 獲取特定書籤
router.get('/', async (req, res) => {
  const { id } = req.query; // 從路徑參數中提取書籤 ID
  try {
    const bookmark = await Bookmark.findById(id).populate('categoryId'); // 根據書籤 ID 查詢書籤並填充 categoryId
    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found' }); // 如果書籤不存在，返回 404
    }
    res.json(bookmark); // 返回書籤信息
  } catch (error) {
    console.error('Failed to fetch bookmark:', error); // 輸出錯誤信息
    res.status(500).json({ error: 'Failed to fetch bookmark' }); // 返回錯誤響應
  }
});

// 搜尋書籤
router.get('/search', async (req, res) => {
  const { keyword, userId } = req.query; // 從查詢參數中提取搜尋條件

  try {
    const filter = { userId }; // 先根據 userId 進行篩選
    
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required for searching.' });
    }

    if (keyword) {
      filter.$or = [
        { url: { $regex: keyword, $options: 'i' } },       // 模糊搜尋 URL
        { name: { $regex: keyword, $options: 'i' } },      // 模糊搜尋 Name
        { description: { $regex: keyword, $options: 'i' } } // 模糊搜尋 Description
      ];
    }

    const bookmarks = await Bookmark.find(filter).populate('categoryId'); // 查詢多個書籤
    res.json(bookmarks); // 返回搜尋結果
  } catch (error) {
    console.error('Failed to search bookmarks:', error);
    res.status(500).json({ error: 'Failed to search bookmarks' });
  }
});

export default router;
