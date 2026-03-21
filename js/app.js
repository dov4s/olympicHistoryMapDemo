const globeContainer = document.querySelector('.globe-container');
const canvas = document.getElementById('globe-canvas');
const context = canvas.getContext('2d');

const style = getComputedStyle(document.documentElement);
const config = {
    waterColor: style.getPropertyValue('--globe-water').trim(),
    landColor: style.getPropertyValue('--globe-land').trim(),
    participantColor: style.getPropertyValue('--globe-participant').trim(),
    borderColor: style.getPropertyValue('--globe-border').trim(),
    outlineColor: style.getPropertyValue('--globe-outline').trim(),
    medalMinColor: style.getPropertyValue('--medal-min-color').trim(),
    medalMaxColor: style.getPropertyValue('--medal-max-color').trim(),
};

const state = {
    width: 0,
    height: 0,
    dpr: window.devicePixelRatio || 1,
    baseScale: 1,
    zoomK: 1
};

// Проекция D3
const projection = d3.geoOrthographic().precision(0.1);
const path = d3.geoPath().projection(projection).context(context);
// Отдельный генератор без контекста, нужен для математической проверки видимости (Города)
const pathString = d3.geoPath().projection(projection);

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

    /*чтобы у глобуса были отступы от краёв экрана*/
    state.baseScale = Math.min(state.width, state.height) * 0.96 / 2;

    projection
        .translate([state.width / 2, state.height / 2])
        .scale(state.baseScale * state.zoomK);
}

resizeGlobe();
window.addEventListener('resize', resizeGlobe);

// работающие кнопки
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
// не работающие кнопки для красоты
const btnDummyPrev = document.getElementById('btn-dummy-prev');
const btnDummyNext = document.getElementById('btn-dummy-next');

const tooltip = document.getElementById('tooltip');
const hostCityMarker = document.getElementById('host-city-marker');

let worldData = null;
let parsedMedalData = { 2002: {}, 2004: {} };
let maxMedals = { 2002: 0, 2004: 0 };
let currentYear = 2002;
let isAnimating = false;
let particles =[];
let hoveredCountry = null;
let lastHoveredName = "";
let currentRotate =[0, 0, 0];
let targetRotate = [0, 0, 0];

const olympicsInfo = {
    2002: { name: "Солт-Лейк-Сити", coords:[-111.8910, 40.7608], link: "salt-lake.html" },
    2004: { name: "Афины", coords:[23.7275, 37.9838], link: "athens.html" }
};

// МАППЕР
function getMedalData(topoName, year) {
    let searchName = topoName;

    // 1. Приводим современные названия из карты к названиям в ваших данных
    const aliases = {
        "United States of America": "United States",
        "United Kingdom": "Great Britain",
        "South Korea": "Republic of Korea",
        "North Korea": "Democratic People's Republic of Korea",
        "Taiwan": "Chinese Taipei",
        "Czech Republic": "Czechia",
        "The Bahamas": "The Bahamas",
        "Turkey": "Türkiye"
    };

    if (aliases[topoName]) searchName = aliases[topoName];

    // 2. Обработка исторических изменений (Сербия, Черногория)
    // На карте это разные страны, но в 2004 они были "Serbia and Montenegro"
    const balkanStates = ["Serbia", "Montenegro", "Kosovo"];
    if (balkanStates.includes(topoName)) {
        if (year === 2004) searchName = "Serbia and Montenegro";
    }

    // 3. Китай и Гонконг (если нужно подсвечивать отдельно)
    if (topoName === "Hong Kong") searchName = "Hong Kong, China";

    // Ищем данные
    let result = parsedMedalData[year][searchName];

    // Если не нашли по имени, попробуем еще раз, вдруг в данных страна называется "Russia" вместо "Russian Federation"
    if (!result && topoName === "Russia") result = parsedMedalData[year]["Russian Federation"];
    if (!result && topoName === "China") result = parsedMedalData[year]["People's Republic of China"];

    return result || { gold: 0, silver: 0, bronze: 0, total: 0, isParticipant: false };
}

async function init() {
    try {
        const topology = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
        worldData = topojson.feature(topology, topology.objects.countries);
        
        const csvData = await d3.csv("data/Olympic_Games_Medal_Tally.csv");
        csvData.forEach(row => {
            const year = parseInt(row.year || row.Year);
            if (year === 2002 || year === 2004) {
                const country = row.country || row.Country;
                const total = parseInt(row.total || row.Total || 0);
                parsedMedalData[year][country] = {
                    gold: parseInt(row.gold || row.Gold || 0), silver: parseInt(row.silver || row.Silver || 0),
                    bronze: parseInt(row.bronze || row.Bronze || 0), total: total, isParticipant: true
                };
                if (total > maxMedals[year]) maxMedals[year] = total;
            }
        });

        const initialCity = olympicsInfo[currentYear].coords;
        const initialRot = [-initialCity[0], -initialCity[1], 0];
        
        // Задаем начальные значения для сглаживания
        currentRotate = [...initialRot];
        targetRotate = [...initialRot];
        projection.rotate(currentRotate);

        setupEvents();
        updateUI();
        requestAnimationFrame(renderLoop);
    } catch (e) { console.error(e); }
}

function drawGlobe() {
    context.clearRect(0, 0, state.width, state.height);
    
    // Вода
    context.beginPath(); path({type: "Sphere"});
    context.fillStyle = config.waterColor; context.fill();
    context.lineWidth = 2; context.strokeStyle = config.outlineColor; context.stroke();

    if (!worldData) return;

    const max = maxMedals[currentYear] || 1;
    const colorScale = d3.scaleLinear().domain([1, max]).range([config.medalMinColor, config.medalMaxColor]);

    worldData.features.forEach(feature => {
        context.beginPath(); path(feature);
        
        const stats = getMedalData(feature.properties.name, currentYear);
        let fillColor = config.landColor; // Страна не участвовала (СЕРАЯ)
        
        if (stats.total > 0) fillColor = colorScale(stats.total);
        else if (stats.isParticipant) fillColor = config.participantColor; // Участвовала, но без медалей (СВЕТЛАЯ)

        // if (stats.total === 0 && !stats.isParticipant) {
        //     console.log("Не сопоставлено:", feature.properties.name);
        // }

        // ПОДСВЕТКА ПРИ НАВЕДЕНИИ
        if (feature === hoveredCountry) {
            context.fillStyle = d3.color(fillColor).brighter(0.4);
            context.lineWidth = 1.5;
            context.strokeStyle = "#1e293b"; // Темная обводка
            // Слой выводится поверх остальных, поэтому обводку хорошо видно
        } else {
            context.fillStyle = fillColor;
            context.lineWidth = 0.5;
            context.strokeStyle = config.borderColor;
        }
        
        context.fill(); context.stroke();
    });
}

function updateCityMarker() {
    const coords = olympicsInfo[currentYear].coords;
    // Проверка, находится ли город на видимой стороне полусферы
    const isVisible = pathString({type: "Point", coordinates: coords});
    
    if (isVisible && !isAnimating) {
        const [x, y] = projection(coords);
        hostCityMarker.classList.remove('hidden');
        hostCityMarker.style.left = `${x}px`;
        hostCityMarker.style.top = `${y}px`;
        document.getElementById('host-city-name').innerText = olympicsInfo[currentYear].name;
        hostCityMarker.href = olympicsInfo[currentYear].link;
    } else {
        hostCityMarker.classList.add('hidden');
    }
}

function updateAndDrawParticles() {
    // Включаем эффект свечения огня (цвета будут суммироваться, создавая яркий центр)
    // context.globalCompositeOperation = 'lighter';
    
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.life -= p.decay;
        
        if (p.life <= 0) { 
            particles.splice(i, 1); 
            continue; 
        }
        
        // 1. Получаем текущие экранные координаты для этой точки на глобусе
        const coords = projection(p.coords);
        const isVisible = pathString({type: "Point", coordinates: p.coords});
        
        if (coords && isVisible) {
            context.beginPath(); 
            // Рисуем кружок, который уменьшается к концу жизни
            context.arc(coords[0] + p.offsetX, coords[1] + p.offsetY, Math.max(0.1, p.life * p.size), 0, Math.PI * 2);
            
            // 2. Цвета пламени: от белого (начало) к желтому, оранжевому и прозрачному (конец)
            let r = 255;
            let g = Math.floor(p.life * 220); // Быстро уходит в ноль (краснеет)
            let b = Math.floor(Math.pow(p.life, 3) * 100); // Белая вспышка только в самом начале
            
            context.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.life})`; 
            context.fill();
            
            // Легкое поднятие частиц "вверх" по экрану (эффект дыма/ветра)
            p.offsetY -= 0.5; 
        }
    }
    
    // Обязательно выключаем эффект, иначе глобус тоже начнет светиться
    context.globalCompositeOperation = 'source-over';
}

function renderLoop() {
    // Включаем сглаживание, только если глобус не летит по кнопке
    if (!isAnimating) {
        // Формула LERP (Линейная интерполяция)
        // Коэффициент 0.15 означает "каждый кадр проходить 15% оставшегося пути"
        currentRotate[0] += (targetRotate[0] - currentRotate[0]) * 0.15;
        currentRotate[1] += (targetRotate[1] - currentRotate[1]) * 0.15;
        
        projection.rotate(currentRotate);
    }

    drawGlobe(); 
    updateAndDrawParticles(); 
    updateCityMarker();
    requestAnimationFrame(renderLoop);
}

function setupEvents() {
    // 1. ВРАЩЕНИЕ (DRAG)
    const drag = d3.drag()
        .on("start", () => { canvas.style.cursor = 'grabbing'; })
        .on("drag", (event) => {
            if (isAnimating) return;
            
            // Высчитываем, сколько градусов в 1 пикселе при текущем зуме
            // projection.scale() — это радиус глобуса в пикселях
            const degPerPixel = 360 / (2 * Math.PI * projection.scale());
            
            // Меняем не текущее вращение, а целевое (куда глобус ДОЛЖЕН докрутиться)
            targetRotate[0] += event.dx * degPerPixel;
            targetRotate[1] -= event.dy * degPerPixel;
            
            // Ограничитель: не даем глобусу перевернуться вверх ногами (зажатие полюсов)
            targetRotate[1] = Math.max(-90, Math.min(90, targetRotate[1]));
        })
        .on("end", () => { canvas.style.cursor = hoveredCountry ? 'pointer' : 'grab'; });

    // 2. ЗУМ (Колесиком мыши)
    const zoom = d3.zoom()
        .scaleExtent([1, 2])
        .on("zoom", (event) => {
            if (isAnimating) return;
            state.zoomK = event.transform.k;
            projection.scale(state.baseScale * state.zoomK);
        });

    d3.select(canvas).call(drag).call(zoom);

    // 3. hover и тултип
    // Лисенер для подсветки страны при наведении
    canvas.addEventListener('mousemove', (event) => {
        if (isAnimating) return;
        const rect = canvas.getBoundingClientRect();
        const coords = projection.invert([event.clientX - rect.left, event.clientY - rect.top]);
        
        if (!coords) { 
            hoveredCountry = null; 
            canvas.style.cursor = 'grab';
            return; 
        }

        hoveredCountry = worldData.features.find(f => d3.geoContains(f, coords));
        
        if (hoveredCountry) {
            canvas.style.cursor = 'pointer';
        } else {
            canvas.style.cursor = 'grab';
            lastHoveredName = ""; // Сбрасываем, чтобы при следующем клике на ту же страну всё сработало
        }
    });

    // Лисенер для вызова тултипа при клике
    canvas.addEventListener('click', (event) => {
        if (isAnimating) return;
        const rect = canvas.getBoundingClientRect();
        const coords = projection.invert([event.clientX - rect.left, event.clientY - rect.top]);
        
        if (!coords) { hideTooltip(); return; }

        const clickedCountry = worldData.features.find(f => d3.geoContains(f, coords));
        
        if (clickedCountry) {
            const name = clickedCountry.properties.name;
            const stats = getMedalData(name, currentYear);
            
            updateTooltipData(name, stats);
            
            // Тултип появляется в месте клика
            tooltip.classList.remove('hidden');
            tooltip.style.left = `${event.clientX}px`;
            tooltip.style.top = `${event.clientY}px`;
        } else {
            hideTooltip();
        }
    });

    canvas.addEventListener('mouseout', () => { hoveredCountry = null; hideTooltip(); });
    btnPrev.addEventListener('click', () => switchYear(2002));
    btnNext.addEventListener('click', () => switchYear(2004));
}

function updateTooltipData(countryName, stats) {
    document.getElementById('tt-country').innerText = countryName;
    document.getElementById('tt-gold').innerText = stats.gold;
    document.getElementById('tt-silver').innerText = stats.silver;
    document.getElementById('tt-bronze').innerText = stats.bronze;
    document.getElementById('tt-total').innerText = stats.total;
    
    // Подсказка, если страна не участвовала
    if (!stats.isParticipant) {
        document.getElementById('tt-country').innerText = countryName + " (Нет данных)";
    }
}

function hideTooltip() { tooltip.classList.add('hidden'); }

function updateUI() {
    
    // Если текущий год 2002:
    btnPrev.classList.toggle('hidden', currentYear === 2002);
    btnDummyPrev.classList.toggle('hidden', currentYear !== 2002);
    
    // Если текущий год 2004:
    btnNext.classList.toggle('hidden', currentYear === 2004);
    btnDummyNext.classList.toggle('hidden', currentYear !== 2004);
}

function switchYear(targetYear) {
    if (isAnimating || currentYear === targetYear) return;
    isAnimating = true; hideTooltip(); hoveredCountry = null;
    
    const startCoords = olympicsInfo[currentYear].coords;
    const endCoords = olympicsInfo[targetYear].coords;
    
    const interpolateCoords = d3.geoInterpolate(startCoords, endCoords);

    d3.transition().duration(2000).ease(d3.easeCubicInOut).tween("flight", () => {
        return (t) => {
            const currentPoint = interpolateCoords(t);
            
            // СОЗДАЕМ newRot: вычисляем текущее положение вращения
            const newRot = [-currentPoint[0], -currentPoint[1], 0];
            
            // Применяем вращение к проекции
            projection.rotate(newRot);
            
            // СИНХРОНИЗИРУЕМ переменные плавности (LERP), чтобы глобус не дергался после прилета
            currentRotate = [...newRot];
            targetRotate = [...newRot];
            
            // Создание частиц шлейфа
            if (pathString({type: "Point", coordinates: currentPoint})) {
                for (let i = 0; i < 4; i++) { 
                    particles.push({
                        coords:[...currentPoint], 
                        offsetX: (Math.random() - 0.5) * 12,
                        offsetY: (Math.random() - 0.5) * 12,
                        life: 1.0, 
                        decay: 0.015 + Math.random() * 0.02,
                        size: Math.random() * 6 + 2 
                    });
                }
            }
        };
    }).on("end", () => {
        isAnimating = false; 
        currentYear = targetYear; 
        updateUI();
    });
}

init();
