chrome.contextMenus.create({
    title: "Add new product with value: %s", 
    contexts:['page', 'selection'],
    id: 'CONTEXT_ID_PRODUCT_COMPARER',
    visible: true
  },
);

chrome.contextMenus.onClicked.addListener(
  async (info) => {
    console.log('info', info)
    const data = await chrome.storage.local.get(["products"]);
    if (data && data.products) {
      console.log(data)
      const products = JSON.parse(data.products);
      const productIndex = products.length === 0 
        ? 0 
        : Math.max(...products.map(p => p.id));

      const stringValue = info?.selectionText?.replace(/\s/g, '')?.replace(',', '.');
      const productValue = isNaN(stringValue) ? '' : Number(stringValue);
      let siteName = '';
      let pattern = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))/i;
      if (info?.pageUrl) {
        const url = info.pageUrl;
        let result = url.match(pattern);
        if (result && result.length === 3) {
          siteName = result[2];
        }
      }

      console.log('add', productValue, siteName, stringValue);
      products.push({
        id: productIndex + 1,
        productName: '',
        site: siteName,
        value: productValue,
      });

      await chrome.storage.local.set({'products': JSON.stringify(products)});
    }
    
  }
)