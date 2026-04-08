# BProduct - Complete Testing Guide

## System Architecture

**Backend:**
- FastAPI (Port 8000) - User API + Core services
- Node.js Express (Port 3001) - Admin Backend
- SQLite Database - Shared between both backends

**Frontend:**
- User App (Port 5173) - React + Vite
- Admin App (Port 5174) - React + Vite

**Authentication:**
- Both backends use same SECRET_KEY for JWT validation
- Admin credentials: admin@example.com / admin123
- Test users can be created via registration

---

## Starting All Services

### 1. Start FastAPI Backend (Port 8000)
```bash
cd c:/Users/Berith\ Ajao/Desktop/BProduct/API
python -m uvicorn main:app --reload
```

### 2. Start Node.js Admin Backend (Port 3001)
```bash
cd c:/Users/Berith\ Ajao/Desktop/BProduct/admin-backend
npm start
# OR npm run dev
```

### 3. Start User Frontend (Port 5173)
```bash
cd c:/Users/Berith\ Ajao/Desktop/BProduct/frontend
npm run dev
```

### 4. Start Admin Frontend (Port 5174)
```bash
cd c:/Users/Berith\ Ajao/Desktop/BProduct/admin-frontend
npm run dev
```

---

## Testing Checklist

### Admin Panel (http://localhost:5174)

- [ ] **Login Page**
  - Email: `admin@example.com`
  - Password: `admin123`
  - Should show success message and redirect to dashboard

- [ ] **Dashboard**
  - Should display 4 stats cards: Users, Products, Posts, Orders
  - Stats should be numbers fetched from `/api/stats`
  - Should be accessible only when logged in

- [ ] **Products Management**
  - [ ] Click "New Product" button
  - [ ] Fill in: Name, Category, Price, Quantity, Description
  - [ ] Click "Save to Inventory"
  - [ ] Product should appear in the table below
  - [ ] Delete button should remove product
  - [ ] List should be refreshed automatically after create/delete

- [ ] **Users Management**
  - [ ] Table should show all users with ID, Name, Email, Role
  - [ ] Click promote button (shield icon) to make user admin
  - [ ] Click delete button (trash icon) to remove user
  - [ ] Confirm dialogs should appear before actions

- [ ] **Posts Management**
  - [ ] Table should show all community posts
  - [ ] Each post shows: Author, Title, Content, Delete option
  - [ ] Delete button removes post from platform
  - [ ] "All caught up" message when no posts exist

- [ ] **Orders Management**
  - [ ] Table shows all orders: Order ID, Customer, Total, Date, Status
  - [ ] Status dropdown allows: Pending → Shipped → Delivered → Cancelled
  - [ ] Status updates immediately when changed
  - [ ] No orders message when empty

---

### User App (http://localhost:5173)

- [ ] **Register Page**
  - [ ] Fill in: Full Name, Email, Password
  - [ ] Click "Create account"
  - [ ] Should show: "Email already registered" if email exists
  - [ ] Should redirect to /login on success
  - [ ] Link to "Sign in" works

- [ ] **Login Page**
  - [ ] Enter registered email and password
  - [ ] Should show error if credentials wrong
  - [ ] Should redirect to products page on success
  - [ ] "Create account" link works

- [ ] **Navbar**
  - [ ] Logo/brand name visible
  - [ ] Links to Products, Feed, My Posts, Cart (when logged in)
  - [ ] Profile link shows after login
  - [ ] Logout clears token

- [ ] **Products Page** (/products)
  - [ ] Grid of products with images
  - [ ] Search box filters by name/description
  - [ ] Category dropdown filters by category
  - [ ] "Out of stock" badge shows when quantity = 0
  - [ ] Click product → goes to detail page

- [ ] **Product Detail** (/products/:id)
  - [ ] Shows full product info: image, name, description, price, stock
  - [ ] "Add to Cart" button adds item to cart
  - [ ] Quantity selector works (- and + buttons)
  - [ ] "Add to Cart" shows success toast
  - [ ] Reviews section shows existing reviews
  - [ ] Can add new review with rating and comment
  - [ ] "Back" button returns to products

- [ ] **Cart** (/cart)
  - [ ] Shows all items added to cart
  - [ ] Each item shows: Product name, quantity, total price
  - [ ] Delete button removes individual item
  - [ ] "Clear all" button empties cart
  - [ ] "Checkout" button creates order and redirects to /orders
  - [ ] Empty cart message when no items

- [ ] **Orders** (/orders)
  - [ ] Shows all user's orders with: Order ID, Date, Status, Total Price
  - [ ] Each order can be expanded to show items
  - [ ] Status badge colors: yellow=pending, blue=shipped, green=delivered
  - [ ] "Start Shopping" link sends to products
  - [ ] No orders message when empty

- [ ] **Feed** (/posts or /feed)
  - [ ] Shows all community posts
  - [ ] Search filters by title/content
  - [ ] Category dropdown filters posts
  - [ ] Each post shows: Author, Title, Content snippet
  - [ ] Click post → goes to detail page
  - [ ] Pagination works if implemented

- [ ] **Post Detail** (/posts/:id)
  - [ ] Shows full post: Title, Category, Content
  - [ ] "❤ Likes" button works (requires login)
  - [ ] Comments section shows all comments
  - [ ] Can add new comment if logged in
  - [ ] "Back to Feed" button returns to feed

- [ ] **My Posts** (/my-posts)
  - [ ] Shows only current user's posts
  - [ ] "Create Post" button opens form
  - [ ] Can create post with title, content, category
  - [ ] Edit button opens post in edit mode
  - [ ] Delete button removes post
  - [ ] Posts update immediately after create/edit/delete

- [ ] **Profile** (/profile)
  - [ ] Shows user avatar, name, email, bio
  - [ ] Edit button allows changing name and bio
  - [ ] Avatar upload works (click profile pic)
  - [ ] Profile updates immediately
  - [ ] Incorrect API endpoints show clear errors

---

## Common Issues & Fixes

### Issue: "Invalid token" in admin panel
**Fix:** Restart admin-backend server - ensure SECRET_KEY matches FastAPI

### Issue: Products not saving
**Fix:** Check Node.js terminal for errors. System user must be created.

### Issue: CORS errors
**Fix:** Both frontends should be added to CORS allow_origins in FastAPI

### Issue: Orders not showing items
**Fix:** Ensure Order model includes relationship with items in response

### Issue: Avatar/Images not loading  
**Fix:** Check uploads folder exists. Images saved as files should load from /uploads/

---

## Key API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| /register | POST | No | Create new user |
| /login | POST | No | User login |
| /me | GET | Yes | Get current user |
| /products/ | GET | No | List products |
| /products/{id} | GET | No | Get product details |
| /cart/ | GET/POST | Yes | Get/add cart items |
| /orders/ | GET/POST | Yes | List/create orders |
| /posts/ | GET/POST | Yes | List/create posts |
| /posts/{id}/comments | GET/POST | Yes | List/add comments |
| /products/{id}/reviews | GET/POST | Yes | List/add reviews |
| /users/me | PUT | Yes | Update profile |
| /admin/login | POST | No | Admin login |
| /api/stats | GET | Admin | Get platform stats |
| /api/users | GET | Admin | List all users |
| /api/products | GET/POST | Admin | Admin product operations |
| /api/orders | GET | Admin | List all orders |

---

## Database Models

- **User**: email (unique), name, bio, avatar_url, is_admin, hashed_password
- **Admin**: email (unique), name, hashed_password (separate from User)
- **Product**: name, description, price, quantity, category, image_path, user_id
- **Order**: user_id, total_price, status, created_at
- **OrderItem**: order_id, product_id, quantity, price
- **Post**: title, content, category, likes, user_id
- **Comment**: content, user_id, post_id, created_at
- **Review**: rating, comment, user_id, product_id, created_at
- **CartItem**: product_id, quantity, user_id

---

## Success Criteria

✅ All tests pass with green checkmarks
✅ No console errors (F12 Console tab)
✅ No server errors (terminal logs clean)
✅ Data persists after page reload
✅ Logout and re-login works
✅ Admin and regular user flows are separate
✅ Forms show clear error messages
✅ Loading states show while fetching
✅ Toast notifications appear for actions
