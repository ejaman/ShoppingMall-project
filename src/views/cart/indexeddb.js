const texterDB = indexedDB.open("texterDB", 1);
texterDB.onupgradeneeded = async () => {
  const database = texterDB.result;
  const cartStore = database.createObjectStore("cart", {
    keyPath: "id",
    autoIncrement: true,
  });
  const orderStore = database.createObjectStore("order", {
    keyPath: "id",
    autoIncrement: true,
  });
  orderStore.put({
    name: "cart-order",
    totalPrice: 0,
    totalQuantity: 0,
    orderedBooks: [],
  });
  orderStore.put({
    name: "buynow-order",
    totalPrice: 0,
    totalQuantity: 0,
    orderedBooks: [],
  });
};
const getCartItem = async () => {
  const data = new Promise((resolve, reject) => {
    const database = texterDB.result;
    const transaction = database.transaction("cart", "readwrite");
    const cart = transaction.objectStore("cart");
    const request = cart.getAll();
    request.onerror = () => {
      reject(request.error);
      console.log("error getting data from the store");
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
  return Promise.resolve(data);
};
const getOrderItem = async () => {
  const data = new Promise((resolve, reject) => {
    const database = texterDB.result;
    const transaction = database.transaction("order", "readwrite");
    const order = transaction.objectStore("order");
    const request = order.getAll();
    request.onerror = () => {
      reject(request.error);
      console.log("error getting data from the store");
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
  return Promise.resolve(data);
};
const getCartItemByID = async (id) => {
  const data = new Promise((resolve, reject) => {
    const database = texterDB.result;
    const transaction = database.transaction("cart", "readwrite");
    const cart = transaction.objectStore("cart");
    const request = cart.get(id);
    request.onerror = () => {
      reject(request.error);
      console.log("error getting data from the store");
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
  return Promise.resolve(data);
};
const clearCart = () => {
  const database = texterDB.result;
  const transaction = database.transaction("cart", "readwrite");
  const cart = transaction.objectStore("cart");
  cart.clear();
};

const getCartisEmpty = async () => {
  const data = await getCartItem();
  return data.length === 0 ? true : false;
};
export {
  getCartItem,
  getCartItemByID,
  getOrderItem,
  clearCart,
  getCartisEmpty,
};
