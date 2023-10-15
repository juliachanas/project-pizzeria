import { select, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(bookingContainer) {
    const thisBooking = this;

    thisBooking.container = bookingContainer;

    thisBooking.render();
    thisBooking.initWidgets();
  }
  render() {
    const thisBooking = this;

    /*generowanie kodu HTML za pomocą szablonu */
    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};

    /* wedlug wskazowek z zadania */
    // Przypisanie referencji do kontenera do właściwości wrapper
    thisBooking.dom.wrapper = thisBooking.container;

    // Zaktualizowanie zawartości wrappera (innerHTML) na kod HTML wygenerowany z szablonu
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmountWidget = document.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmountWidget = document.querySelector(
      select.booking.hoursAmount
    );

    thisBooking.dom.datePicker = document.querySelector(
      select.widgets.datePicker.wrapper
    );

    thisBooking.dom.hourPicker = document.querySelector(
      select.widgets.hourPicker.wrapper
    );
  }
  initWidgets() {
    const thisBooking = this;

    /* find html element  peopleWidgetAmount in 'thisBooking.dom.wrapper' 
    container and save to thisBooking.dom.peopleAmountWidgetElem */
    thisBooking.dom.peopleAmountWidgetElem =
      thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);

    thisBooking.dom.hoursAmountWidgetElem =
      thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    /* create new class instance and transfer to it HTML element (represented by peopleAmountWidgetElem)
    save as property  peopleAmountWidget of thisBooking.dom object  */
    thisBooking.dom.peopleAmountWidget = new AmountWidget(
      thisBooking.dom.peopleAmountWidgetElem
    );

    thisBooking.dom.hoursAmountWidget = new AmountWidget(
      thisBooking.dom.hoursAmountWidgetElem
    );

    /* add listener to thisBooking.dom.peopleAmountWidgetElem*/
    thisBooking.dom.peopleAmountWidgetElem.addEventListener(
      'updated',
      function (event) {
        event.preventDefault();
      }
    );

    thisBooking.dom.hoursAmountWidgetElem.addEventListener(
      'updated',
      function (event) {
        event.preventDefault();
      }
    );

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.datePicker.init();
    thisBooking.hourPicker.init();
  }
}

export default Booking;
