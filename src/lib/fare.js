export const ROUTES = {
    SHRIVARDHAN_BORLI_TO_BORIVALI_VIRAR: "SHRIVARDHAN_BORLI_TO_BORIVALI_VIRAR",
    BORIVALI_VIRAR_TO_BORLI_SHRIVARDHAN: "BORIVALI_VIRAR_TO_BORLI_SHRIVARDHAN",
};

export const BUS_TYPES = {
    NON_AC: "NON_AC",
    AC: "AC",
};

export const AC_SURCHARGE = 0;

/* -------------------------------------------------------
   COMPANY INFO
------------------------------------------------------- */
export const COMPANY_INFO = {
    name: "Shree Morya Travels",
    nameMr: "श्री मोरया ट्रॅव्हल्स",
    phone: "+91 88881 57744",
    routeName: "Shrivardhan - Borli - Borivali - Virar",
    routeNameMr: "श्रीवर्धन - बोर्ली - बोरिवली - विरार",
};

/* -------------------------------------------------------
   CITY SIDE STOPS
   NOTE:
   - Kolad is last village-side slab stop
   - After Kolad all are city-side stops
------------------------------------------------------- */
export const CITY_STOPS = [
    "Panvel ST Stand",
    "Panvel Garden Hotel",
    "Uran Phata",
    "Palspa Phata",
    "Panvel Taka Naka",
    "Khanda Colony",
    "Kalamboli",
    "Kamothe",
    "Kharghar",
    "CBD Belapur",
    "Seawoods",
    "Nerul",
    "Nerul LLP",
    "Juinagar",
    "Sanpada",
    "Vashi",
    "Turbhe Bridge",
    "Mankhurd",
    "Govandi",
    "Chembur Maitri Park",
    "Kurla",
    "Sion Priyadarshini",
    "King Circle",
    "Wadala IMAX",
    "Dadar",
    "BKC",
    "Mahim",
    "Bandra",
    "Khar Road",
    "Santacruz Agripada",
    "Vile Parle Malan Subway",
    "Vile Parle Sambhaji Nagar",
    "Andheri Hanuman Road",
    "Andheri Gundavali",
    "Jogeshwari Elmai College",
    "Goregaon Virvani",
    "Malad Pushpa Park",
    "Kandivali Sai Dham",
    "Kandivali Samtanagar",
    "Borivali National Park",
    "Borivali Depot",
    "Dahisar",
    "Mira Road",
    "Bhayandar",
    "Dashiar Gokul Anand Hotel",
    "Bhirarite",
    "Countan Hotel",
    "Naigaon Highway",
    "Vasai Gokhivare Talav",
    "Nalasopara Railway Station",
    "Radhakrushna Hotel Moregaon",
    "Virar (Manvel Pada Talav)",
];

/* -------------------------------------------------------
   SHRIVARDHAN / SHEKHADI / SARAL SIDE = ₹600
------------------------------------------------------- */
export const SHRIVARDHAN_SIDE_STOPS = [
    "Divegar Ganpati Mandir",
    "Bharadkhol",
    "Shekhadi",
    "Kondavil",
    "Aravai",
    "Valvati",
    "Shrivardhan Gandre Naka",
    "Shrivardhan Bus Depot",
    "Jaswali Phata",
    "Kherdi",
    "Punir",
    "Bhardoli Phata",
    "Chiklap (Shrivardhan)",
    "Shirvane",
    "Hunarveli",
    "Vakhalghar",
    "Vave Panchatan",
    "Nagloli Phata",
    "Nagloli",
    "Dandguru",
    "Devkhol",
];

/* -------------------------------------------------------
   BORLI / DIVEGAR / DIGHI SIDE = ₹500
------------------------------------------------------- */
export const BORLI_DIGHI_SIDE_STOPS = [
    "Asuf",
    "Karle",
    "Khujare",
    "Divegar Phata",
    "Borli Pohamil",
    "Borli Ganesh Chowk",
    "Borli Shivaji Chowk",
    "Borli ST Stand",
    "Borli Samtanagar",
    "Kapoli Phata",
    "Shiste",
    "Vadvali",
    "Khalcha Velas",
    "Varcha Velas",
    "Dighi",
    "Kudgaon",
    "Sarve",
    "Adgaon",
    "Karlas",
    "Surle",
    "Vanjale Road",
    "Essar Pump",
    "Bhava Phata",
];

/* -------------------------------------------------------
   MHASLA SIDE = ₹450
------------------------------------------------------- */
export const MHASLA_SIDE_STOPS = [
    "Vadvali Phata",
    "Gondghar",
    "Borli HP Petrol Pump",
    "Borli Nayra Petrol Pump",
    "Khanlosh",
    "Mendadi Kondh",
    "Mendadi Grampanchayat",
    "Mendadi School",
    "Kharsai School",
    "Kharsai Dam",
    "Khalichi Banoti",
    "Varchi Banoti",
    "Varvatane",
    "Agarwada",
    "Revali",
    "JagamVadi Phata",
    "Tondsure",
    "Tondsure Phata",
    "Sakalap",
    "Mhasala Dighi Road",
    "Mhasla Stand",
    "Mhasla HP Petrol Pump",
    "Mhasla Bharat Petrol Pump",
    "Chiklap (Mhasla)",
    "Devghar",
    "Ghonse",
    "Chandore",
    "Sai",
    "Morba",
    "Pabra Phata",
    "Dorje",
    "Salvinde Phata",
];

/* -------------------------------------------------------
   MANGAON / KOLAD SIDE = ₹350
   NOTE:
   - Kolad is last slab stop
------------------------------------------------------- */
export const MANGAON_SIDE_STOPS = [
    "Mangaon",
    "Mangaon Railway Station",
    "Nizampur Road",
    "Indapur",
    "Kolad",
];

/* -------------------------------------------------------
   ALL VILLAGE STOPS
------------------------------------------------------- */
export const VILLAGE_STOPS = [
    ...SHRIVARDHAN_SIDE_STOPS,
    ...BORLI_DIGHI_SIDE_STOPS,
    ...MHASLA_SIDE_STOPS,
    ...MANGAON_SIDE_STOPS,
];

/* -------------------------------------------------------
   FINAL FARE GROUPS
------------------------------------------------------- */
export const FARE_GROUPS = [
    {
        zone: "SHRIVARDHAN_SIDE",
        fare: 600,
        label: "Shrivardhan Side",
        stops: SHRIVARDHAN_SIDE_STOPS,
    },
    {
        zone: "BORLI_DIGHI_SIDE",
        fare: 500,
        label: "Borli / Divegar / Dighi Side",
        stops: BORLI_DIGHI_SIDE_STOPS,
    },
    {
        zone: "MHASLA_SIDE",
        fare: 450,
        label: "Mhasla Side",
        stops: MHASLA_SIDE_STOPS,
    },
    {
        zone: "MANGAON_SIDE",
        fare: 350,
        label: "Mangaon / Indapur / Kolad Side",
        stops: MANGAON_SIDE_STOPS,
    },
];

/* -------------------------------------------------------
   STOP NAMES IN MARATHI
------------------------------------------------------- */
export const STOP_NAMES_MARATHI = {
    "Divegar Ganpati Mandir": "दिवेआगर गणपती मंदिर",
    "Bharadkhol": "भरडखोल",
    "Shekhadi": "शेखाडी",
    "Kondavil": "कोंडविल",
    "Aravai": "आरावई",
    "Valvati": "वाळवटी",
    "Shrivardhan Gandre Naka": "श्रीवर्धन गांद्रे नाका",
    "Shrivardhan Bus Depot": "श्रीवर्धन बस डेपो",
    "Jaswali Phata": "जसवली फाटा",
    "Kherdi": "खेरडी",
    "Punir": "पुनिर",
    "Bhardoli Phata": "भारडोली फाटा",
    "Chiklap (Shrivardhan)": "चिकलप (श्रीवर्धन)",
    "Shirvane": "शिरवणे",
    "Hunarveli": "हुनरवेली",
    "Vakhalghar": "वाखळघर",
    "Vave Panchatan": "वावे पंचतन",
    "Nagloli Phata": "नागलोली फाटा",
    "Nagloli": "नागलोली",
    "Dandguru": "दांडगुरु",
    "Devkhol": "देवखोल",

    "Asuf": "आसुफ",
    "Karle": "कारले",
    "Khujare": "खुजारे",
    "Divegar Phata": "दिवेआगर फाटा",
    "Borli Pohamil": "बोर्ली पोहामिल",
    "Borli Ganesh Chowk": "बोर्ली गणेश चौक",
    "Borli Shivaji Chowk": "बोर्ली शिवाजी चौक",
    "Borli ST Stand": "बोर्ली एसटी स्टँड",
    "Borli Samtanagar": "बोर्ली समतानगर",
    "Kapoli Phata": "कापोली फाटा",
    "Shiste": "शिस्ते",
    "Vadvali": "वडवली",
    "Khalcha Velas": "खालचा वेळास",
    "Varcha Velas": "वरचा वेळास",
    "Dighi": "दिघी",
    "Kudgaon": "कुडगाव",
    "Sarve": "सर्वे",
    "Adgaon": "आडगाव",
    "Karlas": "करलास",
    "Surle": "सुरळे",
    "Vanjale Road": "वांजळे रोड",
    "Essar Pump": "एस्सार पंप",
    "Bhava Phata": "भावा फाटा",

    "Vadvali Phata": "वडवली फाटा",
    "Gondghar": "गोंडघर",
    "Borli HP Petrol Pump": "बोर्ली एचपी पेट्रोल पंप",
    "Borli Nayra Petrol Pump": "बोर्ली नायरा पेट्रोल पंप",
    "Khanlosh": "खानलोश",
    "Mendadi Kondh": "मेंडडी कोंढ",
    "Mendadi Grampanchayat": "मेंडडी ग्रामपंचायत",
    "Mendadi School": "मेंडडी शाळा",
    "Kharsai School": "खारसई शाळा",
    "Kharsai Dam": "खारसई धरण",
    "Khalichi Banoti": "खालची बनोटी",
    "Varchi Banoti": "वरची बनोटी",
    "Varvatane": "वरवटणे",
    "Agarwada": "आगरवाडा",
    "Revali": "रेवळी",
    "JagamVadi Phata": "जगमवाडी फाटा",
    "Tondsure": "तोंडसुरे",
    "Tondsure Phata": "तोंडसुरे फाटा",
    "Sakalap": "सकळप",
    "Mhasala Dighi Road": "म्हसळा दिघी रोड",
    "Mhasla Stand": "म्हसळा स्टँड",
    "Mhasla HP Petrol Pump": "म्हसळा एचपी पेट्रोल पंप",
    "Mhasla Bharat Petrol Pump": "म्हसळा भारत पेट्रोल पंप",
    "Chiklap (Mhasla)": "चिकलप (म्हसळा)",
    "Devghar": "देवघर",
    "Ghonse": "घोणसे",
    "Chandore": "चांदोरे",
    "Sai": "साई",
    "Morba": "मोर्बा",
    "Pabra Phata": "पाब्रा फाटा",
    "Dorje": "दोरजे",
    "Salvinde Phata": "सालविंदे फाटा",

    "Mangaon": "माणगाव",
    "Mangaon Railway Station": "माणगाव रेल्वे स्टेशन",
    "Nizampur Road": "निजामपूर रोड",
    "Indapur": "इंदापूर",
    "Kolad": "कोलाड",

    "Panvel ST Stand": "पनवेल एसटी स्टँड",
    "Panvel Garden Hotel": "पनवेल गार्डन हॉटेल",
    "Uran Phata": "उरण फाटा",
    "Palspa Phata": "पळस्पे फाटा",
    "Panvel Taka Naka": "पनवेल टक्का नाका",
    "Khanda Colony": "खंडा कॉलनी",
    "Kalamboli": "कळंबोली",
    "Kamothe": "कामोठे",
    "Kharghar": "खारघर",
    "CBD Belapur": "सीबीडी बेलापूर",
    "Seawoods": "सीवूड्स",
    "Nerul": "नेरुळ",
    "Nerul LLP": "नेरुळ एलएलपी",
    "Juinagar": "जुईनगर",
    "Sanpada": "सानपाडा",
    "Vashi": "वाशी",
    "Turbhe Bridge": "तुर्भे ब्रिज",
    "Mankhurd": "मानखुर्द",
    "Govandi": "गोवंडी",
    "Chembur Maitri Park": "चेंबूर मैत्री पार्क",
    "Kurla": "कुर्ला",
    "Sion Priyadarshini": "सायन प्रियदर्शिनी",
    "King Circle": "किंग सर्कल",
    "Wadala IMAX": "वडाळा आयमॅक्स",
    "Dadar": "दादर",
    "BKC": "बीकेसी",
    "Mahim": "माहीम",
    "Bandra": "बांद्रा",
    "Khar Road": "खार रोड",
    "Santacruz Agripada": "सांताक्रूझ आग्रीपाडा",
    "Vile Parle Malan Subway": "विले पार्ले मलन सबवे",
    "Vile Parle Sambhaji Nagar": "विले पार्ले संभाजी नगर",
    "Andheri Hanuman Road": "अंधेरी हनुमान रोड",
    "Andheri Gundavali": "अंधेरी गुंदावली",
    "Jogeshwari Elmai College": "जोगेश्वरी एल्माई कॉलेज",
    "Goregaon Virvani": "गोरेगाव विरवाणी",
    "Malad Pushpa Park": "मालाड पुष्पा पार्क",
    "Kandivali Sai Dham": "कांदिवली साईधाम",
    "Kandivali Samtanagar": "कांदिवली समतानगर",
    "Borivali National Park": "बोरिवली नॅशनल पार्क",
    "Borivali Depot": "बोरिवली डेपो",
    "Dahisar": "दहिसर",
    "Mira Road": "मीरा रोड",
    "Bhayandar": "भाईंदर",
    "Dashiar Gokul Anand Hotel": "दहिसर गोकुळ आनंद हॉटेल",
    "Bhirarite": "भिरारीटे",
    "Countan Hotel": "काउंटन हॉटेल",
    "Naigaon Highway": "नायगाव हायवे",
    "Vasai Gokhivare Talav": "वसई गोखिवरे तलाव",
    "Nalasopara Railway Station": "नालासोपारा रेल्वे स्टेशन",
    "Radhakrushna Hotel Moregaon": "राधाकृष्ण हॉटेल मोरेगाव",
    "Virar (Manvel Pada Talav)": "विरार (मनवेल पाडा तलाव)",
};

/* -------------------------------------------------------
   STOP ALIASES / NORMALIZATION
------------------------------------------------------- */
const STOP_ALIASES = {
    // Main village aliases
    shrivardhan: "Shrivardhan Bus Depot",
    "shrivardhan bus depot": "Shrivardhan Bus Depot",
    "shrivardhan gandre naka": "Shrivardhan Gandre Naka",
    shekhadi: "Shekhadi",
    shekhdai: "Shekhadi",
    shirvane: "Shirvane",
    shrivane: "Shirvane",
    "vave panchatan": "Vave Panchatan",
    vave: "Vave Panchatan",
    dandguri: "Dandguru",
    dandguru: "Dandguru",
    danguri: "Dandguru",
    danguru: "Dandguru",
    devkhol: "Devkhol",
    divegar: "Divegar Ganpati Mandir",
    "divegar phata": "Divegar Phata",
    borli: "Borli ST Stand",
    "borli st stand": "Borli ST Stand",
    mhasla: "Mhasla Stand",
    mendadi: "Mendadi School",
    banoti: "Khalichi Banoti",
    mangaon: "Mangaon",
    mangoan: "Mangaon",
    "mangaon railway station": "Mangaon Railway Station",
    "mangoan railway station": "Mangaon Railway Station",
    kolad: "Kolad",

    // City aliases
    panvel: "Panvel ST Stand",
    "panvel st stand": "Panvel ST Stand",
    vashi: "Vashi",
    dadar: "Dadar",
    borivali: "Borivali Depot",
    "borivali depot": "Borivali Depot",
    virar: "Virar (Manvel Pada Talav)",
    "virar manvel pada talav": "Virar (Manvel Pada Talav)",
    "wadala imax": "Wadala IMAX",
    bhayandar: "Bhayandar",
    bhaindar: "Bhayandar",
    dahisar: "Dahisar",
    "mira road": "Mira Road",
    mahim: "Mahim",
    "king circle": "King Circle",
    "khar road": "Khar Road",
};

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */
function sanitizeStopKey(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/[^\p{L}\p{M}\s()]/gu, "")
        .replace(/\s+/g, " ")
        .trim();
}

function compactStopKey(value) {
    return sanitizeStopKey(value).replace(/\s+/g, "");
}

export function normalizeStopName(stop) {
    if (!stop) return "";

    if (typeof stop === "object") {
        const objName = String(stop.name || "").trim();
        if (!objName) return "";
        const rawObj = sanitizeStopKey(objName);
        const compactObj = compactStopKey(objName);
        return STOP_ALIASES[rawObj] || STOP_ALIASES[compactObj] || objName;
    }

    const raw = sanitizeStopKey(stop);
    const compact = compactStopKey(stop);

    return STOP_ALIASES[raw] || STOP_ALIASES[compact] || String(stop).trim();
}

/* -------------------------------------------------------
   DISPLAY HELPERS
------------------------------------------------------- */
export function getStopNameMarathi(stop) {
    const normalized = normalizeStopName(stop);
    return STOP_NAMES_MARATHI[normalized] || normalized;
}

export function getStopDisplayName(stop) {
    const normalized = normalizeStopName(stop);
    const marathi = getStopNameMarathi(normalized);

    if (marathi && marathi !== normalized) {
        return `${normalized} (${marathi})`;
    }

    return normalized;
}

export function getStopDisplayFromObject(stop) {
    if (!stop) return "";

    if (typeof stop === "string") {
        const normalized = normalizeStopName(stop);
        return `${normalized} (${getStopNameMarathi(normalized)})`;
    }

    const english = normalizeStopName(stop.name || "");
    const marathi = stop.nameMr || getStopNameMarathi(english);

    return marathi ? `${english} (${marathi})` : english;
}

export function createStopObject(stopName, time = "") {
    const normalized = normalizeStopName(stopName);
    return {
        name: normalized,
        nameMr: getStopNameMarathi(normalized),
        time: time || "",
    };
}

export function getStopsWithMarathi(stops = []) {
    return stops.map((stop) => ({
        english: normalizeStopName(stop),
        marathi: getStopNameMarathi(stop),
        display: getStopDisplayName(stop),
    }));
}

/* -------------------------------------------------------
   CHECK HELPERS
------------------------------------------------------- */
export function isCityStop(stop) {
    const normalized = normalizeStopName(stop);
    return CITY_STOPS.includes(normalized);
}

export function isVillageStop(stop) {
    const normalized = normalizeStopName(stop);
    return VILLAGE_STOPS.includes(normalized);
}

export function isForwardRoute(route) {
    return route === ROUTES.SHRIVARDHAN_BORLI_TO_BORIVALI_VIRAR;
}

export function isReturnRoute(route) {
    return route === ROUTES.BORIVALI_VIRAR_TO_BORLI_SHRIVARDHAN;
}

/* -------------------------------------------------------
   ROUTE HELPERS
------------------------------------------------------- */
export function getVillageStopsByRoute(route) {
    switch (route) {
        case ROUTES.SHRIVARDHAN_BORLI_TO_BORIVALI_VIRAR:
        case ROUTES.BORIVALI_VIRAR_TO_BORLI_SHRIVARDHAN:
            return VILLAGE_STOPS;
        default:
            return [];
    }
}

export function getFareGroupsByRoute(route) {
    switch (route) {
        case ROUTES.SHRIVARDHAN_BORLI_TO_BORIVALI_VIRAR:
        case ROUTES.BORIVALI_VIRAR_TO_BORLI_SHRIVARDHAN:
            return FARE_GROUPS;
        default:
            return [];
    }
}

export function getFareZoneForStop(route, stop) {
    const normalized = normalizeStopName(stop);
    const groups = getFareGroupsByRoute(route);

    for (const group of groups) {
        if (group.stops.includes(normalized)) {
            return {
                zone: group.zone,
                label: group.label,
                baseFare: group.fare,
                stop: normalized,
            };
        }
    }

    return null;
}

export function getRouteDirectionLabel(route) {
    switch (route) {
        case ROUTES.SHRIVARDHAN_BORLI_TO_BORIVALI_VIRAR:
            return "Shrivardhan / Borli → Borivali / Virar";
        case ROUTES.BORIVALI_VIRAR_TO_BORLI_SHRIVARDHAN:
            return "Borivali / Virar → Borli / Shrivardhan";
        default:
            return "Unknown Route";
    }
}

/* -------------------------------------------------------
   ORDERED CITY STOPS
------------------------------------------------------- */
export function getForwardCityStops() {
    return [...CITY_STOPS];
}

export function getReturnCityStops() {
    return [...CITY_STOPS].reverse();
}

/* -------------------------------------------------------
   FULL ROUTE HELPERS
------------------------------------------------------- */
export function getFullForwardRouteStops(route) {
    switch (route) {
        case ROUTES.SHRIVARDHAN_BORLI_TO_BORIVALI_VIRAR:
            return [...VILLAGE_STOPS, ...CITY_STOPS];
        default:
            return [];
    }
}

export function getFullReturnRouteStops(route) {
    switch (route) {
        case ROUTES.BORIVALI_VIRAR_TO_BORLI_SHRIVARDHAN:
            return [...getReturnCityStops(), ...[...VILLAGE_STOPS].reverse()];
        default:
            return [];
    }
}

/* -------------------------------------------------------
   AVAILABLE PICKUP / DROP HELPERS
------------------------------------------------------- */
export function getAvailablePickupStops(route) {
    switch (route) {
        case ROUTES.SHRIVARDHAN_BORLI_TO_BORIVALI_VIRAR:
            return VILLAGE_STOPS;

        case ROUTES.BORIVALI_VIRAR_TO_BORLI_SHRIVARDHAN:
            return getReturnCityStops();

        default:
            return [];
    }
}

export function getAvailableDropStops(route) {
    switch (route) {
        case ROUTES.SHRIVARDHAN_BORLI_TO_BORIVALI_VIRAR:
            return getForwardCityStops();

        case ROUTES.BORIVALI_VIRAR_TO_BORLI_SHRIVARDHAN:
            return VILLAGE_STOPS;

        default:
            return [];
    }
}

export function getAvailablePickupStopsWithMarathi(route) {
    return getStopsWithMarathi(getAvailablePickupStops(route));
}

export function getAvailableDropStopsWithMarathi(route) {
    return getStopsWithMarathi(getAvailableDropStops(route));
}

/* -------------------------------------------------------
   MAIN FARE CALCULATION
   RULE:
   - Forward: village pickup + city drop
   - Return: city pickup + village drop
   - Fare depends ONLY on village-side zone
------------------------------------------------------- */
export function getFare({
    route,
    pickup,
    drop,
    busType = BUS_TYPES.NON_AC,
}) {
    const normalizedPickup = normalizeStopName(pickup);
    const normalizedDrop = normalizeStopName(drop);

    const responseBase = {
        amount: 0,
        baseAmount: 0,
        surcharge: 0,
        busType,
        route,
        routeLabel: getRouteDirectionLabel(route),
        zone: null,
        zoneLabel: null,
        pickup: normalizedPickup,
        pickupMarathi: getStopNameMarathi(normalizedPickup),
        pickupDisplay: getStopDisplayName(normalizedPickup),
        drop: normalizedDrop,
        dropMarathi: getStopNameMarathi(normalizedDrop),
        dropDisplay: getStopDisplayName(normalizedDrop),
        isValid: false,
        error: null,
    };

    if (!route || !Object.values(ROUTES).includes(route)) {
        return {
            ...responseBase,
            error: "Invalid route selected.",
        };
    }

    if (!pickup || !drop) {
        return {
            ...responseBase,
            error: "Pickup and drop are required.",
        };
    }

    if (!Object.values(BUS_TYPES).includes(busType)) {
        return {
            ...responseBase,
            error: "Invalid bus type selected.",
        };
    }

    if (normalizedPickup === normalizedDrop) {
        return {
            ...responseBase,
            error: "Pickup and drop cannot be the same.",
        };
    }

    /* Forward: Village -> City */
    if (isForwardRoute(route)) {
        if (!isVillageStop(normalizedPickup)) {
            return {
                ...responseBase,
                error: "Invalid pickup point. Please select a valid village-side pickup stop.",
            };
        }

        if (!isCityStop(normalizedDrop)) {
            return {
                ...responseBase,
                error: "Invalid drop point. Please select a valid city-side drop stop.",
            };
        }

        const fareZone = getFareZoneForStop(route, normalizedPickup);

        if (!fareZone) {
            return {
                ...responseBase,
                error: "No fare zone found for selected pickup point.",
            };
        }

        const surcharge = busType === BUS_TYPES.AC ? AC_SURCHARGE : 0;
        const amount = fareZone.baseFare + surcharge;

        return {
            ...responseBase,
            amount,
            baseAmount: fareZone.baseFare,
            surcharge,
            zone: fareZone.zone,
            zoneLabel: fareZone.label,
            isValid: true,
            error: null,
        };
    }

    /* Return: City -> Village */
    if (isReturnRoute(route)) {
        if (!isCityStop(normalizedPickup)) {
            return {
                ...responseBase,
                error: "Invalid pickup point for return route. Please select a valid city-side pickup stop.",
            };
        }

        if (!isVillageStop(normalizedDrop)) {
            return {
                ...responseBase,
                error: "Invalid drop point for return route. Please select a valid village-side drop stop.",
            };
        }

        const fareZone = getFareZoneForStop(route, normalizedDrop);

        if (!fareZone) {
            return {
                ...responseBase,
                error: "No fare zone found for selected destination stop.",
            };
        }

        const surcharge = busType === BUS_TYPES.AC ? AC_SURCHARGE : 0;
        const amount = fareZone.baseFare + surcharge;

        return {
            ...responseBase,
            amount,
            baseAmount: fareZone.baseFare,
            surcharge,
            zone: fareZone.zone,
            zoneLabel: fareZone.label,
            isValid: true,
            error: null,
        };
    }

    return {
        ...responseBase,
        error: "Unable to calculate fare for selected route.",
    };
}

/* -------------------------------------------------------
   FARE PREVIEW HELPERS
------------------------------------------------------- */
export function getFarePreviewByRoute(route, busType = BUS_TYPES.NON_AC) {
    const groups = getFareGroupsByRoute(route);
    const surcharge = busType === BUS_TYPES.AC ? AC_SURCHARGE : 0;

    return groups.map((group) => ({
        zone: group.zone,
        label: group.label,
        stops: group.stops,
        stopsWithMarathi: getStopsWithMarathi(group.stops),
        baseFare: group.fare,
        surcharge,
        amount: group.fare + surcharge,
        busType,
    }));
}

/* -------------------------------------------------------
   OPTIONAL DISPLAY ARRAYS
------------------------------------------------------- */
export const CITY_STOPS_WITH_MARATHI = CITY_STOPS.map((stop) => ({
    english: stop,
    marathi: getStopNameMarathi(stop),
    display: getStopDisplayName(stop),
}));

export const VILLAGE_STOPS_WITH_MARATHI = VILLAGE_STOPS.map((stop) => ({
    english: stop,
    marathi: getStopNameMarathi(stop),
    display: getStopDisplayName(stop),
}));