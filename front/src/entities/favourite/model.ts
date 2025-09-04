import { Product } from '../product/model';

export interface Favourite {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  dateAdded: string;
}

export interface FavouritesList {
  items: Favourite[];
  total: number;
}

export interface AddToFavouritesRequest {
  productId: string;
}

export interface RemoveFromFavouritesRequest {
  productId: string;
}
