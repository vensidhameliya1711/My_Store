"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

function setCookie(name, value, days = 7) {
  if (typeof document === 'undefined') return;
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Lax`;
}

export function CartProvider({ children, initialCart = [], initialOrders = [], initialWishlist = [] }) {
  const [cart, setCart] = useState(initialCart);
  const [orders, setOrders] = useState(initialOrders);
  const [wishlist, setWishlist] = useState(initialWishlist);
  const [isMounted, setIsMounted] = useState(false);

  // Sync wishlist to DB helper
  const syncWishlistWithDb = async (newWishlist) => {
    try {
      if (typeof window === 'undefined') return;
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;
      const userObj = JSON.parse(storedUser);
      if (!userObj?._id) return;

      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userObj._id,
          items: newWishlist,
        }),
      });
    } catch (err) {
      console.error("Failed to sync wishlist to DB:", err);
    }
  };

  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          if (userObj?._id) {
            fetch(`/api/wishlist?userId=${userObj._id}`)
              .then((res) => {
                if (!res.ok) {
                  throw new Error(`HTTP error ${res.status}`);
                }
                return res.json();
              })
              .then((data) => {
                if (data.success && Array.isArray(data.items)) {
                  setWishlist(data.items);
                  setCookie('wishlist', JSON.stringify(data.items));
                }
              })
              .catch((err) => console.error("Error loading DB wishlist:", err.message));

            fetch(`/api/orders?userId=${userObj._id}`)
              .then((res) => {
                if (!res.ok) {
                  throw new Error(`HTTP error ${res.status}`);
                }
                return res.json();
              })
              .then((data) => {
                if (data.success && Array.isArray(data.orders)) {
                  const dbOrders = data.orders.map((dbOrder) => ({
                    id: dbOrder.orderId || dbOrder._id,
                    date: new Date(dbOrder.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }),
                    items: dbOrder.items || [],
                    subtotal: dbOrder.subtotal || 0,
                    discount: dbOrder.discount || 0,
                    shipping: dbOrder.shipping || 0,
                    tax: dbOrder.tax || 0,
                    total: dbOrder.totalAmount || 0,
                    customer: dbOrder.customer || {},
                    paymentMethod: dbOrder.paymentMethod || 'cod',
                    status: dbOrder.status || 'Processing',
                  }));
                  setOrders(dbOrders);
                  setCookie('orders', JSON.stringify(dbOrders));
                }
              })
              .catch((err) => console.error("Error loading DB orders:", err.message));
          }
        } catch (e) {
          console.error("Initialization error:", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      setCookie('cart', JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  useEffect(() => {
    if (isMounted) {
      setCookie('orders', JSON.stringify(orders));
    }
  }, [orders, isMounted]);

  useEffect(() => {
    if (isMounted) {
      setCookie('wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isMounted]);

  const addToCart = (product) => {
    if (!product || product.inStock === false) return;
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const addOrder = (order) => {
    setOrders((prevOrders) => [order, ...prevOrders]);
  };

  const cancelOrder = async (orderId) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: 'Cancelled' } : order
      )
    );

    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: "Cancelled",
        }),
      });
    } catch (err) {
      console.error("Failed to cancel order in DB:", err);
    }
  };

  const toggleWishlist = (product) => {
    setWishlist((prevWishlist) => {
      const exists = prevWishlist.some((item) => item.id === product.id);
      let updatedWishlist;
      if (exists) {
        updatedWishlist = prevWishlist.filter((item) => item.id !== product.id);
      } else {
        updatedWishlist = [...prevWishlist, product];
      }
      syncWishlistWithDb(updatedWishlist);
      return updatedWishlist;
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prevWishlist) => {
      const updatedWishlist = prevWishlist.filter((item) => item.id !== productId);
      syncWishlistWithDb(updatedWishlist);
      return updatedWishlist;
    });
  };

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartItemsCount,
        cartSubtotal,
        orders,
        addOrder,
        cancelOrder,
        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        isMounted,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
