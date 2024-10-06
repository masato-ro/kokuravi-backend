import express from 'express';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser'; // 導入 body-parser
import dotenv from 'dotenv'; // 導入 dotenv
import { randomBytes } from 'crypto'; // 導入 crypto


const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));

dotenv.config();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express', inputVariable: '', message: null });
});

// POST form data
router.post('/submit', (req, res) => {
  const inputVariable = req.body.inputVariable; // 獲取輸入的變數
  res.render('index', { title: 'Express', inputVariable, message: null });
});

// 更新 .env 文件
router.post('/update-env', (req, res) => {
  const { mongodbUri, sessionSecret } = req.body; // 從請求體中獲取新的值

  // 讀取現有的 .env 文件
  const envPath = path.join(process.cwd(), '.env'); // 使用 process.cwd() 確保路徑正確
  fs.readFile(envPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).render('index', { title: 'Express', inputVariable: '', message: 'Unable to read .env file' });
    }

    // 更新 MONGODB_URI 和 SESSION_SECRET
    let updatedEnv = data
      .split('\n')
      .map(line => {
        if (line.startsWith('MONGODB_URI=')) {
          return `MONGODB_URI=${mongodbUri}`;
        }
        if (line.startsWith('SESSION_SECRET=')) {
          return `SESSION_SECRET=${sessionSecret}`;
        }
        return line;
      })
      .join('\n');

    // 寫入更新後的內容回 .env 文件
    fs.writeFile(envPath, updatedEnv, 'utf8', (err) => {
      if (err) {
        return res.status(500).render('index', { title: 'Express', inputVariable: '', message: 'Unable to write .env file' });
      }
      // 更新成功後，重定嚮到首頁並顯示成功消息
      res.render('index', { title: 'Express', inputVariable: '', message: '.env file updated successfully' });
    });
  });
});

// 生成密鑰
router.get('/generate-key', (req, res) => {
  const generateSecretKey = () => {
    return randomBytes(32).toString('hex'); // 生成 32 字節的隨機密鑰，並轉為十六進製字符串
  };

  const secretKey = generateSecretKey();
  res.json({ key: secretKey }); // 返回生成的密鑰
});

export default router; // 修改為 ES 模塊導出
