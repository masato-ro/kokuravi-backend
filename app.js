import createError from 'http-errors';
import express from 'express';
import session from 'express-session';
import connectMongo from 'connect-mongodb-session';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import categoriesRouter from './routes/categories.js'; // 引入類別路由
import bookmarksRouter from './routes/bookmarks.js'; // 引入書籤路由
import svgCaptcha from 'svg-captcha'
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors()); // 允许所有来源的跨域请求

const mongoURI = process.env.MONGODB_URI;

// MongoDB連接
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('MongoDB connection error:', err));

// 创建 MongoDB session 存储
const MongoDBStore = connectMongo(session);

const store = new MongoDBStore({
  uri: mongoURI,
  collection: 'sessions', // session 存储集合的名称
});

// 处理 session 错误
store.on('error', function(error) {
  console.error('Session store error:', error);
});

// session 中间件配置
app.use(session({
  secret: process.env.SESSION_SECRET, // 替换为你的密钥
  resave: false,
  saveUninitialized: false,
  store: store, // 使用 MongoDB 存储 session
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 设置 cookie 的过期时间，1 天
  },
}));

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/users/categories', categoriesRouter);
app.use('/api/users/bookmarks', bookmarksRouter);

// 存储验证码文本（这里可以用内存、数据库等存储）
let captchaText = '';

app.get('/api/captcha/image', (req, res) => {
  // 生成验证码
  const captcha = svgCaptcha.create({
    size: 4, // 验证码字符数
    noise: 3, // 干扰线数量
    color: true, // 是否使用颜色
    width: 100, // 宽度
    height: 40, // 高度
  });
  captchaText = captcha.text; // 存储生成的验证码文本

  // 返回 SVG 图像
  res.type('svg').send(captcha.data);
});

app.get('/api/captcha/text', (req, res) => {
  // 返回当前生成的验证码文本
  res.json({ text: captchaText });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log(`Request URL: ${req.url}`);
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
