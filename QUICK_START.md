# Quick Start Guide - BProduct

## Prerequisites
- Node.js installed
- Python 3.8+ installed
- All npm dependencies installed in both frontends and admin-backend

## One-Command Setup

### Open 4 Terminal Windows/Tabs

**Terminal 1: FastAPI Backend**
```bash
cd "c:\Users\Berith Ajao\Desktop\BProduct\API"
python -m uvicorn main:app --reload
```

**Terminal 2: Admin Backend**
```bash
cd "c:\Users\Berith Ajao\Desktop\BProduct\admin-backend"
npm start
```

**Terminal 3: User Frontend**
```bash
cd "c:\Users\Berith Ajao\Desktop\BProduct\frontend"
npm run dev
```

**Terminal 4: Admin Frontend**
```bash
cd "c:\Users\Berith Ajao\Desktop\BProduct\admin-frontend"
npm run dev
```

---

## Access Points

| App | URL | Credentials |
|-----|-----|-------------|
| Admin Panel | http://localhost:5174 | admin@example.com / admin123 |
| User App | http://localhost:5173 | Create an account |
| FastAPI Docs | http://localhost:8000/docs | - |

---

## What Works

✅ **Admin Panel**
- Login with admin@example.com / admin123
- Dashboard showing stats
- Create/list/delete products
- Manage users (list, promote, delete)
- Moderate posts (list, delete)  
- Manage orders (list, update status)

✅ **User Application**
- Register new account
- Login with credentials
- Browse products with search/filter
- Add products to cart
- Checkout (create orders)
- Create posts
- Comment on posts
- Leave product reviews
- Manage profile

✅ **Shared Database**
- SQLite database shared between both backends
- All data persists across app restarts

---

## Typical User Flow

### As Admin
1. Go to http://localhost:5174
2. Login: admin@example.com / admin123
3. View dashboard stats
4. Create products in "Products" page
5. Monitor users and orders
6. Moderate community posts

### As Regular User
1. Go to http://localhost:5173
2. Click "Create account"
3. Register with email and password
4. Browse products on dashboard
5. Add products to cart
6. Complete checkout
7. View orders in "Orders" page
8. Create posts in "My Posts"
9. Browse community feed

---

## Troubleshooting

**Q: Admin login fails**
A: Make sure:
- Admin backend is running (port 3001)
- FastAPI is running (port 8000)
- SECRET_KEY in both .env files match

**Q: Products not saving**
A: Check Node.js terminal for errors. System user (system@shop.local) is created automatically.

**Q: Can't see products created by admin**
A: Products created by admin are linked to "System" user. If filtering by user_id, check they're there.

**Q: Images not loading**
A: In admin products, images are set to "placeholder". For user products, ensure uploads folder exists and has proper permissions.

**Q: Registration fails**
A: Check email isn't already registered. Error messages show which field has the issue.

**Q: CORS errors in browser console**
A: Both port 5173 and 5174 are allowed in CORS. Restart FastAPI if it was running before CORS was fixed.

---

## Key Features

**Admin Features:**
- Full dashboard with real-time stats
- Product inventory management
- User promotion to admin
- Community moderation
- Order fulfillment tracking

**User Features:**
- Full e-commerce flow (browse → cart → checkout)
- Community posts and discussions
- Product reviews and comments
- User profile with avatar upload
- Order history tracking

**Shared:**
- Authentication with JWT tokens
- Shared SQLite database
- Responsive UI on desktop and mobile
- Real-time data updates with React Query
- Clear error messages

---

## Next Steps After This Works

1. **Deploy to Production**
   - Use a production database (PostgreSQL recommended)
   - Set proper environment variables
   - Use HTTPS
   - Configure CORS for production domains

2. **Add Features**
   - Payment processing (Stripe/PayPal)
   - Email notifications
   - Advanced search/filtering
   - Wishlist feature
   - Shipping integration

3. **Optimize**
   - Add caching
   - Image optimization
   - Database indexing
   - CDN for static files
   - Analytics tracking

---

## Support

Check the TESTING_GUIDE.md for detailed testing checklist and endpoint reference.
