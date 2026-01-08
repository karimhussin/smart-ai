# دليل النشر والاستضافة 🚀

هذا الدليل يشرح كيفية نشر المشروع على منصات استضافة مختلفة.

## 📦 البناء للإنتاج

```bash
npm run build
```

سيتم إنشاء مجلد `dist/` يحتوي على:
- `index.html` - الصفحة الرئيسية
- `assets/` - ملفات JavaScript و CSS المصغّرة

## 🌐 خيارات النشر

### 1. Vercel (موصى به) ⭐

**الطريقة السهلة:**
```bash
# تثبيت Vercel CLI
npm i -g vercel

# النشر
vercel
```

**إعداد متغيرات البيئة في Vercel:**
1. اذهب إلى لوحة التحكم: https://vercel.com/dashboard
2. اختر المشروع
3. Settings → Environment Variables
4. أضف:
   - `GEMINI_API_KEY` = your_api_key
   - `VITE_GEMINI_API_KEY` = your_api_key

**ملف `vercel.json` (اختياري):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "framework": "vite"
}
```

### 2. Netlify

```bash
# تثبيت Netlify CLI
npm i -g netlify-cli

# النشر
netlify deploy --prod
```

**إعداد متغيرات البيئة:**
1. Site settings → Environment Variables
2. أضف `GEMINI_API_KEY` و `VITE_GEMINI_API_KEY`

**ملف `netlify.toml`:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. GitHub Pages

**ملاحظة:** GitHub Pages لا يدعم متغيرات البيئة السرية بشكل آمن.
**لا ننصح بهذه الطريقة للإنتاج.**

### 4. استضافة عادية (Shared Hosting)

1. بناء المشروع:
```bash
npm run build
```

2. رفع محتويات مجلد `dist/` عبر FTP إلى:
```
public_html/
```

3. إعداد API Key:
   - قم بإنشاء ملف `config.js` في المجلد العام
   - أضف: `window.GEMINI_API_KEY = 'your_key'`
   - استورده في `index.html`

### 5. Docker

**Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**تشغيل:**
```bash
docker build -t smart-ai .
docker run -p 80:80 smart-ai
```

## 🔐 أمان API Keys

### ⚠️ مهم جداً

**لا تفعل هذا أبداً:**
- ❌ إضافة API key في الكود مباشرة
- ❌ رفع `.env.local` على Git
- ❌ مشاركة API key في أي مكان عام

**الطريقة الصحيحة:**
- ✅ استخدم متغيرات البيئة في منصة الاستضافة
- ✅ أنشئ API key منفصل لكل بيئة (تطوير/إنتاج)
- ✅ قم بتقييد API key على نطاقات محددة

### تقييد API Key

1. اذهب إلى [Google AI Studio](https://aistudio.google.com/apikey)
2. اضغط على مفتاح API الخاص بك
3. أضف قيود:
   - **Application restrictions:** HTTP referrers
   - أضف النطاق: `https://yourdomain.com/*`

## 🧪 اختبار النسخة المبنية محلياً

```bash
npm run preview
```

سيعمل على: http://localhost:4173

## 📊 تحسينات الأداء

### 1. تفعيل Compression

**في Vercel/Netlify:**
يتم تلقائياً ✅

**في Nginx:**
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 2. تفعيل Cache Headers

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. تحسين حجم Bundle

- استخدم `npm run build` للإنتاج
- تأكد من Tree-shaking يعمل
- حجم Bundle الحالي: ~474 KB (مضغوط: ~120 KB)

## 🔍 مراقبة الأخطاء

### إضافة Sentry (اختياري)

```bash
npm install @sentry/react
```

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
});
```

## 🌍 إعداد Domain مخصص

### Vercel:
1. Settings → Domains
2. أضف النطاق الخاص بك
3. اتبع تعليمات DNS

### Netlify:
1. Domain settings → Add custom domain
2. أضف سجلات DNS

## ✅ قائمة مراجعة قبل النشر

- [ ] تم اختبار جميع المميزات محلياً
- [ ] تم إضافة API key في متغيرات البيئة
- [ ] تم تحديث كلمة المرور الافتراضية
- [ ] تم اختبار الواجهة الصوتية
- [ ] تم اختبار محرر البيانات
- [ ] تم تقييد API key على النطاق المستهدف
- [ ] تم اختبار على أجهزة مختلفة
- [ ] تم اختبار على متصفحات مختلفة

## 📞 الدعم الفني

للمشاكل والأسئلة:
- افتح Issue على GitHub
- راجع [README.md](./README.md)
- تحقق من console logs في المتصفح

---

**تم التحديث:** 2026-01-08
