const ADD_TO_CART = 'ADD_TO_CART';
const REMOVE_ONE = 'REMOVE_ONE';
const EMPTY_CART = 'EMPTY_CART';
const GET_ITEMS_FROM_SERVER = 'GET_ITEMS_FROM_SERVER';
const UPDATE_STOCK = 'UPDATE_STOCK';

function addToCart(itemSku) {
  return {
    type: ADD_TO_CART,
    itemSku,
  };
}

function removeOne(itemSku) {
  return {
    type: REMOVE_ONE,
    itemSku,
  };
}

function emptyCart() {
  return {
    type: EMPTY_CART,
  };
}

function getItemsFromServer(items) {
  return {
    type: GET_ITEMS_FROM_SERVER,
    items,
  };
}

function updateStock(items) {
  return {
    type: UPDATE_STOCK,
    items,
  };
}

export {
  ADD_TO_CART,
  REMOVE_ONE,
  EMPTY_CART,
  GET_ITEMS_FROM_SERVER,
  UPDATE_STOCK,
  getItemsFromServer,
  emptyCart,
  addToCart,
  removeOne,
  updateStock,
};
