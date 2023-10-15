//importy

import { settings, select, classNames, templates } from '../settings.js'; //""../"" oznacza folder nadrzedny!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
import utils from '../utils.js'; //""../"" oznacza folder nadrzedny!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    //console.log('new Cart', thisCart);
    thisCart.initActions();
  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
      select.cart.toggleTrigger
    );

    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
      select.cart.productList
    );
    thisCart.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = element.querySelector(
      select.cart.subtotalPrice
    );
    thisCart.dom.totalPrice = element.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber);
    thisCart.dom.form = element.querySelector(select.cart.form);
    thisCart.dom.phone = element.querySelector(select.cart.phone);
    thisCart.dom.address = element.querySelector(select.cart.address);
  }
  initActions() {
    const thisCart = this;

    /* add CLICK event listener on thisCart.dom.toggleTrigger  */
    thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
      event.preventDefault(); //as always

      /*toggle class in classNames.cart.wrapperActive on thisCart.dom.wrapper */
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive); //trzeba pamietac o dodaniu classList - inaczej nie zadziala, bo gdzie ma szukac
    });

    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();

      thisCart.sendOrder();
    });
  }
  add(menuProduct) {
    const thisCart = this;
    console.log('adding product', menuProduct);
    /* generate HTML based on template */

    const generatedHTML = templates.cartProduct(menuProduct);

    /* create element using utlis.createElementFromHTML */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM)); //TEGO NIE ROZUMIEM - POPROSIĆ O WYJAŚNIENIE
    console.log('NEW CART PRODUCT', thisCart.products);

    thisCart.update();
  }
  update() {
    const thisCart = this;

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee; // delivery cost
    //console.log(deliveryFee);

    thisCart.totalNumber = 0; //number of products
    thisCart.subtotalPrice = 0;

    for (const product of thisCart.products) {
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;
    }

    if (!thisCart.totalNumber) {
      thisCart.deliveryFee = 0;
    }

    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee; // total price
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;

    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    //thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;

    console.log('total price:', thisCart.totalPrice);

    for (const totalPrice of thisCart.dom.totalPrice) {
      totalPrice.innerHTML = thisCart.totalPrice;
    }
  }
  remove(product) {
    const thisCart = this;

    product.dom.wrapper.remove(); // usuwa element HTML z DOM reprezentujący produkt.

    //znajdz indeks produktu w tablicy thisCart.products zeby okreslic JEGO POZYCJE i zapisz w zmiennej indexOfRemovedProduct
    const indexOfRemovedProduct = thisCart.products.indexOf(product);

    // usun produkt z tablicy thisCart.products - usuwa jeden element z tablicy uzywajac indeksu z indexOfRemovedProduct
    thisCart.products.splice(indexOfRemovedProduct, 1);

    thisCart.update();
  }
  sendOrder() {
    const thisCart = this;
    //adrs endpointu z ktorym chcemy sie polaczyc
    const url = settings.db.url + '/' + settings.db.orders;
    const payload = {
      adress: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    for (let product of thisCart.products) {
      payload.products.push(product.getData());
    }

    console.log(payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options);
  }
}

export default Cart;
