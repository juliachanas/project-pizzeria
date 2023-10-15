class BaseWidget {
  constructor(wrapperElement, initialValue) {
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;
  }
  get value() {
    const thisWidget = this;

    return thisWidget.correctValue;
  }
  set value(value) {
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value); //parseInt zmienia tekst na liczbe - bo wwpisana zawsze jest tekstem!
    // const minValue = settings.amountWidget.defaultMin;
    // const maxValue = settings.amountWidget.defaultMax;

    /* ADD VALIDATION */
    if (thisWidget.correctValue !== newValue && thisWidget.isValid(newValue)) {
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }

    thisWidget.renderValue();
  }

  setValue(value) {
    const thisWidget = this;

    thisWidget.value = value;
  }
  parseValue(value) {
    //przeksztalcic wartośc na odpowiedni typ lub wartosc
    return parseInt(value);
  }

  isValid(value) {
    return !isNaN(value);
  }

  renderValue() {
    const thisWidget = this;
    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }
  announce() {
    const thisWidget = this;
    const event = new CustomEvent('updated', {
      bubbles: true, //emitowanie na elemencie i jego rodzicu, dziadku itd az do body, document i window
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;
