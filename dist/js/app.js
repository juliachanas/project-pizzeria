//importy na poczatku pliku!
import { settings, select, classNames } from './settings.js'; //kropka i slash bardzo wazne - sciezka do pliku!
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
  initBooking: function () {
    const thisApp = this;

    thisApp.bookingContainer = document.querySelector(
      select.containerOf.booking
    );

    thisApp.booking = new Booking(thisApp.bookingContainer);
  },

  initPages: function () {
    const thisApp = this;
    //wszystkie dzieci kontenera stron beda we wlasciwosci pages
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    //znajdz wsyztskie linki
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromhash = window.location.hash.replace('#/', '');

    //thisApp.activatePage(thisApp.pages[0].id); //wyswietlu sie pierwsza z podstron

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id == idFromhash) {
        pageMatchingHash = page.id;
        break;
      }
    }
    thisApp.activatePage(pageMatchingHash); // zeby przy odswiezaniu nie wracala do poprzejdniej podstrony

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href attribute */
        //w stalej id chcemy zapisac atrybut href kliknietego eleementu, w ktorym zamienimy # na pusty ciag znakow
        const id = clickedElement.getAttribute('href').replace('#', '');

        /*run this App.activatePage with that id*/
        thisApp.activatePage(id);

        /* change url hash */
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function (pageId) {
    const thisApp = this;

    /* add class "active" to matching pages, remove from non-matching */
    for (let page of thisApp.pages) {
      // nadaje klase podana jako pierwszy argument jesli jej nie było i odbiera kied ejst
      //drugi argument kontroluje czy klasa ma zostac nadana czy tez nie!!
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    /* add class "active" to matching links, remove from non-matching */
    for (let link of thisApp.navLinks) {
      //dla kazdego z linkow zapisanych w thisApp.navLinks dodaj lub usun klase w className.nav.active w zaleznosci od tego czy atrybut href tego linka jest rowny "#" oraz id podstrony podanej jako argument axctive page
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  },

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
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);

    thisApp.initPages();
    thisApp.initData();
    //thisApp.initMenu();
    thisApp.initCart();
    thisApp.initBooking();
  },
};

app.init();
