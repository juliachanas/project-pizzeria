//importy na poczatku pliku!
import { settings, select } from '../settings.js'; //""../"" oznacza folder nadrzedny!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

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

export default AmountWidget;
