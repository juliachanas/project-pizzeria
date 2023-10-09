/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice:
        '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
    cartProduct: Handlebars.compile(
      document.querySelector(select.templateOf.cartProduct).innerHTML
    ),
  };

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
      thisProduct.amountWidgetElem.addEventListener(
        'updated',
        function (event) {
          event.preventDefault();

          thisProduct.processOrder();
        }
      );
    }
    addToCart() {
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
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
  class AmountWidget {
    constructor(element) {
      const thisWidget = this;

      thisWidget.getElements(element);

      //utawienie wartosci poczatkowej dla ilosci

      // if (thisWidget.input.value) {
      //   // jesli jest podana to wlacza metode setvalue z ta wartoscia
      //   thisWidget.setValue(thisWidget.input.value);
      // } else {
      //   // jesli nie to wlacza setvalue z wartoscia domyslna
      //   thisWidget.setValue(settings.amountWidget.defaultValue);
      // }

      /* sprawdza czy thisWidget.input.value ma prawdziwa wartośc to zostanie ona uzyta,
      jest falszywe to zrealizuje sie tu co jest po LUB czyli przypisze wartosc domyslna z settings.amountWidget.defaultValue */
      thisWidget.setValue(
        thisWidget.input.value || settings.amountWidget.defaultValue
      );

      thisWidget.initActions();
      console.log('AmountWidget:', thisWidget);
      console.log('constructor arguments', element);
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(
        select.widgets.amount.input
      );
      thisWidget.linkDecrease = thisWidget.element.querySelector(
        select.widgets.amount.linkDecrease
      );
      thisWidget.linkIncrease = thisWidget.element.querySelector(
        select.widgets.amount.linkIncrease
      );
    }

    setValue(value) {
      const thisWidget = this;

      const newValue = parseInt(value); //parseInt zmienia tekst na liczbe - bo wwpisana zawsze jest tekstem!
      const minValue = settings.amountWidget.defaultMin;
      const maxValue = settings.amountWidget.defaultMax;

      /* ADD VALIDATION */
      if (
        thisWidget.value !== newValue &&
        !isNaN(newValue) &&
        newValue >= minValue &&
        newValue <= maxValue
      ) {
        thisWidget.value = newValue;
      }
      thisWidget.input.value = thisWidget.value;
      this.announce();
    }

    initActions() {
      const thisWidget = this;

      /* START: add event listener to thisWidget.input on event change*/
      thisWidget.input.addEventListener('change', function (event) {
        event.preventDefault();

        thisWidget.setValue(thisWidget.input.value);
      });

      /* add event listener to thisWidget.linkDecrease on event click */
      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();

        thisWidget.setValue(thisWidget.value - 1);
      });

      /* add event listener to thisWidget.linkIncrease on event click */
      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();

        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    announce() {
      const thisWidget = this;
      const event = new CustomEvent('updated', {
        bubbles: true, //emitowanie na elemencie i jego rodzicu, dziadku itd az do body, document i window
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

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
      thisCart.dom.totalPrice = element.querySelectorAll(
        select.cart.totalPrice
      );
      thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber);
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
  }

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
      console.log(thisCartProduct.dom.wrapper);
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
  }

  const app = {
    initMenu: function () {
      const thisApp = this;
      console.log('thisApp.data ', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },
    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
