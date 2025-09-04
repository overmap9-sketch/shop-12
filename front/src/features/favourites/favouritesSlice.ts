import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Favourite, Product } from '../../entities';
import { Storage, STORAGE_KEYS } from '../../shared/lib/storage';
import { ProductsAPI } from '../../shared/api';

interface FavouritesState {
  items: Favourite[];
  loading: boolean;
  error: string | null;
}

const initialState: FavouritesState = {
  items: [],
  loading: false,
  error: null,
};

// Mock delay for API simulation
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Async thunks
export const fetchFavourites = createAsyncThunk(
  'favourites/fetchFavourites',
  async (_, { rejectWithValue }) => {
    try {
      await delay();
      const favouriteIds = Storage.get<string[]>(STORAGE_KEYS.FAVOURITES, []);
      const favourites: Favourite[] = [];

      for (const productId of favouriteIds) {
        const product = await ProductsAPI.getProduct(productId);
        if (product) {
          favourites.push({
            id: `fav_${productId}`,
            userId: 'current_user', // In real app, get from auth
            productId,
            product,
            dateAdded: new Date().toISOString(),
          });
        }
      }

      return favourites;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch favourites');
    }
  }
);

export const addToFavourites = createAsyncThunk(
  'favourites/addToFavourites',
  async (productId: string, { rejectWithValue, getState }) => {
    try {
      await delay();
      
      const product = await ProductsAPI.getProduct(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if already in favourites
      const state = getState() as { favourites: FavouritesState };
      const exists = state.favourites.items.some(item => item.productId === productId);
      if (exists) {
        throw new Error('Product already in favourites');
      }

      // Add to localStorage
      const favouriteIds = Storage.get<string[]>(STORAGE_KEYS.FAVOURITES, []);
      if (!favouriteIds.includes(productId)) {
        favouriteIds.push(productId);
        Storage.set(STORAGE_KEYS.FAVOURITES, favouriteIds);
      }

      const favourite: Favourite = {
        id: `fav_${productId}`,
        userId: 'current_user',
        productId,
        product,
        dateAdded: new Date().toISOString(),
      };

      return favourite;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add to favourites');
    }
  }
);

export const removeFromFavourites = createAsyncThunk(
  'favourites/removeFromFavourites',
  async (productId: string, { rejectWithValue }) => {
    try {
      await delay();
      
      // Remove from localStorage
      const favouriteIds = Storage.get<string[]>(STORAGE_KEYS.FAVOURITES, []);
      const updatedIds = favouriteIds.filter(id => id !== productId);
      Storage.set(STORAGE_KEYS.FAVOURITES, updatedIds);

      return productId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to remove from favourites');
    }
  }
);

export const clearFavourites = createAsyncThunk(
  'favourites/clearFavourites',
  async (_, { rejectWithValue }) => {
    try {
      await delay();
      Storage.set(STORAGE_KEYS.FAVOURITES, []);
      return [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to clear favourites');
    }
  }
);

const favouritesSlice = createSlice({
  name: 'favourites',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch favourites
      .addCase(fetchFavourites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavourites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFavourites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add to favourites
      .addCase(addToFavourites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToFavourites.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(addToFavourites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Remove from favourites
      .addCase(removeFromFavourites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromFavourites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.productId !== action.payload);
      })
      .addCase(removeFromFavourites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Clear favourites
      .addCase(clearFavourites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearFavourites.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
      })
      .addCase(clearFavourites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = favouritesSlice.actions;

// Selectors
export const selectFavourites = (state: { favourites: FavouritesState }) => state.favourites.items;
export const selectFavouritesLoading = (state: { favourites: FavouritesState }) => state.favourites.loading;
export const selectFavouritesError = (state: { favourites: FavouritesState }) => state.favourites.error;
export const selectIsFavourite = (productId: string) => (state: { favourites: FavouritesState }) =>
  state.favourites.items.some(item => item.productId === productId);
export const selectFavouritesCount = (state: { favourites: FavouritesState }) => state.favourites.items.length;

export { favouritesSlice };
