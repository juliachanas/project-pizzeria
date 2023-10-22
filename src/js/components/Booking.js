import { select, templates, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(bookingContainer) {
    const thisBooking = this;

    //thisBooking.container = bookingContainer;

    thisBooking.selectedTable = undefined;

    thisBooking.render(bookingContainer);
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
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        // console.log(bookings);
        // console.log(eventsCurrentResponse);
        // console.log(eventsRepeatResponse);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }
  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          thisBooking.makeBooked(
            utils.dateToStr(loopDate),
            item.hour,
            item.duration,
            item.table
          );
        }
      }
    }
    thisBooking.updateDOM();
    //  console.log('thisBooking.booked', thisBooking.booked);
  }
  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    //sprawdzamy czy date w obiekcie thisBooking.booked jest 'undifined', to znaczy że nie istnieje
    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {}; //właściwość date nie istnieje (jest undefined), to tworzy ją jako nowy obiekt {}
    }

    const startHour = utils.hourToNumber(hour); //zmieniamy format godziny początku rezerwacji

    for (
      //inicjuję hourBlock z wartością startHour,
      let hourBlock = startHour;
      hourBlock < startHour + duration; // iteracja przez godziny od startHour do startHour + duration
      hourBlock += 0.5 //z krokiem iteracji 0.5 (czyli co 30 minut)
    ) {
      //console.log('loop', hourBlock);

      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        //sprawdzam czy  rezerwacja w thisBooking.booked jest undified - data i godzina
        thisBooking.booked[date][hourBlock] = []; //jeśli tak to tworzę nową tablicę
      }
      thisBooking.booked[date][hourBlock].push(table); //stolik (numer stolika) jest dodawany do tej tablicy
    }
  }
  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value); //zamiana godziny na numer - zmiana formatu

    let allAvailable = false; //wszystkie stoliki danego dnia sa niedostepne

    if (
      //sprawdzamy, czy właściwość thisBooking.date w obiekcie thisBooking.booked jest 'undifined' oraz
      typeof thisBooking.booked[thisBooking.date] == 'undefined' || //lub
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == //czy czy właściwość thisBooking.hour  w obiekcie "thisBooking.booked[thisBooking.date]" jest 'undifined'
        'undefined' //jeśli tak, to wszystkie stoliki są dostępne
    ) {
      allAvailable = true;
    }

    //petla iterujaca przez wszytskie stoliki dostepne na stronie
    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute); //pobieramy ID stolika i zapisujemy do stałej
      table.classList.remove(classNames.booking.tableSelected); //usuwamy klasę 'selected' ze stolików
      if (!isNaN(tableId)) {
        //sprawdzamy czy tableID nie jest liczbą - jeśli true to:
        tableId = parseInt(tableId); //przekonwertowanie na liczbę
      }

      //sprawdza czy którys stolik jest zajety, a jesli jest to czy tego dnia o tej godzinie zajety jest stolik o danym numerze
      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(bookingContainer) {
    const thisBooking = this;
    thisBooking.container = bookingContainer;

    /*generowanie kodu HTML za pomocą szablonu */
    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};

    /* wedlug wskazowek z zadania */
    // Przypisanie referencji do kontenera do właściwości wrapper
    thisBooking.dom.wrapper = thisBooking.container;

    // Zaktualizowanie zawartości wrappera (innerHTML) na kod HTML wygenerowany z szablonu
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmountWidget = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmountWidget = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );
    //wybór daty
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.wrapper
    );
    //wybór godziny
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.wrapper
    );
    //wszystkie stoliki
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.tables
    );
    //cały div ze stolikami
    thisBooking.dom.tablesDiv =
      thisBooking.dom.wrapper.querySelector('.floor-plan');
    //phone
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(
      select.booking.phone
    );
    //address
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(
      select.booking.address
    );
    //checkbox
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.checkbox
    );
    //formularz
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(
      select.booking.form
    );
  }
  initTables(event) {
    const thisBooking = this;

    const clickedElement = event.target; //klinięty element to zdarzenine z listenera

    if (clickedElement.classList.contains('table')) {
      //sprawdzam czy kliknięty element jest stolikiem
      thisBooking.selectedTable = undefined; //zerujemy wybrany stolik - nie ma w nim nic

      if (clickedElement.classList.contains(classNames.booking.tableBooked)) {
        //sprawdzam, czy kliknięty element zawiera klasę 'booked'
        alert('Stolik jest zajęty!'); //jeśli tak - mam alert!!!
      } else {
        //jeśli nie ma klasy 'booked' sprawdzam kolejne warunki
        if (
          //1 OPCJA - stolik już jest kliknięty
          clickedElement.classList.contains(classNames.booking.tableSelected) //sprawdzam, czy kliknięty element zawiera klasę 'selected'
        ) {
          clickedElement.classList.remove(classNames.booking.tableSelected); //jeśli już klasę 'selected' to usuwamy ją
        } else {
          // 2 OPCJA - stolik nie został klinięty - nie ma klasy 'selected'
          //pętla - iteruję po wszystkich stolikach
          for (const table of thisBooking.dom.tables) {
            table.classList.remove(classNames.booking.tableSelected); //usuwamy ze wszystkich stolików klasę 'selected' - wszystko odznaczone
          }
          clickedElement.classList.add(classNames.booking.tableSelected); //i dodajemy klasę ' selected' do klikniętego elementu
          //pobieram ID klikniętego stolika - czyli jego numer
          const tableId = clickedElement.getAttribute(
            settings.booking.tableIdAttribute
          );
          thisBooking.selectedTable = tableId; //zapisuję ID stolika (jego numer) do selectedTable
        }
      }
    }
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

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });

    thisBooking.dom.tablesDiv.addEventListener('click', function (event) {
      //kliknięcie na stolik, mamy event który zostaje przekazany do funkcji initTables
      thisBooking.initTables(event);
    });

    thisBooking.dom.form.addEventListener('submit', function (event) {
      //nasłuchiwacz na guzik - wysłanie rezerwacji
      event.preventDefault();

      thisBooking.sendBooking();
    });
  }
  sendBooking() {
    const thisBooking = this;

    //adres endpointu z ktorym chcemy sie polaczyc
    const url = settings.db.url + '/' + settings.db.bookings;
    if (!thisBooking.selectedTable) {
      //jesli nie ma wybranego stolika to wysyłanie danych się nie powiedzie
      //console.log('brak stolika');
      return;
    }

    const payload = {
      date: thisBooking.datePicker.value, //data wybrana w datePickerze
      hour: thisBooking.hourPicker.value, //godzina wybrana w hourPickerze (w formacie HH:ss)
      table: parseInt(thisBooking.selectedTable), //numer wybranego stolika (lub null jeśli nic nie wybrano)
      duration: thisBooking.dom.hoursAmountWidget.value, //liczba godzin wybrana przez klienta -ok
      ppl: thisBooking.dom.peopleAmountWidget.value, //liczba osób wybrana przez klienta -ok
      starters: [],
      phone: thisBooking.dom.phone.value, //numer telefonu z formularza,
      address: thisBooking.dom.address.value, //adres z formularza
    };
    for (let starter of thisBooking.dom.starters) {
      if (starter.checked) {
        payload.starters.push(starter.value);
      }
      if (
        payload.starters.includes('bread') &&
        !payload.starters.includes('water')
      ) {
        payload.starters.push('water');
      }
    }

    // console.log(payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options).then(function () {
      //jesli wysyłanie danych na serwer będzie sukcesem to wtedy wykonają się funkcje po .then
      thisBooking.makeBooked(
        //zapisze się rezerwacja
        payload.date,
        payload.hour,
        payload.duration,
        payload.table
      );
      thisBooking.updateDOM(); //zaktualizuje się layout strony
      thisBooking.selectedTable = undefined; // i zresetuje się wybór stolika
    });
  }
}
export default Booking;
