import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from '../../entities';
import { CartAPI } from '../../shared/api';

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  lastAddedItem: CartItem | null;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
  lastAddedItem: null,
};

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      return await CartAPI.getCart();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (request: AddToCartRequest, { rejectWithValue }) => {
    try {
      const cart = await CartAPI.addToCart(request);
      const addedItem = cart.items.find(item => item.productId === request.productId);
      return { cart, addedItem };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async (request: UpdateCartItemRequest, { rejectWithValue }) => {
    try {
      return await CartAPI.updateCartItem(request);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update cart item');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId: string, { rejectWithValue }) => {
    try {
      return await CartAPI.removeFromCart(itemId);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to remove from cart');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      return await CartAPI.clearCart();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to clear cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLastAddedItem: (state) => {
      state.lastAddedItem = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
        state.lastAddedItem = action.payload.addedItem || null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update cart item
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Remove from cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Clear cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearLastAddedItem } = cartSlice.actions;

// Selectors
export const selectCart = (state: { cart: CartState }) => state.cart.cart;
export const selectCartItems = (state: { cart: CartState }) => state.cart.cart?.items || [];
export const selectCartItemCount = (state: { cart: CartState }) => 
  state.cart.cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
export const selectCartTotal = (state: { cart: CartState }) => state.cart.cart?.total || 0;
export const selectCartLoading = (state: { cart: CartState }) => state.cart.loading;
export const selectCartError = (state: { cart: CartState }) => state.cart.error;
export const selectLastAddedItem = (state: { cart: CartState }) => state.cart.lastAddedItem;

export { cartSlice };
