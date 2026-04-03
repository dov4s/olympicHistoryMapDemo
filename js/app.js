const globeContainer = document.querySelector('.globe-container');
const canvas = document.getElementById('globe-canvas');
const context = canvas.getContext('2d');

// Словарь соответствия: Карта -> Датасет
const COUNTRY_MAPPER = {
    "United States of America": ["United States"],
    "China":["People's Republic of China"],
    "South Korea": ["Republic of Korea"],
    "North Korea":["Democratic People's Republic of Korea"],
    "United Kingdom": ["Great Britain"],
    "Turkey": ["Türkiye"],
    "Bahamas": ["The Bahamas"],
    "Taiwan": ["Chinese Taipei"],
    "Syria":["Syrian Arab Republic"],
    "Moldova": ["Republic of Moldova", "Unified Team"],
    "Saudi Arabia": ["Kingdom of Saudi Arabia"],
    "Macedonia": ["North Macedonia"],
    "Dominican Rep.": ["Dominican Republic"],
    "Iran": ["Islamic Republic of Iran"],
    
    "Russia":["Russian Federation", "ROC", "Unified Team", "Russian Olympic Committee"],
    "Czechia": ["Czechia", "Czechoslovakia"],
    "Slovakia":["Slovakia", "Czechoslovakia"],
    
    "Serbia": ["Serbia", "Serbia and Montenegro", "Yugoslavia"],
    "Montenegro":["Montenegro", "Serbia and Montenegro"],
    "Kosovo": ["Kosovo", "Serbia and Montenegro"],

    "Ukraine": ["Ukraine", "Unified Team"],
    "Belarus": ["Belarus", "Unified Team"],
    "Kazakhstan": ["Kazakhstan", "Unified Team"],
    "Uzbekistan":["Uzbekistan", "Unified Team"],
    "Georgia": ["Georgia", "Unified Team"],
    "Azerbaijan":["Azerbaijan", "Unified Team"],
    "Lithuania": ["Lithuania", "Unified Team"],
    "Latvia": ["Latvia", "Unified Team"],
    "Estonia":["Estonia", "Unified Team"],
    "Kyrgyzstan": ["Kyrgyzstan", "Unified Team"],
    "Tajikistan": ["Tajikistan", "Unified Team"],
    "Armenia":["Armenia", "Unified Team"],
    "Turkmenistan": ["Turkmenistan", "Unified Team"],

    // --- ДОБАВЛЕННЫЕ ИЗ КРОСС-ПРОВЕРКИ ---
    "Bosnia and Herz.": ["Bosnia and Herzegovina"],
    "Brunei": ["Brunei Darussalam"],
    "Central African Rep.": ["Central African Republic"],
    "Dem. Rep. Congo": ["Democratic Republic of the Congo"],
    "Eq. Guinea": ["Equatorial Guinea"],
    "eSwatini": ["Eswatini"],
    "Guinea-Bissau": ["Guinea Bissau"],
    "Laos": ["Lao People's Democratic Republic"],
    "Solomon Is.": ["Solomon Islands"],
    "S. Sudan": ["South Sudan"],
    "Gambia": ["The Gambia"],
    "Tanzania": ["United Republic of Tanzania"]
};

// Полный словарь перевода всех стран, территорий и исторических команд
const TRANSLATIONS = {
    // Исторические и особые команды
    'Unified Team': 'Объединённая команда',
    'ROC': 'Олимпийский комитет России',
    'Russian Olympic Committee': 'Олимпийский комитет России',
    'Independent Olympic Athletes': 'Независимые олимпийские спортсмены',
    'Czechoslovakia': 'Чехословакия',
    'Serbia and Montenegro': 'Сербия и Черногория',
    'Yugoslavia': 'Югославия',
    'Korea Team': 'Объединённая команда Кореи',
    'Refugee Olympic Team': 'Сборная беженцев',

    // Страны с особыми/длинными названиями в датасете
    "People's Republic of China": 'Китай',
    'Republic of Korea': 'Южная Корея',
    "Democratic People's Republic of Korea": 'КНДР',
    'Great Britain': 'Великобритания',
    'United Kingdom': 'Великобритания',
    'United States': 'США',
    'United States of America': 'США',
    'Islamic Republic of Iran': 'Иран',
    'Chinese Taipei': 'Тайвань',
    'Russian Federation': 'Россия',
    'Hong Kong, China': 'Гонконг',
    'Syrian Arab Republic': 'Сирия',
    'Republic of Moldova': 'Молдова',
    'Kingdom of Saudi Arabia': 'Саудовская Аравия',
    'Bosnia and Herzegovina': 'Босния и Герцеговина',
    'Brunei Darussalam': 'Бруней',
    'Central African Republic': 'ЦАР',
    'Democratic Republic of the Congo': 'ДР Конго',
    'Equatorial Guinea': 'Экваториальная Гвинея',
    "Lao People's Democratic Republic": 'Лаос',
    'United Republic of Tanzania': 'Танзания',
    'United States Virgin Islands': 'Виргинские Острова (США)',
    'British Virgin Islands': 'Британские Виргинские Острова',
    'The Gambia': 'Гамбия',

    // Острова и микрогосударства (которых нет на глобусе, но есть в статистике)
    'American Samoa': 'Американское Самоа', 'Andorra': 'Андорра', 'Antigua and Barbuda': 'Антигуа и Барбуда',
    'Aruba': 'Аруба', 'Bahrain': 'Бахрейн', 'Barbados': 'Барбадос', 'Bermuda': 'Бермудские Острова',
    'Cabo Verde': 'Кабо-Верде', 'Cayman Islands': 'Каймановы острова', 'Comoros': 'Коморы',
    'Cook Islands': 'Острова Кука', 'Dominica': 'Доминика', 'Eswatini': 'Эсватини',
    'Federated States of Micronesia': 'Микронезия', 'Grenada': 'Гренада', 'Guam': 'Гуам',
    'Guinea Bissau': 'Гвинея-Бисау', 'Kiribati': 'Кирибати', 'Liechtenstein': 'Лихтенштейн',
    'Maldives': 'Мальдивы', 'Malta': 'Мальта', 'Marshall Islands': 'Маршалловы Острова',
    'Mauritius': 'Маврикий', 'Monaco': 'Монако', 'Nauru': 'Науру', 'Netherlands Antilles': 'Нид. Антильские острова',
    'Palau': 'Палау', 'Saint Kitts and Nevis': 'Сент-Китс и Невис', 'Saint Lucia': 'Сент-Люсия',
    'Saint Vincent and the Grenadines': 'Сент-Винсент и Гренадины', 'Samoa': 'Самоа',
    'San Marino': 'Сан-Марино', 'Seychelles': 'Сейшелы', 'Singapore': 'Сингапур',
    'Solomon Islands': 'Соломоновы Острова', 'South Sudan': 'Южный Судан', 'São Tomé and Príncipe': 'Сан-Томе и Принсипи',
    'Tonga': 'Тонга', 'Tuvalu': 'Тувалу',

    // Общий список стран...
    'Germany': 'Германия', 'Cuba': 'Куба', 'Spain': 'Испания', 'Hungary': 'Венгрия', 
    'France': 'Франция', 'Australia': 'Австралия', 'Canada': 'Канада', 'Italy': 'Италия', 
    'Romania': 'Румыния', 'Japan': 'Япония', 'Bulgaria': 'Болгария', 'Poland': 'Польша', 
    'Netherlands': 'Нидерланды', 'Kenya': 'Кения', 'Norway': 'Норвегия', 'Türkiye': 'Турция', 
    'Turkey': 'Турция', 'Indonesia': 'Индонезия', 'Brazil': 'Бразилия', 'Greece': 'Греция', 
    'Sweden': 'Швеция', 'New Zealand': 'Новая Зеландия', 'Finland': 'Финляндия', 'Denmark': 'Дания', 
    'Morocco': 'Марокко', 'Ireland': 'Ирландия', 'Ethiopia': 'Эфиопия', 'Algeria': 'Алжир', 
    'Estonia': 'Эстония', 'Lithuania': 'Литва', 'Switzerland': 'Швейцария', 'Jamaica': 'Ямайка', 
    'Nigeria': 'Нигерия', 'Latvia': 'Латвия', 'Austria': 'Австрия', 'Namibia': 'Намибия', 
    'South Africa': 'ЮАР', 'Belgium': 'Бельгия', 'Croatia': 'Хорватия', 'Israel': 'Израиль', 
    'Mexico': 'Мексика', 'Peru': 'Перу', 'Mongolia': 'Монголия', 'Slovenia': 'Словения', 
    'Argentina': 'Аргентина', 'Colombia': 'Колумбия', 'Ghana': 'Гана', 'Malaysia': 'Малайзия', 
    'Pakistan': 'Пакистан', 'Philippines': 'Филиппины', 'Puerto Rico': 'Пуэрто-Рико', 'Qatar': 'Катар', 
    'Suriname': 'Суринам', 'Thailand': 'Таиланд', 'The Bahamas': 'Багамские Острова', 'Bahamas': 'Багамские Острова',
    'Ukraine': 'Украина', 'Czechia': 'Чехия', 'Kazakhstan': 'Казахстан', 'Belarus': 'Беларусь', 
    'Slovakia': 'Словакия', 'Armenia': 'Армения', 'Portugal': 'Португалия', 'Burundi': 'Бурунди', 
    'Costa Rica': 'Коста-Рика', 'Ecuador': 'Эквадор', 'Uzbekistan': 'Узбекистан', 'Azerbaijan': 'Азербайджан', 
    'Zambia': 'Замбия', 'Georgia': 'Грузия', 'Trinidad and Tobago': 'Тринидад и Тобаго', 
    'India': 'Индия', 'Mozambique': 'Мозамбик', 'Tunisia': 'Тунис', 'Uganda': 'Уганда', 
    'Cameroon': 'Камерун', 'Sri Lanka': 'Шри-Ланка', 'Uruguay': 'Уругвай', 'Vietnam': 'Вьетнам', 
    'Chile': 'Чили', 'Iceland': 'Исландия', 'Kuwait': 'Кувейт', 
    'Kyrgyzstan': 'Кыргызстан', 'North Macedonia': 'Северная Македония', 'Macedonia': 'Северная Македония',
    'Egypt': 'Египет', 'Zimbabwe': 'Зимбабве', 'Dominican Republic': 'Доминиканская Республика', 
    'Dominican Rep.': 'Доминиканская Республика', 'United Arab Emirates': 'ОАЭ', 'Paraguay': 'Парагвай', 
    'Venezuela': 'Венесуэла', 'Eritrea': 'Эритрея', 'Panama': 'Панама', 'Serbia': 'Сербия', 
    'Tajikistan': 'Таджикистан', 'Sudan': 'Судан', 'Afghanistan': 'Афганистан', 'Togo': 'Того',
    'Cyprus': 'Кипр', 'Gabon': 'Габон', 'Guatemala': 'Гватемала', 'Montenegro': 'Черногория', 
    "Côte d'Ivoire": 'Кот-д’Ивуар', 'Fiji': 'Фиджи', 'Jordan': 'Иордания', 'Kosovo': 'Косово', 
    'Niger': 'Нигер', 'Turkmenistan': 'Туркменистан', 'Burkina Faso': 'Буркина-Фасо', 'Luxembourg': 'Люксембург',

    // Дополнительные страны с глобуса...
    'Tanzania': 'Танзания', 'W. Sahara': 'Западная Сахара', 'Papua New Guinea': 'Папуа — Новая Гвинея', 
    'Dem. Rep. Congo': 'ДР Конго', 'Somalia': 'Сомали', 'Chad': 'Чад', 'Haiti': 'Гаити', 
    'Falkland Is.': 'Фолклендские острова', 'Greenland': 'Гренландия', 'Fr. S. Antarctic Lands': 'Французские Южные территории', 
    'Timor-Leste': 'Восточный Тимор', 'Lesotho': 'Лесото', 'Bolivia': 'Боливия', 'Nicaragua': 'Никарагуа', 
    'Honduras': 'Гондурас', 'El Salvador': 'Сальвадор', 'Belize': 'Белиз', 'Guyana': 'Гайана', 
    'Senegal': 'Сенегал', 'Mali': 'Мали', 'Mauritania': 'Мавритания', 'Benin': 'Бенин', 'Guinea': 'Гвинея', 
    'Guinea-Bissau': 'Гвинея-Бисау', 'Liberia': 'Либерия', 'Sierra Leone': 'Сьерра-Леоне', 
    'Congo': 'Республика Конго', 'Malawi': 'Малави', 'Angola': 'Ангола', 'Lebanon': 'Ливан', 
    'Madagascar': 'Мадагаскар', 'Palestine': 'Палестина', 'Iraq': 'Ирак', 'Oman': 'Оман', 
    'Vanuatu': 'Вануату', 'Cambodia': 'Камбоджа', 'Myanmar': 'Мьянма', 'Bangladesh': 'Бангладеш', 
    'Bhutan': 'Бутан', 'Nepal': 'Непал', 'Albania': 'Албания', 'New Caledonia': 'Новая Каледония', 
    'Yemen': 'Йемен', 'Antarctica': 'Антарктида', 'N. Cyprus': 'Северный Кипр', 'Libya': 'Ливия', 
    'Djibouti': 'Джибути', 'Somaliland': 'Сомалиленд', 'Rwanda': 'Руанда', 'Taiwan': 'Тайвань'
};

const OCEANS_AND_SEAS =[
    { name: "Тихий океан", coords: [-150, 0], type: "ocean" },
    { name: "Тихий океан", coords: [160, 0], type: "ocean" },
    { name: "Атлантический океан", coords: [-35, 20], type: "ocean" },
    { name: "Атлантический океан", coords: [-20, -25], type: "ocean" },
    { name: "Индийский океан", coords: [80, -20], type: "ocean" },
    { name: "Северный Ледовитый океан", coords:[0, 85], type: "ocean" },
    { name: "Южный океан", coords:[90, -60], type: "ocean" },
    
    { name: "Средиземное море", coords: [18, 34], type: "sea" },
    { name: "Карибское море", coords: [-75, 15], type: "sea" },
    { name: "Аравийское море", coords: [65, 15], type: "sea" },
    { name: "Филиппинское море", coords: [135, 15], type: "sea" },
    { name: "Берингово море", coords:[175, 58], type: "sea" },
    { name: "Охотское море", coords:[150, 52], type: "sea" },
    { name: "Коралловое море", coords: [160, -15], type: "sea" }
];

const RUSSIA_PROMO_MARKER = {
    name: "Россия: вся статистика",
    coords: [100, 60],
    flag: "https://upload.wikimedia.org/wikipedia/en/f/f3/Flag_of_Russia.svg",
    link: "https://xtaztdtehfn3xtoxaxenj2.streamlit.app/"
};

const style = getComputedStyle(document.documentElement);
const config = {
    waterColor: style.getPropertyValue('--globe-water').trim(),
    landColor: style.getPropertyValue('--globe-land').trim(),
    participantColor: style.getPropertyValue('--globe-participant').trim(),
    borderColor: style.getPropertyValue('--globe-border').trim(),
    outlineColor: style.getPropertyValue('--globe-outline').trim(),
    medalMinColor: style.getPropertyValue('--medal-min-color').trim(),
    medalMaxColor: style.getPropertyValue('--medal-max-color').trim(),
    globeStrokeColor: style.getPropertyValue('--globe-stroke-color').trim(),
};

const state = { width: 0, height: 0, dpr: window.devicePixelRatio || 1, baseScale: 1, zoomK: 1 };

const projection = d3.geoOrthographic().precision(0.1);
const path = d3.geoPath().projection(projection).context(context);
const pathString = d3.geoPath().projection(projection);

// SVG векторного огня
const FLAME_SVG = `
<svg width="24" height="24" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>
        .svg-flame { transform-origin: 50% 90%; animation: burn 0.8s infinite ease-in-out alternate; }
        .svg-flame.inner { animation: burn-inner 0.6s infinite ease-in-out alternate; }
        @keyframes burn {
            0% { transform: scale(1) skew(0deg); fill: #ff5722; }
            50% { transform: scale(1.05) skew(-2deg); fill: #ff9800; }
            100% { transform: scale(0.95) skew(2deg); fill: #ff3d00; }
        }
        @keyframes burn-inner {
            0% { transform: scale(1) translateY(0); fill: #ffeb3b; }
            100% { transform: scale(0.8) translateY(-2px); fill: #ffffff; }
        }
    </style>
    <path class="svg-flame" d="M15 2C15 2 7 9 7 16C7 20.4183 10.5817 24 15 24C19.4183 24 23 20.4183 23 16C23 9 15 2 15 2Z"/>
    <path class="svg-flame inner" d="M15 8C15 8 10 13 10 17C10 19.7614 12.2386 22 15 22C17.7614 22 20 19.7614 20 17C20 13 15 8 15 8Z"/>
</svg>`;

function resizeGlobe() {
    const rect = globeContainer.getBoundingClientRect();
    state.width = Math.max(1, Math.round(rect.width));
    state.height = Math.max(1, Math.round(rect.height));
    state.dpr = window.devicePixelRatio || 1;

    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    canvas.width = Math.round(state.width * state.dpr);
    canvas.height = Math.round(state.height * state.dpr);

    context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    state.baseScale = Math.min(state.width, state.height) * 0.75 / 2;
    projection.translate([state.width / 2, state.height / 2]).scale(state.baseScale * state.zoomK);
}

resizeGlobe();
window.addEventListener('resize', resizeGlobe);

const btnPrev2 = document.getElementById('btn-prev-2');
const btnPrev1 = document.getElementById('btn-prev-1');
const btnNext1 = document.getElementById('btn-next-1');
const btnNext2 = document.getElementById('btn-next-2');

const btnDummyPrev2 = document.getElementById('btn-dummy-prev-2');
const btnDummyPrev1 = document.getElementById('btn-dummy-prev-1');
const btnDummyNext1 = document.getElementById('btn-dummy-next-1');
const btnDummyNext2 = document.getElementById('btn-dummy-next-2');

const tooltip = document.getElementById('tooltip');
const hostCityMarker = document.getElementById('host-city-marker');

let worldData = null;
let landMesh = null;
let olympicsList = [];
let parsedMedalData = {};
let barChartData = [];
let isStatsVisible = true; // Глобальный флаг состояния панелей
let currentDashboardView = 'world'; // Может быть 'world' или 'russia'
let selectedCountry = null;
let articlesData = {};
let maxMedals = {};
let rusSpecialElement = null;
let currentIndex = 0;
let isAnimating = false;
let particles = [];
let hoveredCountry = null;
let currentRotate =[0, 0, 0];
let targetRotate = [0, 0, 0];

function getMedalData(topoName, currentEdition) {
    const datasetNames = COUNTRY_MAPPER[topoName] || [topoName];
    const editionData = parsedMedalData[currentEdition] || {};

    for (const name of datasetNames) {
        if (editionData[name]) {
            return { 
                ...editionData[name], 
                teamName: name,
                teamNameRu: TRANSLATIONS[name] || name // Переводим название
            };
        }
    }

    // Если нет медалей
    return { 
        gold: 0, silver: 0, bronze: 0, total: 0, 
        isParticipant: false, 
        teamName: topoName,
        teamNameRu: TRANSLATIONS[topoName] || topoName
    };
}

async function init() {
    try {
        olympicsList = await d3.json("data/hosts.json");
        const markersContainer = document.getElementById('markers-container');

        barChartData = await d3.json("data/results.json");
        articlesData = await d3.json("data/articles.json");

        // === ВЫНЕСЛИ СОЗДАНИЕ МАРКЕРА РОССИИ ИЗ ЦИКЛА (делаем 1 раз) ===
        const promoEl = document.createElement('a');
        promoEl.className = 'special-rus-marker hidden';
        promoEl.href = RUSSIA_PROMO_MARKER.link;
        promoEl.target = '_blank';
        promoEl.innerHTML = `
            <div class="promo-container">
                <img src="${RUSSIA_PROMO_MARKER.flag}" alt="RU" class="promo-flag">
                <div class="promo-label">${RUSSIA_PROMO_MARKER.name}</div>
            </div>
        `;
        markersContainer.appendChild(promoEl);
        rusSpecialElement = promoEl;

        // Тепер цикл только для городов
        olympicsList.forEach((oly, i) => {
            parsedMedalData[oly.edition] = {};
            maxMedals[oly.edition] = 0;
            
            const el = document.createElement('a');
            el.className = 'host-city hidden';
            el.href = oly.link || '#';
            el.target = '_blank';

            const flagHtml = (oly.flag && oly.flag.trim() !== "") 
                ? `<img class="host-flag" src="${oly.flag}" alt="Flag">` 
                : `<div class="host-flag" style="background: #ccc;"></div>`;

            el.innerHTML = `
                ${flagHtml}
                <div class="torch-icon">${FLAME_SVG}</div>
                <div class="city-name">${oly.city}</div>
            `;

            el.addEventListener('click', (e) => {
                const isFlagClick = e.target.closest('.host-flag');
                const isTorchClick = e.target.closest('.torch-icon');
                if (isFlagClick && i !== currentIndex) {
                    e.preventDefault();
                    switchOlympic(i, true);
                } else if (isTorchClick && i === currentIndex) {
                } else {
                    e.preventDefault();
                }
            });

            markersContainer.appendChild(el);
            oly.domElement = el;
        });

        // ... далее загрузка топологии и медалей (без изменений) ...
        const topology = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
        worldData = topojson.feature(topology, topology.objects.countries);

        landMesh = topojson.mesh(topology, topology.objects.countries, (a, b) => a === b);
        
        const medalData = await d3.json("data/olympicGamesMedalTally.json");
        
        medalData.forEach(row => {
            const edition = row.edition;
            if (edition && parsedMedalData[edition]) {
                const country = row.country || row.Country;
                const total = row.total || row.Total || 0;
                parsedMedalData[edition][country] = {
                    gold: row.gold || row.Gold || 0, 
                    silver: row.silver || row.Silver || 0,
                    bronze: row.bronze || row.Bronze || 0, 
                    total: total, 
                    isParticipant: true
                };
                if (total > maxMedals[edition]) maxMedals[edition] = total;
            }
        });

        // === ДОБАВЛЯЕМ УЧАСТНИКОВ БЕЗ МЕДАЛЕЙ ИЗ БАРЧАРТОВ ===
        barChartData.forEach(row => {
            const edition = row.edition;
            const country = row.country;
            if (edition && country && parsedMedalData[edition]) {
                if (!parsedMedalData[edition][country]) {
                    // Страна участвовала (отправляла спортсменов), но 0 медалей
                    parsedMedalData[edition][country] = {
                        gold: 0, silver: 0, bronze: 0, total: 0, 
                        isParticipant: true
                    };
                } else {
                    parsedMedalData[edition][country].isParticipant = true;
                }
            }
        });

        const initialCity = olympicsList[currentIndex].coords;
        const initialRot = [-initialCity[0], -initialCity[1], 0];
        currentRotate = [...initialRot]; targetRotate = [...initialRot];
        projection.rotate(currentRotate);

        setActiveMarker(currentIndex);
        setupEvents();
        updateUI();

        if (isStatsVisible) {
            document.getElementById('chart-container').classList.remove('hidden');
        }
        renderBarChart(olympicsList[currentIndex].edition);
        renderArticles(olympicsList[currentIndex].edition);
        
        requestAnimationFrame(renderLoop);
    } catch (e) { console.error("Ошибка:", e); }
}

function updateTabsUI() {
    const tabWorld = document.getElementById('tab-world');
    const tabRus = document.getElementById('tab-rus');

    if (currentDashboardView === 'world') {
        tabWorld.classList.add('active');
        tabRus.classList.remove('active');
    } else {
        tabRus.classList.add('active');
        tabWorld.classList.remove('active');
    }

    if (selectedCountry) {
        const stats = getMedalData(selectedCountry.properties.name, olympicsList[currentIndex].edition);
        tabWorld.innerHTML = `${stats.teamNameRu} <span class="clear-filter-btn" id="clear-country-filter">✖</span>`;
        
        setTimeout(() => {
            const clearBtn = document.getElementById('clear-country-filter');
            if (clearBtn) clearBtn.addEventListener('click', (e) => { e.stopPropagation(); clearCountrySelection(); });
        }, 0);
    } else {
        tabWorld.innerHTML = `Весь мир`;
    }
}

function clearCountrySelection() {
    if (selectedCountry) {
        selectedCountry = null;
        updateTabsUI();
        renderBarChart(olympicsList[currentIndex].edition);
        drawGlobe();
    }
}

function renderBarChart(selectedEdition) {
    if (!barChartData) return;

    // 1. Определяем имя России для этой олимпиады
    const datasetNames = COUNTRY_MAPPER["Russia"];
    const editionMedals = parsedMedalData[selectedEdition] || {};
    let currentRusName = "Russian Federation";
    for (const name of datasetNames) {
        if (editionMedals[name]) { currentRusName = name; break; }
    }
    const rusDisplayName = TRANSLATIONS[currentRusName] || currentRusName;
    
    // Обновляем текст на кнопке "Россия"
    document.getElementById("tab-rus").innerText = rusDisplayName;

    let filterCountryName = null;
    if (selectedCountry) {
        const stats = getMedalData(selectedCountry.properties.name, selectedEdition);
        filterCountryName = stats.teamName; 
    }

    const data = barChartData.filter(d => d.edition === selectedEdition);
    
    const nested = d3.rollup(data, v => {
        let wT = 0, wG = 0, wS = 0, wB = 0; 
        let rT = 0, rG = 0, rS = 0, rB = 0; 
        
        v.forEach(d => {
            // Считаем для "Мира", только если нет фильтра ИЛИ если страна совпадает
            if (!filterCountryName || d.country === filterCountryName) {
                wT += d.total; wG += d.gold; wS += d.silver; wB += d.bronze;
            }
            if (d.country === currentRusName) {
                rT += d.total; rG += d.gold; rS += d.silver; rB += d.bronze;
            }
        });
        
        return {
            isTeamSport: v[0].isTeamSport,
            world: { t: wT, g: wG, s: wS, b: wB },
            rus: { t: rT, g: rG, s: rS, b: rB }
        };
    }, d => d.sport);

    // 3. Разделяем на массивы в зависимости от выбранного таба
    let indRows = [];
    let teamRows = [];

    Array.from(nested, ([sport, values]) => {
        // Выбираем данные в зависимости от текущего таба ('world' или 'russia')
        const stats = currentDashboardView === 'world' ? values.world : values.rus;
        
        if (stats.t > 0) {
            const rowObj = { sport, ...stats };
            if (values.isTeamSport) teamRows.push(rowObj);
            else indRows.push(rowObj);
        }
    });

    // Сортируем по количеству участников/команд (по убыванию) и берем Топ-15
    indRows = indRows.sort((a, b) => d3.descending(a.t, b.t)).slice(0, 15);
    teamRows = teamRows.sort((a, b) => d3.descending(a.t, b.t)).slice(0, 15);

    // 4. Цветовые темы
    const theme = currentDashboardView === 'world' 
        ? { bg: "rgba(59, 130, 246, 0.15)", fg: "#3b82f6" }  // Синий для мира
        : { bg: "rgba(239, 68, 68, 0.15)", fg: "#ef4444" };  // Красный для РФ

    // 5. Отрисовываем графики
    drawSubChart("#chart-ind", indRows, theme);
    drawSubChart("#chart-team", teamRows, theme);
}

// Универсальная функция для отрисовки графиков с выносом медалей
function drawSubChart(svgSelector, rows, theme) {
    const svg = d3.select(svgSelector);
    
    const margin = { top: 0, right: 180, bottom: 0, left: 120 }; 
    const rowHeight = 28; 
    const width = 460; 
    
    const height = Math.max(rows.length * rowHeight, 30);

    // Устанавливаем ширину в 100%, чтобы SVG подстраивался под панель, 
    // а высоту оставляем фиксированной в пикселях, чтобы работал скролл контейнера
    svg.attr("viewBox", `0 0 ${width} ${height}`)
       .style("width", "100%")
       .style("height", height + "px") // Явно задаем высоту для корректного скролла
       .attr("height", height);
    
    svg.selectAll("*").remove();

    if (rows.length === 0) {
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", "#94a3b8")
            .attr("font-size", "13px")
            .text("Нет данных об участии");
        return;
    }

    const x = d3.scaleLinear()
        .domain([0, d3.max(rows, d => d.t) || 1])
        .range([margin.left, width - margin.right]);

    const y = d3.scaleBand()
        .domain(rows.map(d => d.sport))
        .range([0, height])
        .paddingInner(0.25);

    const row = svg.selectAll(".sport-row")
        .data(rows).join("g")
        .attr("transform", d => `translate(0, ${y(d.sport)})`);

    // 1. Название спорта
    row.append("text")
        .attr("x", margin.left - 8)
        .attr("y", y.bandwidth() / 2)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle") // Заменили на более надежный dominant-baseline
        .attr("fill", "#1e293b")
        .attr("font-size", "12px")
        .attr("font-weight", "600")
        .text(d => d.sport.length > 18 ? d.sport.substring(0, 16) + '...' : d.sport);

    // 2. Бар (основа)
    row.append("rect")
        .attr("x", margin.left)
        .attr("y", 0)
        .attr("width", d => Math.max(1, x(d.t) - margin.left))
        .attr("height", y.bandwidth())
        .attr("fill", theme.bg)
        .attr("rx", 4);

    // 3. Линия-индикатор на конце бара
    row.append("rect")
        .attr("x", d => Math.max(margin.left, x(d.t) - 2))
        .attr("y", 0)
        .attr("width", 2)
        .attr("height", y.bandwidth())
        .attr("fill", theme.fg)
        .attr("rx", 1);

    // 4. ИЗМЕНЕНИЕ 2: Цифра (Всего участников) ВНЕ бара
    row.append("text")
        .attr("x", d => Math.max(margin.left + 2, x(d.t)) + 6) // Сдвигаем вправо за пределы бара
        .attr("y", y.bandwidth() / 2 + 1)
        .attr("text-anchor", "start")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#475569") // Делаем цвет контрастным (темно-серым)
        .attr("font-size", "11px")
        .attr("font-weight", "bold")
        .text(d => d.t);

    // 5. БЛОК С МЕДАЛЯМИ СПРАВА
    // Сдвинули еще правее, чтобы не пересекалось с цифрами участников
    const medalsGroup = row.append("g")
        .attr("transform", `translate(${width - margin.right + 35}, ${y.bandwidth() / 2 + 2})`);

    row.each(function(d) {
        const g = d3.select(this).select("g"); 
        if (d.g === 0 && d.s === 0 && d.b === 0) {
            g.append("text")
                .attr("fill", "#94a3b8")
                .attr("font-size", "14px")
                .attr("dominant-baseline", "middle")
                .attr("x", 10)
                .text("х");
        } else {
            let currentX = 0;
            
            // ИЗМЕНЕНИЕ 3: Исправленная логика выравнивания медалей
            const drawMedal = (icon, value, color) => {
                if (value > 0) {
                    // Эмодзи
                    g.append("text")
                        .attr("x", currentX)
                        .attr("y", 0)
                        .attr("dominant-baseline", "middle")
                        .attr("class", "chart-medal-icon")
                        .text(icon);
                    
                    currentX += 20; // Фиксированный шаг для иконки
                    
                    // Число медалей (сдвинули y на 1px для идеального выравнивания по центру с эмодзи)
                    g.append("text")
                        .attr("x", currentX + 5)
                        .attr("y", 0)
                        .attr("dominant-baseline", "middle")
                        .attr("class", "chart-medal-text")
                        .attr("fill", color)
                        .text(value);
                    
                    currentX += (value.toString().length * 8) + 12; // Динамический шаг для цифр
                }
            };
            
            drawMedal("🥇", d.g, "#ca8a04"); 
            drawMedal("🥈", d.s, "#64748b"); 
            drawMedal("🥉", d.b, "#b45309"); 
        }
    });
}

function renderArticles(selectedEdition) {
    const container = document.getElementById('articles-content');
    if (!container || !articlesData) return;

    const data = articlesData[selectedEdition];
    if (!data) {
        container.innerHTML = '<p style="color: #64748b; font-size: 12px;">Нет статей для этого года</p>';
        return;
    }

    // 1. Статьи по миру
    let html = `
        <div class="article-group">
            <div class="section-label color-world" style="margin-top: 8px;">Мир</div>
            <div class="world-articles-list">
    `;

    if (Array.isArray(data.world)) {
        data.world.forEach(art => {
            html += `
                <a href="${art.link}" target="_blank" class="article-card">
                    <div class="article-title">${art.title}</div>
                    <div class="article-annotation">${art.annotation}</div>
                </a>
            `;
        });
    }
    
    html += `</div></div>`;

    // 2. Статьи по России (ВОТ ЭТОТ БЛОК МЫ ВЕРНУЛИ)
    html += `
        <div class="article-group">
            <div class="section-label color-rus" style="margin-top: 16px;">Россия</div>
            <div class="rus-articles-list">
    `;

    if (Array.isArray(data.russia)) {
        data.russia.forEach(art => {
            html += `
                <a href="${art.link}" target="_blank" class="article-card">
                    <div class="article-title">${art.title}</div>
                    <div class="article-annotation">${art.annotation}</div>
                </a>
            `;
        });
    }

    html += `</div></div>`;
    
    container.innerHTML = html;
    
    // Показываем контейнер, если он был скрыт
    if (isStatsVisible) {
        document.getElementById('articles-container').classList.remove('hidden');
    }
}

function drawOceanLabels() {
    // Настройки шрифта
    context.textAlign = "center";
    context.textBaseline = "middle";

    OCEANS_AND_SEAS.forEach(water => {
        // Проверяем, находится ли эта точка на видимой стороне глобуса
        const isVisible = pathString({type: "Point", coordinates: water.coords});
        
        if (isVisible) {
            const [x, y] = projection(water.coords);
            
            // Если океан — шрифт крупнее, если море — мельче
            const fontSize = water.type === "ocean" ? 14 : 10;
            context.font = `italic 600 ${fontSize}px sans-serif`;

            // 1. Белая полупрозрачная обводка (чтобы текст читался даже поверх линий суши)
            context.lineWidth = 2.5;
            context.strokeStyle = "rgba(255, 255, 255, 0.6)";
            context.strokeText(water.name, x, y);

            // 2. Сам цвет текста (мягкий сине-серый цвет воды)
            context.fillStyle = "rgba(100, 143, 186, 0.85)";
            context.fillText(water.name, x, y);
        }
    });
}

function drawGlobe() {
    context.clearRect(0, 0, state.width, state.height);
    
    context.beginPath(); path({type: "Sphere"});
    context.fillStyle = config.waterColor; context.fill();
    context.lineWidth = 2; context.strokeStyle = config.outlineColor; context.stroke();

    if (!worldData || olympicsList.length === 0) return;

    const currentEdition = olympicsList[currentIndex].edition;
    const max = maxMedals[currentEdition] || 1;
    const colorScale = d3.scaleLinear().domain([1, max]).range([config.medalMinColor, config.medalMaxColor]);

    worldData.features.forEach(feature => {
        context.beginPath(); path(feature);
        
        const stats = getMedalData(feature.properties.name, currentEdition);
        let fillColor = config.landColor; 
        
        if (stats.total > 0) fillColor = colorScale(stats.total);
        else if (stats.isParticipant) fillColor = config.participantColor;

        if (feature === selectedCountry || feature === hoveredCountry) {
            context.fillStyle = d3.color(fillColor).brighter(0.4);
            // Если кликнута — делаем линию толще
            context.lineWidth = feature === selectedCountry ? 2.5 : 1.5; 
            context.strokeStyle = "#1e293b"; 
        } else {
            context.fillStyle = fillColor;
            context.lineWidth = 0.5; context.strokeStyle = config.borderColor;
        }
        
        context.fill(); context.stroke();
    });

    if (landMesh) {
        context.beginPath(); 
        path(landMesh);
        context.lineWidth = 0.8; 
        context.strokeStyle = "#000000";
        context.stroke();
    }

    drawOceanLabels();
}



function setActiveMarker(index) {
    olympicsList.forEach((oly, i) => {
        if (i === index) {
            oly.domElement.classList.add('active');
        } else {
            oly.domElement.classList.remove('active');
        }
    });
}

function updateCityMarkers() {
    if (olympicsList.length === 0) return;
    
    // 1. Обновляем города
    olympicsList.forEach((oly) => {
        const coords = oly.coords;
        const isVisible = pathString({type: "Point", coordinates: coords});
        const el = oly.domElement;
        
        if (isVisible) {
            const [x, y] = projection(coords);
            el.classList.remove('hidden');
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
        } else {
            el.classList.add('hidden');
        }
    });

    // 2. Обновляем маркер России (ОДИН РАЗ, вне цикла городов)
    if (rusSpecialElement) {
        const coords = RUSSIA_PROMO_MARKER.coords;
        const isVisible = pathString({type: "Point", coordinates: coords});
        
        if (isVisible) {
            const [x, y] = projection(coords);
            rusSpecialElement.classList.remove('hidden');
            rusSpecialElement.style.left = `${x}px`;
            rusSpecialElement.style.top = `${y}px`;
        } else {
            rusSpecialElement.classList.add('hidden');
        }
    }
}

function updateAndDrawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.life -= p.decay;
        
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        
        const coords = projection(p.coords);
        if (coords && pathString({type: "Point", coordinates: p.coords})) {
            context.beginPath(); 
            context.arc(coords[0] + p.offsetX, coords[1] + p.offsetY, Math.max(0.1, p.life * p.size), 0, Math.PI * 2);
            context.fillStyle = `rgba(255, ${Math.floor(p.life * 220)}, ${Math.floor(Math.pow(p.life, 3) * 100)}, ${p.life})`; 
            context.fill();
            p.offsetY -= 0.5; 
        }
    }
    context.globalCompositeOperation = 'source-over';
}

function renderLoop() {
    if (!isAnimating) {
        currentRotate[0] += (targetRotate[0] - currentRotate[0]) * 0.15;
        currentRotate[1] += (targetRotate[1] - currentRotate[1]) * 0.15;
        projection.rotate(currentRotate);
    }
    drawGlobe(); 
    updateAndDrawParticles(); 
    updateCityMarkers();
    requestAnimationFrame(renderLoop);
}

function setupEvents() {
    const drag = d3.drag()
        .on("start", () => { canvas.style.cursor = 'grabbing'; })
        .on("drag", (event) => {
            if (isAnimating) return;
            const degPerPixel = 360 / (2 * Math.PI * projection.scale());
            targetRotate[0] += event.dx * degPerPixel;
            targetRotate[1] = Math.max(-90, Math.min(90, targetRotate[1] - event.dy * degPerPixel));
        })
        .on("end", () => { canvas.style.cursor = hoveredCountry ? 'pointer' : 'grab'; });

    const zoom = d3.zoom().scaleExtent([1, 2]).on("zoom", (event) => {
        if (isAnimating) return;
        state.zoomK = event.transform.k;
        projection.scale(state.baseScale * state.zoomK);
    });

    d3.select(canvas).call(drag).call(zoom);

    canvas.addEventListener('mousemove', (event) => {
        if (isAnimating) return;
        const rect = canvas.getBoundingClientRect();
        const coords = projection.invert([event.clientX - rect.left, event.clientY - rect.top]);
        
        if (!coords) { hoveredCountry = null; hideTooltip(); canvas.style.cursor = 'grab'; return; }

        const newHovered = worldData.features.find(f => d3.geoContains(f, coords));
        
        if (newHovered) {
            hoveredCountry = newHovered;
            canvas.style.cursor = 'pointer';

            const mapName = hoveredCountry.properties.name;
            const stats = getMedalData(mapName, olympicsList[currentIndex].edition);
            const displayName = stats.teamNameRu; 
            
            document.getElementById('tt-country').innerText = stats.isParticipant ? displayName : displayName + " (Нет данных)";
            document.getElementById('tt-gold').innerText = stats.gold;
            document.getElementById('tt-silver').innerText = stats.silver;
            document.getElementById('tt-bronze').innerText = stats.bronze;
            document.getElementById('tt-total').innerText = stats.total;
            
            tooltip.classList.remove('hidden');
            tooltip.style.left = `${event.clientX}px`;
            tooltip.style.top = `${event.clientY}px`;
        } else {
            hoveredCountry = null;
            hideTooltip();
            canvas.style.cursor = 'grab';
        }
    });

    canvas.addEventListener('click', (event) => {
        if (isAnimating || olympicsList.length === 0) return;
        const rect = canvas.getBoundingClientRect();
        const coords = projection.invert([event.clientX - rect.left, event.clientY - rect.top]);
        
        if (!coords) { clearCountrySelection(); return; }

        const clickedCountry = worldData.features.find(f => d3.geoContains(f, coords));
        if (clickedCountry) {
            selectedCountry = clickedCountry;
            currentDashboardView = 'world'; 
            updateTabsUI();
            renderBarChart(olympicsList[currentIndex].edition);
            drawGlobe();
        } else { 
            clearCountrySelection();
        }
    });

    canvas.addEventListener('mouseout', () => { hoveredCountry = null; hideTooltip(); });
    
    btnPrev2.addEventListener('click', () => { if (currentIndex > 1) switchOlympic(currentIndex - 2); });
    btnPrev1.addEventListener('click', () => { if (currentIndex > 0) switchOlympic(currentIndex - 1); });
    btnNext1.addEventListener('click', () => { if (currentIndex < olympicsList.length - 1) switchOlympic(currentIndex + 1); });
    btnNext2.addEventListener('click', () => { if (currentIndex < olympicsList.length - 2) switchOlympic(currentIndex + 2); });

    document.getElementById('tab-world').addEventListener('click', (e) => {
        if(e.target.id !== 'clear-country-filter') {
            currentDashboardView = 'world';
            updateTabsUI();
            renderBarChart(olympicsList[currentIndex].edition);
        }
    });

    document.getElementById('tab-rus').addEventListener('click', (e) => {
        currentDashboardView = 'russia';
        updateTabsUI();
        renderBarChart(olympicsList[currentIndex].edition);
    });

    const btnToggleStats = document.getElementById('btn-toggle-stats');
    const iconEyeOpen = document.getElementById('icon-eye-open');
    const iconEyeClosed = document.getElementById('icon-eye-closed');
    const toggleStatsText = document.getElementById('toggle-stats-text');

    btnToggleStats.addEventListener('click', () => {
        isStatsVisible = !isStatsVisible; // Меняем флаг
        
        const chartContainer = document.getElementById('chart-container');
        const articlesContainer = document.getElementById('articles-container');

        if (isStatsVisible) {
            chartContainer.classList.remove('hidden');
            if (articlesData && articlesData[olympicsList[currentIndex].edition]) {
                articlesContainer.classList.remove('hidden');
            }
            iconEyeOpen.classList.remove('hidden');
            iconEyeClosed.classList.add('hidden');
            toggleStatsText.innerText = 'Скрыть статистику и контекст';
        } else {
            chartContainer.classList.add('hidden');
            articlesContainer.classList.add('hidden');
            iconEyeOpen.classList.add('hidden');
            iconEyeClosed.classList.remove('hidden');
            toggleStatsText.innerText = 'Показать статистику и контекст';
        }
    });
}

function hideTooltip() { tooltip.classList.add('hidden'); }

function updateUI() {
    if (olympicsList.length === 0) return;

    const titleEl = document.getElementById('current-olympic-title');
    
    // Обновляем текст города
    titleEl.innerHTML = olympicsList[currentIndex].city;

    // === Запуск красивой анимации ===
    // Убираем класс, заставляем браузер перерисовать элемент (reflow), и добавляем снова
    titleEl.classList.remove('title-animate');
    void titleEl.offsetWidth; 
    titleEl.classList.add('title-animate');

    // === Управление кнопками (блокируем те, которые выходят за рамки) ===
    document.getElementById('btn-prev-2').disabled = (currentIndex < 2);
    document.getElementById('btn-prev-1').disabled = (currentIndex < 1);
    
    document.getElementById('btn-next-1').disabled = (currentIndex > olympicsList.length - 2);
    document.getElementById('btn-next-2').disabled = (currentIndex > olympicsList.length - 3);
}

function switchOlympic(targetIndex, isDirectClick = false) {
    clearCountrySelection();
    
    if (isAnimating || currentIndex === targetIndex) return;

    if (isDirectClick) {
        // === МГНОВЕННЫЙ ПЕРЕХОД ===
        // Если клик по флагу, меняем город сразу без анимации камеры и огня
        hideTooltip(); 
        hoveredCountry = null;
        currentIndex = targetIndex;
        
        const endCoords = olympicsList[targetIndex].coords;
        const newRot = [-endCoords[0], -endCoords[1], 0];
        
        // Моментально поворачиваем глобус
        projection.rotate(newRot);
        currentRotate = [...newRot]; 
        targetRotate = [...newRot];
        
        setActiveMarker(currentIndex); // Включаем огонёк на новом месте
        updateUI(); // Обновляем текст на кнопках
        renderBarChart(olympicsList[currentIndex].edition);
        renderArticles(olympicsList[currentIndex].edition);
        return; // Выходим отсюда, чтобы не запускать d3.transition
    }

    // === ПЛАВНАЯ АНИМАЦИЯ ===
    // (Работает только при клике на кнопки "Вперёд"/"Назад")
    isAnimating = true; 
    hideTooltip(); 
    hoveredCountry = null;
    
    const startCoords = olympicsList[currentIndex].coords;
    const endCoords = olympicsList[targetIndex].coords;
    const interpolateCoords = d3.geoInterpolate(startCoords, endCoords);

    d3.transition().duration(2000).ease(d3.easeCubicInOut).tween("flight", () => {
        return (t) => {
            const currentPoint = interpolateCoords(t);
            const newRot = [-currentPoint[0], -currentPoint[1], 0];
            
            projection.rotate(newRot);
            currentRotate = [...newRot]; targetRotate = [...newRot];
            
            if (t === 0) setActiveMarker(-1); 
            
            if (pathString({type: "Point", coordinates: currentPoint})) {
                for (let i = 0; i < 4; i++) { 
                    particles.push({
                        coords:[...currentPoint], offsetX: (Math.random() - 0.5) * 12, offsetY: (Math.random() - 0.5) * 12,
                        life: 1.0, decay: 0.015 + Math.random() * 0.02, size: Math.random() * 6 + 2 
                    });
                }
            }
        };
    }).on("end", () => {
        isAnimating = false; 
        currentIndex = targetIndex; 
        setActiveMarker(currentIndex);
        updateUI();
        renderBarChart(olympicsList[currentIndex].edition);
        renderArticles(olympicsList[currentIndex].edition);
    });
}

init();
