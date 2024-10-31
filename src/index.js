/**
 * Gefið efni fyrir verkefni 9, ekki er krafa að nota nákvæmlega þetta en nota
 * verður gefnar staðsetningar.
 */

import { el, empty } from './lib/elements.js';
import { weatherSearch } from './lib/weather.js';

/**
 * @typedef {Object} SearchLocation
 * @property {string} title
 * @property {number} lat
 * @property {number} lng
 */

/**
 * Allar staðsetning sem hægt er að fá veður fyrir.
 * @type Array<SearchLocation>
 */
const locations = [
  {
    title: 'Reykjavík',
    lat: 64.1355,
    lng: -21.8954,
  },
  {
    title: 'Akureyri',
    lat: 65.6835,
    lng: -18.0878,
  },
  {
    title: 'New York',
    lat: 40.7128,
    lng: -74.006,
  },
  {
    title: 'Tokyo',
    lat: 35.6764,
    lng: 139.65,
  },
  {
    title: 'Sydney',
    lat: 33.8688,
    lng: 151.2093,
  },
];

/**
 * Hreinsar fyrri niðurstöður, passar að niðurstöður séu birtar og birtir element.
 * @param {Element} element
 */
function renderIntoResultsContent(element) {
  const outputElement = document.querySelector('.output');

  if (!outputElement) {
    console.warn('fann ekki .output');
    return;
  }

  empty(outputElement);

  outputElement.appendChild(element);
}

/**
 * Birtir niðurstöður í viðmóti.
 * @param {SearchLocation} location
 * @param {Array<import('./lib/weather.js').Forecast>} results
 */
function renderResults(location, results) {
  const header = el(
    'tr',
    {},
    el('th', {}, 'Tími'),
    el('th', {}, 'Hiti'),
    el('th', {}, 'Úrkoma'),
  );
  console.log(results);

  const thead = el('thead', {}, header);

  const resultsTable = el('table', { class: 'forecast' }, thead);
  //let body;

  const tbody = el('tbody');

// You would typically append rows to the tbody here
for (let i = 0; i < results.length; i++) {
  const bodyRow = el(
    'tr',
    {},
    el('td', {}, (results[i].time).substring(11)),
    el('td', {}, String(results[i].temperature)), // Assuming you have temperature data
    el('td', {}, String(results[i].precipitation)) // Assuming you have precipitation data
  );

  // Append the bodyRow to the tbody
  tbody.appendChild(bodyRow);
}

// Append tbody to the resultsTable
resultsTable.appendChild(tbody);

const freakyCityText = el('p', {}, `veðurniðurstöður á lat: 👆${location.lat}👇 lng: 👉${location.lng}👈`);
// Render the table into the results content
renderIntoResultsContent(
  
  el(
    'section',
    {},
    
    el('h2', {}, `Leitarniðurstöður fyrir: ${location.title}`),
    freakyCityText,
    resultsTable
      ),
    );
  
  
}

/**
 * Birta villu í viðmóti.
 * @param {Error} error
 */
function renderError(error) {
  console.log(error);
  const message = error.message;
  renderIntoResultsContent(el('p', {}, `Villa: ${message}`));
}

/**
 * Birta biðstöðu í viðmóti.
 */
function renderLoading() {
  renderIntoResultsContent(el('p', {}, 'Leita...'));
}

/**
 * Framkvæmir leit að veðri fyrir gefna staðsetningu.
 * Birtir biðstöðu, villu eða niðurstöður í viðmóti.
 * @param {SearchLocation} location Staðsetning sem á að leita eftir.
 */
async function onSearch(location) {
  renderLoading();

  let results;
  try {
    results = await weatherSearch(location.lat, location.lng);
  } catch (error) {
    renderError(error);
    return;
  }

  renderResults(location, results ?? []);

  // TODO útfæra
  // Hér ætti að birta og taka tillit til mismunandi staða meðan leitað er.
}

/**
 * Framkvæmir leit að veðri fyrir núverandi staðsetningu.
 * Biður notanda um leyfi gegnum vafra.
 */

async function onSearchMyLocation() {
  // TODO útfæra
  let userLatitude = null;
  let userLongitude = null;
  if (!navigator.geolocation) {
    console.error("Geolocation is not supported by your browser");
    return; // Exit if geolocation is not supported
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLatitude = position.coords.latitude;
      userLongitude = position.coords.longitude;
      onSearch({
        title: 'mín staðsetning',
        lat: userLatitude,
        lng: userLongitude,
      })
      console.log(`Latitude: ${userLatitude}, Longitude: ${userLongitude}`);
    },
    () => {
      console.error("Unable to retrieve your location");
    }
  );
}




/**
 * Býr til takka fyrir staðsetningu.
 * @param {string} locationTitle
 * @param {() => void} onSearch
 * @returns {HTMLElement}
 */
function renderLocationButton(locationTitle, onSearch) {
  // Notum `el` fallið til að búa til element og spara okkur nokkur skref.
  const locationElement = el(
    'li',
    { class: 'locations__location' },
    el(
      'button',
      { class: 'locations__button', click: onSearch },
      locationTitle,
    ),
  );

  /* Til smanburðar við el fallið ef við myndum nota DOM aðgerðir
  const locationElement = document.createElement('li');
  locationElement.classList.add('locations__location');
  const locationButton = document.createElement('button');
  locationButton.appendChild(document.createTextNode(locationTitle));
  locationButton.addEventListener('click', onSearch);
  locationElement.appendChild(locationButton);
  */

  return locationElement;
}

/**
 * Býr til grunnviðmót: haus og lýsingu, lista af staðsetningum og niðurstöður (falið í byrjun).
 * @param {Element} container HTML element sem inniheldur allt.
 * @param {Array<SearchLocation>} locations Staðsetningar sem hægt er að fá veður fyrir.
 * @param {(location: SearchLocation) => void} onSearch
 * @param {() => void} onSearchMyLocation
 */
function render(container, locations, onSearch, onSearchMyLocation) {
  // Búum til <main> og setjum `weather` class
  const parentElement = document.createElement('main');
  parentElement.classList.add('weather');

  // Búum til <header> með beinum DOM aðgerðum
  const headerElement = document.createElement('header');
  const heading = document.createElement('h1');
  const p = document.createElement("p");
  const heading2 = document.createElement("h2")
  heading.appendChild(document.createTextNode('👉veður🔮spá👌'));
  p.appendChild(document.createTextNode('👁️‍🗨️hvernig👻🕷️🦇er👺💀veðrið👽🧛‍♂️í🧟‍♀️🔮dag🕯️🦴???👹'));
  heading2.appendChild(document.createTextNode("🎃Staðsetningar🎃 í 👻bOooOoOoðii👻"))
  headerElement.appendChild(heading);
  headerElement.appendChild(p);
  headerElement.appendChild(heading2);
  parentElement.appendChild(headerElement);


  

  // TODO útfæra inngangstexta
  // Búa til <div class="loctions">
  const locationsElement = document.createElement('div');
  locationsElement.classList.add('locations');

  // Búa til <ul class="locations__list">
  const locationsListElement = document.createElement('ul');
  locationsListElement.classList.add('locations__list');

  // <div class="loctions"><ul class="locations__list"></ul></div>
  locationsElement.appendChild(locationsListElement);

  // <div class="loctions"><ul class="locations__list"><li><li><li></ul></div>




  const myButtonElement = renderLocationButton("mín staðsetning", onSearchMyLocation)
  locationsListElement.appendChild(myButtonElement);
  for (const location of locations) {
    const liButtonElement = renderLocationButton(location.title, () => {
      console.log('Halló!!', location);
      onSearch(location);
    });
    locationsListElement.appendChild(liButtonElement);
  }

  parentElement.appendChild(locationsElement);

  const outputElement = document.createElement('div');
  outputElement.classList.add('output');
  parentElement.appendChild(outputElement);

  container.appendChild(parentElement);
}

// Þetta fall býr til grunnviðmót og setur það í `document.body`
render(document.body, locations, onSearch, onSearchMyLocation);
