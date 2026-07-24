import { environment } from "../../environments/environment.prod";



export const API_CONFIG = {
  baseUrl: environment.apiUrl,
  auth: 'auth',
  product: 'product',
  category: 'category',
  order: 'order',
  user: 'user',
};