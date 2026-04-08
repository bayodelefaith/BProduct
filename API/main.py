import os
import uuid
from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import select
from jose import JWTError, jwt
from dotenv import load_dotenv

from typing import Optional
from models.user import User, UserCreate, UserRead, UserUpdate, Token, SessionDep, create_db_and_tables
from models.admin import Admin, AdminCreate, AdminRead
from models.post import Post, PostCreate, PostRead, PostUpdate
from models.product import Product, ProductCreate, ProductRead
from models.order import Order, OrderCreate, OrderRead, OrderItem, OrderItemCreate, OrderItemRead
from models.review import Review, ReviewCreate, ReviewRead
from models.comment import Comment, CommentCreate, CommentRead
from auth import hash_password, authenticate_user, authenticate_admin, create_access_token, SECRET_KEY, ALGORITHM
from models.cart import CartItem, CartItemCreate, CartItemRead, CartItemUpdate


from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()



UPLOAD_DIR = "uploads"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # create_db_and_tables()  # Disabled: Alembic handles database migrations now
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    yield


app = FastAPI(lifespan=lifespan)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# ---------------------------------------
# Core Heders
# ---------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ----------------------------------------
# Auth
# ----------------------------------------

def get_current_user(
    session: SessionDep,
    token: str = Depends(oauth2_scheme),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = session.get(User, int(user_id))
    if user is None:
        raise credentials_exception
    return user


@app.post("/register", response_model=UserRead)
def register(user: UserCreate, session: SessionDep):
    try:
        # Check if email already exists
        existing_user = session.exec(
            select(User).where(User.email == user.email)
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        hashed_pw = hash_password(user.password)
        db_user = User(
            name=user.name,
            email=user.email,
            hashed_password=hashed_pw
        )
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        print(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@app.post("/login", response_model=Token)
def login(session: SessionDep, form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password, session)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/me", response_model=UserRead)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user


# ----------------------------------------
# Posts
# ----------------------------------------

@app.post("/posts/", response_model=PostRead)
def create_post(
    post: PostCreate,
    session: SessionDep,
    current_user: User = Depends(get_current_user)
):
    db_post = Post(**post.model_dump(), user_id=current_user.id)
    session.add(db_post)
    session.commit()
    session.refresh(db_post)
    return db_post


@app.get("/posts/", response_model=List[PostRead])
def get_posts(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    category: Optional[str] = None
):
    query = select(Post)
    if search:
        query = query.where(Post.title.contains(search) | Post.content.contains(search))
    if category:
        query = query.where(Post.category == category)
    query = query.offset(skip).limit(limit)
    return session.exec(query).all()


@app.get("/posts/{post_id}", response_model=PostRead)
def get_post(post_id: int, session: SessionDep):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@app.put("/posts/{post_id}", response_model=PostRead)
def update_post(
    post_id: int,
    update_data: PostUpdate,
    session: SessionDep,
    current_user: User = Depends(get_current_user)
):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")

    if update_data.title is not None: post.title = update_data.title
    if update_data.content is not None: post.content = update_data.content
    if update_data.category is not None: post.category = update_data.category

    session.add(post)
    session.commit()
    session.refresh(post)
    return post


@app.delete("/posts/{post_id}")
def delete_post(
    post_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user)
):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    session.delete(post)
    session.commit()
    return {"detail": "Post deleted"}


# ----------------------------------------
# Products
# ----------------------------------------

@app.post("/products/", response_model=ProductRead)
def create_product(
    session: SessionDep,
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    quantity: int = Form(...),
    category: Optional[str] = Form(None),
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    extension = image.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(image.file.read())

    product = Product(
        name=name,
        description=description,
        price=price,
        quantity=quantity,
        category=category,
        image_path=file_path,
        user_id=current_user.id
    )
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@app.get("/products/", response_model=List[ProductRead])
def get_products(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    category: Optional[str] = None
):
    query = select(Product)
    if search:
        query = query.where(Product.name.contains(search) | Product.description.contains(search))
    if category:
        query = query.where(Product.category == category)
    query = query.offset(skip).limit(limit)
    return session.exec(query).all()


@app.get("/products/{product_id}", response_model=ProductRead)
def get_product(product_id: int, session: SessionDep):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.put("/products/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
    name: str = Form(None),
    description: str = Form(None),
    price: float = Form(None),
    quantity: int = Form(None),
    category: Optional[str] = Form(None),
    image: UploadFile = File(None),
):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this product")

    if name: product.name = name
    if description: product.description = description
    if price: product.price = price
    if quantity is not None: product.quantity = quantity
    if category is not None: product.category = category

    if image:
        if os.path.exists(product.image_path):
            os.remove(product.image_path)
        extension = image.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as f:
            f.write(image.file.read())
        product.image_path = file_path

    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user)
):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this product")

    if os.path.exists(product.image_path):
        os.remove(product.image_path)

    session.delete(product)
    session.commit()
    return {"detail": "Product deleted"}


# ----------------------------------------
# Cart
# ----------------------------------------

@app.post("/cart/", response_model=CartItemRead)
def add_to_cart(
    item: CartItemCreate,
    session: SessionDep,
    current_user: User = Depends(get_current_user)
):
    # check product exists and has enough stock
    product = session.get(Product, item.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if item.quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")
    if item.quantity > product.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock")

    # if product already in cart, increase quantity instead
    statement = select(CartItem).where(
        CartItem.user_id == current_user.id,
        CartItem.product_id == item.product_id
    )
    existing = session.exec(statement).first()

    if existing:
        if existing.quantity + item.quantity > product.quantity:
            raise HTTPException(status_code=400, detail="Not enough stock to add more to cart")
        existing.quantity += item.quantity
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing

    cart_item = CartItem(
        product_id=item.product_id,
        quantity=item.quantity,
        user_id=current_user.id
    )
    session.add(cart_item)
    session.commit()
    session.refresh(cart_item)
    return cart_item


@app.get("/cart/", response_model=List[CartItemRead])
def get_cart(session: SessionDep, current_user: User = Depends(get_current_user)):
    statement = select(CartItem).where(CartItem.user_id == current_user.id)
    return session.exec(statement).all()


@app.put("/cart/{item_id}", response_model=CartItemRead)
def update_cart_item(
    item_id: int,
    update: CartItemUpdate,
    session: SessionDep,
    current_user: User = Depends(get_current_user)
):
    cart_item = session.get(CartItem, item_id)
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    if cart_item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if update.quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")

    product = session.get(Product, cart_item.product_id)
    if update.quantity > product.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock")

    cart_item.quantity = update.quantity
    session.add(cart_item)
    session.commit()
    session.refresh(cart_item)
    return cart_item


@app.delete("/cart/{item_id}")
def remove_from_cart(
    item_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user)
):
    cart_item = session.get(CartItem, item_id)
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    if cart_item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    session.delete(cart_item)
    session.commit()
    return {"detail": "Item removed from cart"}


@app.delete("/cart/")
def clear_cart(session: SessionDep, current_user: User = Depends(get_current_user)):
    statement = select(CartItem).where(CartItem.user_id == current_user.id)
    items = session.exec(statement).all()
    for item in items:
        session.delete(item)
    session.commit()
    return {"detail": "Cart cleared"}

def get_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# promote a user to admin (be careful with this route in production)
@app.patch("/admin/users/{user_id}/make-admin", response_model=UserRead)
def make_admin(user_id: int, session: SessionDep, current_user: User = Depends(get_admin_user)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_admin = True
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@app.get("/admin/users", response_model=List[UserRead])
def admin_get_users(session: SessionDep, current_user: User = Depends(get_admin_user)):
    return session.exec(select(User)).all()


@app.delete("/admin/users/{user_id}")
def admin_delete_user(user_id: int, session: SessionDep, current_user: User = Depends(get_admin_user)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(user)
    session.commit()
    return {"detail": "User deleted"}


@app.get("/admin/products", response_model=List[ProductRead])
def admin_get_products(session: SessionDep, current_user: User = Depends(get_admin_user)):
    return session.exec(select(Product)).all()


@app.delete("/admin/products/{product_id}")
def admin_delete_product(product_id: int, session: SessionDep, current_user: User = Depends(get_admin_user)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if os.path.exists(product.image_path):
        os.remove(product.image_path)
    session.delete(product)
    session.commit()
    return {"detail": "Product deleted"}


# ----------------------------------------
# User Profile
# ----------------------------------------

@app.put("/users/me", response_model=UserRead)
def update_me(
    update_data: UserUpdate,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    if update_data.name: current_user.name = update_data.name
    if update_data.bio: current_user.bio = update_data.bio
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user

@app.post("/users/me/avatar", response_model=UserRead)
def upload_avatar(
    session: SessionDep,
    avatar: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    extension = avatar.filename.split(".")[-1]
    filename = f"avatar_{uuid.uuid4()}.{extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(avatar.file.read())

    if current_user.avatar_url and os.path.exists(current_user.avatar_url):
        os.remove(current_user.avatar_url)

    current_user.avatar_url = file_path
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user

# ----------------------------------------
# Orders
# ----------------------------------------

@app.post("/orders/", response_model=OrderRead)
def create_order(
    session: SessionDep,
    current_user: User = Depends(get_current_user)
):
    # Create order from cart
    statement = select(CartItem).where(CartItem.user_id == current_user.id)
    cart_items = session.exec(statement).all()
    
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
        
    total_price = 0.0
    db_items = []
    
    for item in cart_items:
        product = session.get(Product, item.product_id)
        if product.quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {product.name}")
        
        # Decrease stock
        product.quantity -= item.quantity
        session.add(product)
        
        total_price += product.price * item.quantity
        db_items.append(OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            price=product.price
        ))
        
        # Remove from cart
        session.delete(item)
        
    order = Order(
        user_id=current_user.id,
        total_price=total_price,
        status="pending"
    )
    session.add(order)
    session.commit()
    session.refresh(order)
    
    for db_item in db_items:
        db_item.order_id = order.id
        session.add(db_item)
        
    session.commit()
    session.refresh(order)
    return order

@app.get("/orders/", response_model=List[OrderRead])
def get_orders(session: SessionDep, current_user: User = Depends(get_current_user)):
    statement = select(Order).where(Order.user_id == current_user.id).order_by(Order.created_at.desc())
    return session.exec(statement).all()

@app.get("/admin/orders", response_model=List[OrderRead])
def admin_get_orders(session: SessionDep, current_user: User = Depends(get_admin_user)):
    return session.exec(select(Order).order_by(Order.created_at.desc())).all()

@app.patch("/admin/orders/{order_id}/status", response_model=OrderRead)
def admin_update_order_status(
    order_id: int, 
    session: SessionDep, 
    status: str = Form(...),
    current_user: User = Depends(get_admin_user)
):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status
    session.add(order)
    session.commit()
    session.refresh(order)
    return order

# ----------------------------------------
# Reviews
# ----------------------------------------

@app.post("/products/{product_id}/reviews", response_model=ReviewRead)
def create_review(
    product_id: int,
    review: ReviewCreate,
    session: SessionDep,
    current_user: User = Depends(get_current_user)
):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    db_review = Review(
        **review.model_dump(exclude={"product_id"}), 
        user_id=current_user.id,
        product_id=product_id
    )
    session.add(db_review)
    session.commit()
    session.refresh(db_review)
    return db_review

@app.get("/products/{product_id}/reviews", response_model=List[ReviewRead])
def get_reviews(product_id: int, session: SessionDep):
    statement = select(Review).where(Review.product_id == product_id).order_by(Review.created_at.desc())
    return session.exec(statement).all()

# ----------------------------------------
# Comments
# ----------------------------------------

@app.post("/posts/{post_id}/comments", response_model=CommentRead)
def create_comment(
    post_id: int,
    comment: CommentCreate,
    session: SessionDep,
    current_user: User = Depends(get_current_user)
):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    db_comment = Comment(
        **comment.model_dump(exclude={"post_id"}),
        user_id=current_user.id,
        post_id=post_id
    )
    session.add(db_comment)
    session.commit()
    session.refresh(db_comment)
    return db_comment

@app.get("/posts/{post_id}/comments", response_model=List[CommentRead])
def get_comments(post_id: int, session: SessionDep):
    statement = select(Comment).where(Comment.post_id == post_id).order_by(Comment.created_at.asc())
    return session.exec(statement).all()

@app.post("/posts/{post_id}/like", response_model=PostRead)
def like_post(post_id: int, session: SessionDep, current_user: User = Depends(get_current_user)):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.likes += 1
    session.add(post)
    session.commit()
    session.refresh(post)
    return post