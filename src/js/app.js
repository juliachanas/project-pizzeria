//importy na poczatku pliku!
import { settings, select } from './settings.js'; //kropka i slash bardzo wazne - sciezka do pliku!
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  initMenu: function () {
    const thisApp = this;
    console.log('thisApp.data ', thisApp.data);

    for (let productData in thisApp.data.products) {
      new Product(
        thisApp.data.products[productData].id,
        thisApp.data.products[productData]
      );
    }
  },
  initData: function () {
    const thisApp = this;

    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.products;
    console.log(url);

    fetch(url) /* polacz sie z url*/
      .then(function (rawResponse) {
        return rawResponse.json(); /*przekonwertuj na plik json */
      })
      .then(function (parsedResponse) {
        console.log(
          'parsedResponse',
          parsedResponse
        ); /*pokaz skonwertowane dane w konsoli*/

        /* save parsedResponse at this.App.data.products */
        thisApp.data.products = parsedResponse;
        /* execute initMenu method */
        thisApp.initMenu();
      });

    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },
  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu); //

    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });
  },

  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    console.log('settings:', settings);
    //console.log('templates:', templates);

    thisApp.initData();
    //thisApp.initMenu();
    thisApp.initCart();
  },
};

app.init();
