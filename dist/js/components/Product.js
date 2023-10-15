//importy

import { select, classNames, templates } from '../settings.js'; //kropka i slash bardzo wazne - sciezka do pliku!
import utils from '../utils.js'; //""../"" oznacza folder nadrzedny!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
import AmountWidget from './AmountWidget.js';

class Product {
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    //console.log('newProduct: ', thisProduct);
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }

  renderInMenu() {
    const thisProduct = this;

    /* generate HTML based on template */

    const generatedHTML = templates.menuProduct(thisProduct.data);
    /* create element using utlis.createElementFromHTML */

    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    /* find menu container */

    const menuContainer = document.querySelector(select.containerOf.menu);
    /* add element to menu */

    menuContainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;

    //thisProduct.dom = {};
    //console.log(thisProduct.dom);

    //[NEW]
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(
      select.menuProduct.amountWidget
    );

    thisProduct.accordionTrigger = thisProduct.element.querySelector(
      select.menuProduct.clickable
    );
    thisProduct.form = thisProduct.element.querySelector(
      select.menuProduct.form
    );
    thisProduct.formInputs = thisProduct.form.querySelectorAll(
      select.all.formInputs
    );
    thisProduct.cartButton = thisProduct.element.querySelector(
      select.menuProduct.cartButton
    );
    thisProduct.priceElem = thisProduct.element.querySelector(
      select.menuProduct.priceElem
    );
    thisProduct.imageWrapper = thisProduct.element.querySelector(
      select.menuProduct.imageWrapper
    );
  }

  initAccordion() {
    const thisProduct = this;

    /* Find the clickable trigger (the element that should react to clicking))*/
    // const clickableTrigger = thisProduct.element.querySelector( //TO JUZ JEST ZDEFINIOWANE W GETELEMENTS - NIE POTRZEBNE DWA RAZY
    //   select.menuProduct.clickable
    // );
    // console.log('clik ', clickableTrigger);

    /* START: add event listener to clickable trigger on event click*/
    thisProduct.accordionTrigger.addEventListener('click', function (event) {
      event.preventDefault();

      /* find active product (product that has active class) */
      //const activeProduct = document.querySelector('.product.active'); //wazne jest uzycie odpowiedniej klasy!!!!!!
      const activeProduct = document.querySelector(
        select.all.menuProductsActive
      );

      /*if there is active product and it's not thisProduct.element, remove class active from it */
      if (activeProduct && activeProduct !== thisProduct.element) {
        activeProduct.classList.remove('active');
      }

      /* toggle active class on thisProduct.element */
      console.log('this: ', thisProduct);
      thisProduct.element.classList.toggle('active');
    });
  }

  initOrderForm() {
    const thisProduct = this;
    console.log(this.initOrderForm);

    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder() {
    const thisProduct = this;
    console.log('bam: ', this.processOrder);
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    console.log('formData', formData);

    // set price to default price
    let price = thisProduct.data.price;

    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      console.log(paramId, param);

      // for every option in this category
      for (let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        console.log(optionId, option);

        //check if formData has param named 'paramId' and if it inludes optionId
        if (formData[paramId] && formData[paramId].includes(optionId)) {
          // check if option is not default
          if (!option.default) {
            price += option.price; // increase price
          }
        } else {
          // check if option is default
          if (option.default) {
            price -= option.price; //  decrease price
          }
        }

        //find image class consist of two variables - paramId and optionId linked with "-"
        const optionImage = thisProduct.imageWrapper.querySelector(
          '.' + paramId + '-' + optionId
        );

        // check if image was found
        const optionSelected =
          formData[paramId] && formData[paramId].includes(optionId);
        if (optionImage) {
          //if option is selected add class "active" and make image visable using imageVisable
          if (optionSelected) {
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          } else {
            // if option is not selected remove class "active" and make image invisible
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }

    //NEW multiply price by amount
    thisProduct.priceSingle = price;
    price *= thisProduct.amountWidget.value;

    // update calculated price in the HTML

    thisProduct.priceElem.innerHTML = price;
    console.log('price ', price);
  }

  initAmountWidget() {
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    /* add listener on thisProduct.amountWidgetElem on 'updated' event */
    thisProduct.amountWidgetElem.addEventListener('updated', function (event) {
      event.preventDefault();

      thisProduct.processOrder();
    });
  }
  addToCart() {
    const thisProduct = this;

    //app.cart.add(thisProduct.prepareCartProduct());
    const event = new CustomEvent('add-to-cart', {
      bubbles: true, //przekazywany do rodzica i jego rodzica itp
      detail: {
        //informacje, ktore przekaze
        product: thisProduct.prepareCartProduct(),
      },
    });
    thisProduct.element.dispatchEvent(event); // wywolanie eventu - wybieramy element na ktorym element na ktorym chcemy wywolać event!
  }
  prepareCartProduct() {
    const thisProduct = this;

    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.priceSingle * thisProduct.amountWidget.value,
      params: thisProduct.prepareCartProductParams(),
    };
    return productSummary;
  }
  prepareCartProductParams() {
    const thisProduct = this;

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    const params = {};

    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];

      // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}

      params[paramId] = {
        label: param.label,
        options: {},
      };

      // for every option in this category
      for (let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];

        //check if formData has param named 'paramId' and if it inludes optionId
        if (formData[paramId] && formData[paramId].includes(optionId)) {
          params[paramId].options[optionId] = option.label; //dodaje opcje
        }
      }
    }
    return params;
  }
}

export default Product;
