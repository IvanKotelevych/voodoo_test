const BASE_URL = 'https://voodoo-sandbox.myshopify.com/products.json';

const products = {
  array: [],
  limit: 24,
  page: 1,
  selectedProducts: [],
}

function wait(delay) {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
}

function request(url, method = 'GET', data = null) {
  const options = { method };

  if (data) {
    options.body = JSON.stringify(data);
    options.headers = {
      'Content-Type': 'application/json; charset=UTF-8',
    };
  }

  return wait(0)
    .then(() => fetch(BASE_URL + url, options))
    .then(response => response.json());
}

const client = {
  get: (url) => request(url),
  post: (url, data) => request(url, 'POST', data),
  patch: (url, data) => request(url, 'PATCH', data),
  delete: (url) => request(url, 'DELETE'),
};

client.get('?limit=461')
  .then(data => {
    products.array.push(...data.products);
    renderCounter(products);
    renderVisibleProd(products);
  })
  .catch(() => console.error('Something went wrong!'));


// render page //

const prodEl = document.getElementById('products');
const countEl = document.getElementById('counter')

function renderVisibleProd(obj) {
  obj.visibleArray = obj.array.slice((obj.page - 1) * obj.limit, obj.page * obj.limit);

  let visibleProducts = '';

  obj.visibleArray.map((item, i) => {
    visibleProducts += `
      <div class="flex gap-3 flex-col justify-between">
        <div class="relative h-[276px] w-full">
          <img src="${item.images.length ? item.images[0].src : ''}" class="w-full object-cover h-full bg-slate-100 border-black border-[1px] rounded" alt="product">
        
          <div class="absolute top-3 left-3 p-2 bg-black rounded text-white">
            <p class="flex text-xs leading-none items-center justify-center">USED</p>
          </div>
        </div>
        
        <div class="flex justify-between text-sm">
          <div class="font-bold">
            <h1 class="">${item.title}</h1>
            <h1 class="">${item.variants[0].price} KR.</h1>
          </div>
        
          <div class="text-right">
            <h1 class="font-medium">Condition</h1>
            <h1 class="font-normal">Slightly used</h1>
          </div>
        </div>
        
        <button
          class="w-full p-4 ${item.active ? 'bg-lime-900' : 'bg-black'} rounded text-white uppercase leading-none hover:shadow-md transition duration-300"
          onclick="addProduct(${item.id})"
        >
          add to cart
        </button>
      </div>
    `;
  });

  prodEl.innerHTML = visibleProducts;
}

function renderCounter(obj) {
  const totalCount = Math.ceil(obj.array.length / obj.limit);
  const arr = [];

  for (i = 1; i <= totalCount; i++) {
    if (i === obj.page) {
      arr.push({num: i, main: true});
    } else {
      arr.push({num: i, main: false});
    }
  }

  let visibleCount = '';

  formatArray(arr).map((item, i) => {
    visibleCount += `
      <button
        class="w-[39px] h-[39px] border-black border-[1px] rounded-full hover:shadow-md transition duration-300${item.main ? ' bg-black text-white' : ''}"
        onclick="changePage('${item.num}', ${i})"
      >
        ${item.num}
      </button>
    `;
  })

  countEl.innerHTML = visibleCount;
}

function changePage(number, i) {
  const page = products.page;
  const totalCount = Math.ceil(products.array.length / products.limit);

  if (number !== '...') {
    products.page = +number;
  } else if (i === 1) {
    products.page = Math.ceil(page / 2);
  } else {
    products.page = page + Math.floor((totalCount - page) / 2);
  }

  renderCounter(products);
  renderVisibleProd(products);

  window.scrollTo(0, 220);
}

function addProduct(id) {
  if (!products.selectedProducts.find((item) => item.id === id)) {
    const add = products.array.find((item) => item.id === id);
    add.count = 1;
    add.active = true;
    products.selectedProducts.push(add);

    renderCart(products);
    renderVisibleProd(products);
  }
}

function formatArray(arr) {
  const mainIndex = arr.findIndex(item => item.main === true);
  const result = [];
  
  if (mainIndex !== -1) {
    result.push(arr[0]);

    if (mainIndex < 4) {
      result.push(...arr.slice(1, 5), {num: '...', main: false}, arr[arr.length - 1]);
    } else if (mainIndex > arr.length - 5) {
      result.push({num: '...', main: false}, ...arr.slice(arr.length - 5, arr.length));
    } else {
      result.push({num: '...', main: false}, ...arr.slice(mainIndex - 1, mainIndex + 2), {num: '...', main: false}, arr[arr.length - 1])
    }
  }
  
  return result;
}

const cartEl = document.getElementById('cart');
const shopCartEl = document.getElementById('shopping-cart');
const closeCartEl = document.getElementById('close-cart');
const cartListEl = document.getElementById('cart-list');
const totalPriceEl = document.getElementById('total-price');

if(cartEl) {
  cartEl.addEventListener('click', function() {
    shopCartEl.classList.remove("translate-x-full");
    document.body.classList.add('h-screen', 'overflow-hidden');
  })
}

if(closeCartEl) {
  closeCartEl.addEventListener('click', function() {
    shopCartEl.classList.add("translate-x-full");
    document.body.classList.remove('h-screen', 'overflow-hidden');
  })
}

function renderCart(obj) {
  let visibleCart = '';

  obj.selectedProducts.map((item, i) => {
    visibleCart += `
    <div class="flex justify-between gap-[18px]">
      <div class="flex gap-[18px]">
        <img
          src="${item.images.length ? item.images[0].src : ''}"
          class="object-cover bg-slate-100 border-black border-[1px] rounded h-[74px] w-[74px]"
          alt="product"
        >
        <div class="flex flex-col gap-1 justify-between font-bold max-w-[232px] leading-none">
          <h1 class="">${item.title}</h1>
          <h1 class="">${(item.variants[0].price * item.count).toFixed(2)} KR.</h1>
          <div class="flex min-w-[60px] max-w-[100px]">
            <button
              class="w-5 h-5"
              onclick="minusCountToCart(${i})"
            >-</button>
            <input
              type="text"
              class="text-center max-w-[40px] h-5 bg-inherit"
              value="${item.count}"
              onchange="changeCountToCart(${i}, event.target.value)"
            >
            <button
              class="w-5 h-5"
              onclick="plusCountToCart(${i})"
            >+</button>
          </div>
        </div>
      </div>

      <img
        class="cursor-pointer h-6" src="/images/icons/delete.svg"
        alt="delete product"
        onclick="deleteProd(${i})"
      >
    </div>
  `;
  });

  cartListEl.innerHTML = visibleCart;

  if (!visibleCart) {
    cartListEl.innerHTML = 'Shopping cart is Empty'
  }

  renderTotalPrice(products);
}

function renderTotalPrice(obj) {
  totalPriceEl.innerHTML = `${getTotalPrice(obj.selectedProducts)}`;
}

function getTotalPrice(arr) {
  let resultCost = 0;

  for (let i  = 0; i < arr.length; i++) {
    resultCost += arr[i].count * arr[i].variants[0].price;
  }

  return resultCost.toFixed(2);
}

function plusCountToCart(id) {
  products.selectedProducts[id].count++;

  renderCart(products);
}

function minusCountToCart(id) {
  if (products.selectedProducts[id].count > 0) {
    products.selectedProducts[id].count--;
  }

  renderCart(products)
}

function changeCountToCart(id, number) {
  if (number >= 0) {
    products.selectedProducts[id].count = number;
  }

  renderCart(products)
}

function deleteProd(id) {
  products.selectedProducts[products.selectedProducts.indexOf(products.selectedProducts[id])].active = false;

  products.selectedProducts.splice(id, 1);

  renderCart(products);
  renderVisibleProd(products);
}
