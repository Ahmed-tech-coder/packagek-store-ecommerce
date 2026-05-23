import { create } from 'zustand';

interface Book {
  id: string;
  title: string;
  price: number;
  image?: string;
  [key: string]: any;
}

interface CartItem extends Book {
  quantity: number;
}

interface StoreState {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Cart
  cart: CartItem[];
  addToCart: (book: Book, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
}

//  Helper functions
const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (cart: CartItem[]) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch {
    console.error('Failed to save cart');
  }
};

export const useStore = create<StoreState>()((set, get) => {
  const savedTheme =
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  document.documentElement.classList.toggle('dark', savedTheme === 'dark');

  const initialCart = loadCartFromStorage();

  return {
    // ===== Theme =====
    theme: savedTheme,
    toggleTheme: () =>
      set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        return { theme: newTheme };
      }),
    setTheme: (theme) => {
      localStorage.setItem('theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
      set({ theme });
    },

    // ===== Cart =====
    cart: initialCart,

    addToCart: (book, quantity = 1) =>
      set((state) => {
        const existing = state.cart.find((item) => item.id === book.id);
        let newCart;
        if (existing) {
          newCart = state.cart.map((item) =>
            item.id === book.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newCart = [...state.cart, { ...book, quantity }];
        }
        saveCartToStorage(newCart);
        return { cart: newCart };
      }),

    removeFromCart: (id) =>
      set((state) => {
        const newCart = state.cart.filter((item) => item.id !== id);
        saveCartToStorage(newCart);
        return { cart: newCart };
      }),

    updateQuantity: (id, quantity) =>
      set((state) => {
        const newCart = state.cart.map((item) =>
          item.id === id ? { ...item, quantity } : item
        );
        saveCartToStorage(newCart);
        return { cart: newCart };
      }),

    clearCart: () => {
      localStorage.removeItem('cart');
      set({ cart: [] });
    },

    cartTotal: () =>
      get().cart.reduce((total, item) => total + item.price * item.quantity, 0),
  };
});
