import { select, templates, settings } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(bookingContainer) {
    const thisBooking = this;

    thisBooking.container = bookingContainer;

    thisBooking.render();
    thisBooking.initWidgets();
    thisBooking.getData();
  }
  getData() {
    const thisBooking = this;

    const startDateParam =
      settings.db.dateStartParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam =
      settings.db.dateEndParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam],
    };

    //console.log('getData params', params);

    const urls = {
      booking:
        settings.db.url +
        '/' +
        settings.db.bookings +
        '?' +
        params.booking.join('&'),
      eventsCurrent:
        settings.db.url +
        '/' +
        settings.db.events +
        '?' +
        params.eventsCurrent.join('&'),
      eventsRepeat:
        settings.db.url +
        '/' +
        settings.db.events +
        '?' +
        params.eventsRepeat.join('&'),
    };

    //console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrentResponse, eventsRepeatResponse]) {
        console.log(bookings);
        console.log(eventsCurrentResponse);
        console.log(eventsRepeatResponse);
      });
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
  }
}

export default Booking;
