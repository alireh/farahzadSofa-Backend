"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
const PORT = 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static('uploads'));
// اطمینان از وجود پوشه آپلود
const uploadDir = 'uploads';
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir);
}
// تنظیمات Multer برای آپلود تصاویر
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('فقط تصاویر مجاز هستند'));
        }
    }
});
// داده‌های نمونه
let siteData = {
    about: 'توی سوفامبل به دنبال 2 هدف اصلی هستیم  1- شما عزیزان بتونید خرید محصولات چوبی (انواع مبلمان - سرویس خواب - میز ناهار خوری - آینه کنسول و ….) رو با بهترین قیمت و بهترین کیفیت به صورت مستقیم و بدون واسطه از تولیدکنندگان (آنلاین - حضوری) خرید کنید.  2- تولیدکنندگان عزیز بتونن در فضای اینترنت، تولیدات خودشون رو به صورت مستقیم برای مصرف کننده نهایی و مشتریان عرضه کنند و تولید خودشون رو گسترش بدن.  همواره سعی میکنیم بهترین خدمات رو برای مشتریان و تولیدکنندگان فراهم کنیم  :heart:❤️',
    address: 'تهران، میدان انقلاب',
    email: 'farahzadfuniture@gmail.com',
    phone: '09121234567',
    images: [
        { id: 1, url: '/uploads/sample1.jpg', title: 'تصویر اول' },
        { id: 2, url: '/uploads/sample2.jpg', title: 'تصویر دوم' }
    ]
};
// Routes برای کاربران عادی
app.get('/api/data', (req, res) => {
    res.json(siteData);
});
// Routes برای ادمین
// دریافت اطلاعات برای ادمین
app.get('/api/admin/data', (req, res) => {
    // در حالت واقعی باید احراز هویت انجام شود
    res.json(siteData);
});
// آپلود تصویر جدید
app.post('/api/admin/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'هیچ فایلی آپلود نشده است' });
        }
        const newImage = {
            id: siteData.images.length + 1,
            url: `/uploads/${req.file.filename}`,
            type: req.body.type,
            title: req.body.title || 'تصویر جدید'
        };
        siteData.images.push(newImage);
        res.json({ message: 'تصویر با موفقیت آپلود شد', image: newImage });
    }
    catch (error) {
        res.status(500).json({ error: 'خطا در آپلود تصویر' });
    }
});
// به‌روزرسانی درباره ما و آدرس
app.put('/api/admin/update-content', (req, res) => {
    const { about, address } = req.body;
    if (about !== undefined)
        siteData.about = about;
    if (address !== undefined)
        siteData.address = address;
    res.json({ message: 'اطلاعات با موفقیت به‌روزرسانی شد', data: siteData });
});
// حذف تصویر
app.delete('/api/admin/image/:id', (req, res) => {
    const id = parseInt(req.params.id);
    siteData.images = siteData.images.filter(img => img.id !== id);
    res.json({ message: 'تصویر حذف شد', images: siteData.images });
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
