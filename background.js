chrome.contextMenus.create({
    title: "Add new product with value: %s", 
    contexts:['page', 'selection'],
    id: 'CONTEXT_ID_PRODUCT_COMPARER',
    visible: true
  },
);

function getProductIndex(products) {
  return products.length === 0 
    ? 0 
    : Math.max(...products.map(p => p.id));
}

function getSiteName(info) {
  let siteName = '';
  let pattern = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))/i;
  
  if (info?.pageUrl) {
    const url = info.pageUrl;
    let result = url.match(pattern);
    if (result && result.length === 3) {
      siteName = result[2];
    }
  }

  return siteName;
}

function getProductName(info) {
  if (!info || !info.pageUrl || info.pageUrl.length == 0) {
    return '';
  }

  var stringLength = info.pageUrl.length;
  var pageUrl = info.pageUrl;
  if (pageUrl.charAt(stringLength - 1) == '/') {
    pageUrl = pageUrl.substring(0, stringLength - 1);
  }

  var lastIndex = pageUrl.lastIndexOf('/') + 1;
  var productName = pageUrl.substring(lastIndex);

  console.log(productName, 'xdxd');

  return productName;
}

chrome.contextMenus.onClicked.addListener(
  async (info) => {
    const data = await chrome.storage.local.get(["products"]);
    if (data && data.products) {
      const products = JSON.parse(data.products);
      const productIndex = getProductIndex(products);

      const valueAsString = info?.selectionText?.replace(/\s/g, '')?.replace(',', '.');
      const productValue = isNaN(valueAsString) ? '' : Number(valueAsString);

      products.push({
        id: productIndex + 1,
        productName: getProductName(info),
        site: getSiteName(info),
        value: productValue,
      });

      await chrome.storage.local.set({'products': JSON.stringify(products)});
    }
    
  }
)