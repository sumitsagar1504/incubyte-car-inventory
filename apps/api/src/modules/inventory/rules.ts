import { HttpError } from '../../utils/errors.js';

export function validatePurchase(stock: number, quantity: number): number {
  if (!Number.isInteger(quantity) || quantity < 1) throw new HttpError(400, 'Quantity must be a positive integer');
  if (quantity > stock) throw new HttpError(409, 'Insufficient stock');
  return stock - quantity;
}
