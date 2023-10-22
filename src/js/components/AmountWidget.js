//importy na poczatku pliku!
import { settings, select } from '../settings.js'; //""../"" oznacza folder nadrzedny!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue); // konstruktor klasy BaseWidget
    const thisWidget = this;

    thisWidget.getElements(element);

    thisWidget.initActions();

    //console.log('AmountWidget:', thisWidget);
    //console.log('constructor arguments', element);
  }

  getElements() {
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.input
    );
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkIncrease
    );
  }

  isValid(value) {
    return (
      !isNaN(value) &&
      value >= settings.amountWidget.defaultMin &&
      value <= settings.amountWidget.defaultMax
    );
  }

  renderValue() {
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;

    /* START: add event listener to thisWidget.dom.input on event change*/
    thisWidget.dom.input.addEventListener('change', function () {
      //thisWidget.setValue(thisWidget.dom.input.value);
      thisWidget.value = thisWidget.dom.input.value;
    });

    /* add event listener to thisWidget.dom.linkDecrease on event click */
    thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();

      thisWidget.setValue(thisWidget.value - 1);
    });

    /* add event listener to thisWidget.dom.linkIncrease on event click */
    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();

      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}

export default AmountWidget;
