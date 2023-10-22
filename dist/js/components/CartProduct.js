//importy na poczatku pliku!

import { select } from '../settings.js'; //""../"" oznacza folder nadrzedny!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
import AmountWidget from './AmountWidget.js';

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;
    //console.log(menuProduct);
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.data;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.price = menuProduct.priceSingle * menuProduct.amount;
    thisCartProduct.params = menuProduct.params;

    thisCartProduct.getElements(element);
    thisCartProduct.amountWidget();
    thisCartProduct.initActions();

    //console.log('thisProduct:', thisCartProduct);
  }
  getElements(element) {
    const thisCartProduct = this;
    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget =
      thisCartProduct.dom.wrapper.querySelector(
        select.cartProduct.amountWidget
      );
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.price
    );
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.edit
    );
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.remove
    );
  }
  amountWidget() {
    const thisCartProduct = this;
    thisCartProduct.amountWidget = new AmountWidget(
      thisCartProduct.dom.amountWidget
    );

    /* add listener */

    thisCartProduct.dom.amountWidget.addEventListener(
      'updated',
      function (event) {
        event.preventDefault();

        thisCartProduct.amount = thisCartProduct.amountWidget.value;

        thisCartProduct.price =
          thisCartProduct.amountWidget.value * thisCartProduct.priceSingle;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      }
    );
  }
  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });
    thisCartProduct.dom.wrapper.dispatchEvent(event);
    //console.log(thisCartProduct.dom.wrapper);
  }

  initActions() {
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function (event) {
      event.preventDefault();
    });
    thisCartProduct.dom.remove.addEventListener('click', function (event) {
      event.preventDefault = this;
      thisCartProduct.remove();
    });
  }
  getData() {
    const thisCartProduct = this;

    const CartProductSum = {
      id: thisCartProduct.id,
      name: thisCartProduct.name,
      amount: thisCartProduct.amount,
      priceSingle: thisCartProduct.priceSingle,
      price: thisCartProduct.price,
      params: thisCartProduct.params,
    };

    return CartProductSum;
  }
}

export default CartProduct;
