import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const router = express.Router();

// 驗證電子郵件格式的函數
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 簡單的電子郵件正則錶達式
  return regex.test(email);
};

// 登入
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: '無效的憑證' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!user || !isPasswordValid) {
      return res.status(401).json({ message: '用戶名或密碼不正確' });
    }

    // 保存用戶信息到 session
    req.session.user = {
      _id: user._id,
      username: user.username,
    };

    res.json({ message: '登入成功', user: req.session.user });
  } catch (error) {
    console.error('登入失敗:', error);
    res.status(500).json({ error: '登入失敗，請稍後重試。' });
  }
});

// 登出
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: '登出失敗' });
    }
    res.clearCookie('connect.sid'); // 清除客戶端的 cookie
    res.json({ message: '登出成功' });
  });
});

// 添加新用戶
router.post('/', async (req, res) => {
  const { username, password, email } = req.body;

  // 驗證電子郵件格式
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  // 檢查用戶名和電子郵件是否已經存在
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    if (existingUser.username === username) {
      return res.status(400).json({ error: 'Username is already taken' });
    }
    if (existingUser.email === email) {
      return res.status(400).json({ error: 'Email is already registered' });
    }
  }
  
  // 哈希密碼
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword, email });

  try {
    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// 更新特定用戶
router.put('/', async (req, res) => {
  const { id } = req.body; // 從路徑參數中獲取用戶 ID
  const { username, email ,password} = req.body; // 從請求體中獲取新的用戶名和信箱

  try {
    const updatedData = {}; // 初始化更新數據對象

    // 僅在新電子郵件存在時添加到更新數據
    if (email) {
      updatedData.email = email;
    }

    // 僅在新密碼存在時進行哈希處理並添加到更新數據
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updatedData, { new: true }); // 僅更新存在的字段
    if (!updatedUser) {
      return res.status(404).json({ error: '用戶未找到' }); // 用戶不存在
    }
    res.json({ message: '用戶更新成功', updatedUser }); // 返回成功消息和更新後的用戶
  } catch (error) {
    console.error('更新用戶失敗:', error);
    res.status(500).json({ error: '更新用戶失敗' });
  }
});

// 獲取所有用戶
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// 刪除特定用戶
router.delete('/', async (req, res) => {
  const { id } = req.query; // 從路徑參數中獲取用戶 ID

  try {
    const deletedUser = await User.findByIdAndDelete(id); // 刪除用戶
    if (!deletedUser) {
      return res.status(404).json({ error: '用戶未找到' }); // 用戶不存在
    }
    res.json({ message: '用戶刪除成功' }); // 返回成功消息
  } catch (error) {
    console.error('刪除用戶失敗:', error);
    res.status(500).json({ error: '刪除用戶失敗' });
  }
});

export default router;
