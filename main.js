let products = [];
Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

function deleteDelegate(a) {
  return function(){
    deleteItem(a)
  }
}

async function deleteItem(productId) {
  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex >= 0) {
    products.splice(productIndex, 1);
    const productDiv = document.getElementById(`product-${productId}`);
    productDiv.remove();
    refresh();
    calculate();
    await chrome.storage.local.set({'products': JSON.stringify(products)});
  }
}

document.querySelector('#remove-all').addEventListener('click', async function(event) {
  event.stopPropagation();
  products = [];
  let productsContainer = document.getElementById('product-container');
  productsContainer.innerHTML = '';
  refresh();
  calculate();
  await chrome.storage.local.set({'products': JSON.stringify(products)});
});


function calculateDelegate() {
  return function(){
    calculate()
  }
}

async function calculate() {
  const forms = document.querySelectorAll('form');
  let sites = [];
  products = [];

  forms.forEach(form => {
    const formData = new FormData(form)
    let siteName = null;
    let formId = Number(form.id.replace('product-', ''));
    let product = {
      id: formId,
    };
    formData.entries().forEach(entry => {
      const controlName = entry[0];
      const controlValue = entry[1] ?? '';
      product[controlName] = controlValue;

      if (controlName === 'site' && !!controlValue) {
        siteName = controlValue;
      }

      if (controlName === 'value' && siteName != null && siteName != undefined) {
        const site = sites.find(s => s.site === siteName);
        if (site) {
          site.totalValue += Number(controlValue);
        } else {
          sites.push({
            site: siteName,
            totalValue: Number(controlValue)
          });
        }
      }
    });

    products.push(product);
  });

  refreshSites(sites);
  await chrome.storage.local.set({'products': JSON.stringify(products)});
}

function refreshSites(sites) {
  const sitesContainer = document.getElementById('sites-container');
  sitesContainer.innerHTML = '';
  sites.forEach(site => {
    sitesContainer.innerHTML += `
      <div>
        <span class="site-name">${site.site}</span>
        <span>${site.totalValue?.toFixed(2)}</span>
      </div>
      <hr>
    `;
  });
}

function addProduct(product) {
  let productsContainer = document.getElementById('product-container');
  productsContainer.insertAdjacentHTML('beforeend', `
    <form id="product-${product.id}">
      <input type="text" 
        name="site"
        placeholder="Site" 
        class="product-site"
        value="${product.site}"/> 
      <input type="text" 
        placeholder="Product name" 
        name="productName"
        class="product-name"
        value="${product.productName}"/> 
      <input type="number" 
        placeholder="Value" 
        name="value"
        class="product-value"
        value="${product.value}"/>
      <button 
        class="delete-button"
        id="remove-button-${product.id}"
        > X
      </button>
    </form>
  `);

  products.push(product);
  refresh();
}

function refresh() {
  refreshListeners();
}

document.querySelector('#add-new-product').addEventListener('click', function(event) {
  event.stopPropagation();
  const productIndex = products.length === 0 
    ? 0 
    : Math.max(...products.map(p => p.id));

    addProduct({
    id: productIndex + 1,
    productName: '',
    site: '',
    value: ''
  });
});

function refreshListeners() {
  products.forEach(p => {
    let deleteProductDiv = document.getElementById(`remove-button-${p.id}`);
    deleteProductDiv.addEventListener('click', deleteDelegate(p.id), false);

    let productFormDiv = document.getElementById(`product-${p.id}`);
    productFormDiv.addEventListener('change', calculateDelegate(), false);
  });
}

async function main() {
  const cache = await chrome.storage.local.get(['products']);
  if (cache && cache.products) {
    const arr = JSON.parse(cache.products);
    arr.forEach(entry => addProduct(entry));
    calculate();
  }
}

main();