import { env } from "@packages/config/src/env";

export const kraMobNo = env.KRA_MOB_NO;
const kraState = [
  {
    id: 1,
    state: "Andaman & Nicobar Islands",
    code: 35,
  },
  {
    id: 1,
    state: "Andaman and Nicobar Islands",
    code: 35,
  },
  {
    id: 2,
    state: "Andhra Pradesh",
    code: 28,
  },
  {
    id: 3,
    state: "Arunachal Pradesh",
    code: 12,
  },
  {
    id: 4,
    state: "Assam",
    code: 13,
  },
  {
    id: 5,
    state: "Bihar",
    code: 10,
  },
  {
    id: 6,
    state: "Chandigarh",
    code: 4,
  },
  {
    id: 7,
    state: "Dadra & Nagar Haveli",
    code: 26,
  },
  {
    id: 7,
    state: "Dadra and Nagar Haveli",
    code: 26,
  },
  {
    id: 8,
    state: "Daman & Diu",
    code: 25,
  },
  {
    id: 8,
    state: "Daman and Diu",
    code: 25,
  },
  {
    id: 9,
    state: "Delhi",
    code: 7,
  },
  {
    id: 10,
    state: "Goa",
    code: 30,
  },
  {
    id: 11,
    state: "Gujarat",
    code: 24,
  },
  {
    id: 12,
    state: "Haryana",
    code: 6,
  },
  {
    id: 13,
    state: "Himachal Pradesh",
    code: 2,
  },
  {
    id: 14,
    state: "Jammu & Kashmir",
    code: 1,
  },
  {
    id: 14,
    state: "Jammu and Kashmir",
    code: 1,
  },
  {
    id: 15,
    state: "Karnataka",
    code: 29,
  },
  {
    id: 16,
    state: "Kerala",
    code: 32,
  },
  {
    id: 17,
    state: "Lakhswadeep",
    code: 31,
  },
  {
    id: 18,
    state: "Madhya Pradesh",
    code: 23,
  },
  {
    id: 19,
    state: "Maharashtra",
    code: 27,
  },
  {
    id: 20,
    state: "Manipur",
    code: 14,
  },
  {
    id: 21,
    state: "Meghalaya",
    code: 17,
  },
  {
    id: 22,
    state: "Mizoram",
    code: 15,
  },
  {
    id: 23,
    state: "Nagaland",
    code: 18,
  },
  {
    id: 24,
    state: "Orissa",
    code: 21,
  },
  {
    id: 24,
    state: "Odisha",
    code: 21,
  },
  {
    // depricated this name
    id: 25,
    state: "Pondicherry",
    code: 34,
  },
  {
    // update state name 2006
    id: 25,
    state: "Puducherry",
    code: 34,
  },
  {
    id: 26,
    state: "Punjab",
    code: 3,
  },
  {
    id: 27,
    state: "Rajasthan",
    code: 8,
  },
  {
    id: 28,
    state: "Sikkim",
    code: 11,
  },
  {
    id: 29,
    state: "Tamil Nadu",
    code: 33,
  },
  {
    id: 30,
    state: "Tripura",
    code: 16,
  },
  {
    id: 31,
    state: "Uttar Pradesh",
    code: 9,
  },
  {
    id: 32,
    state: "West Bengal",
    code: 19,
  },
  {
    id: 33,
    state: "Chhattisgarh",
    code: 22,
  },
  {
    id: 34,
    state: "Uttaranchal",
    code: 5,
  },
  {
    id: 34,
    state: "Uttarakhand",
    code: 5,
  },
  {
    id: 35,
    state: "Jharkhand",
    code: 20,
  },
  {
    id: 36,
    state: "Telangana",
    code: 37,
  },
  {
    id: 99,
    state: "Others (please specify)",
    code: 99,
  },
];

export const getKraState = (name: string) => {
  console.log(name);

  const state = kraState.find((e) => {
    return e.state.trim().toLowerCase() == name.trim().toLowerCase();
  });
  console.log(state, state?.code.toString().padStart(3, "0"));

  return {
    ...state,
    code: state?.code.toString().padStart(3, "0") || "099",
  };
};

const kraCountryCode = [
  {
    id: 1,
    country: "AFGHANISTAN",
    code: "1",
  },
  {
    id: 2,
    country: "ALBENIA",
    code: "3",
  },
  {
    id: 3,
    country: "ALGERIA",
    code: "4",
  },
  {
    id: 4,
    country: "ANGOLA",
    code: "7",
  },
  {
    id: 5,
    country: "ARGENTINA",
    code: "11",
  },
  {
    id: 6,
    country: "ARMENIA",
    code: "12",
  },
  {
    id: 7,
    country: "ARUBA",
    code: "13",
  },
  {
    id: 8,
    country: "AUSTRALIA",
    code: "14",
  },
  {
    id: 9,
    country: "AUSTRIA",
    code: "15",
  },
  {
    id: 10,
    country: "AZARBAIJAN",
    code: "16",
  },
  {
    id: 11,
    country: "BAHAMAS",
    code: "17",
  },
  {
    id: 12,
    country: "BAHRAIN",
    code: "18",
  },
  {
    id: 13,
    country: "BANGLADESH",
    code: "19",
  },
  {
    id: 14,
    country: "BARBADOS",
    code: "20",
  },
  {
    id: 15,
    country: "BELARUS",
    code: "21",
  },
  {
    id: 16,
    country: "BELGIUM",
    code: "22",
  },
  {
    id: 17,
    country: "BELIZE",
    code: "23",
  },
  {
    id: 18,
    country: "BENIN",
    code: "24",
  },
  {
    id: 19,
    country: "BERMUDA",
    code: "25",
  },
  {
    id: 20,
    country: "BHUTAN",
    code: "26",
  },
  {
    id: 21,
    country: "BOLIVIAN",
    code: "27",
  },
  {
    id: 22,
    country: "BOSNIA-HERZEGOVINA",
    code: "28",
  },
  {
    id: 23,
    country: "BOTSWANA",
    code: "29",
  },
  {
    id: 24,
    country: "BRAZIL",
    code: "31",
  },
  {
    id: 25,
    country: "BRUNEI",
    code: "25",
  },
  {
    id: 26,
    country: "BULGARIA",
    code: "34",
  },
  {
    id: 27,
    country: "BURKINA FASO",
    code: "35",
  },
  {
    id: 28,
    country: "BURUNDI",
    code: "36",
  },
  {
    id: 29,
    country: "CAMEROON REPUBLIC",
    code: "#N/A",
  },
  {
    id: 30,
    country: "CANADA",
    code: "39",
  },
  {
    id: 31,
    country: "CAPE VERDE",
    code: "40",
  },
  {
    id: 32,
    country: "CAYMAN ISLANDS",
    code: "41",
  },
  {
    id: 33,
    country: "CENTRAL AFRICAN REPUBLIC",
    code: "42",
  },
  {
    id: 34,
    country: "CHAD",
    code: "43",
  },
  {
    id: 35,
    country: "CHILE",
    code: "44",
  },
  {
    id: 36,
    country: "CHINA",
    code: "45",
  },
  {
    id: 37,
    country: "COLOMBIA",
    code: "48",
  },
  {
    id: 38,
    country: "COMBODIA",
    code: "37",
  },
  {
    id: 39,
    country: "COMOROS",
    code: "38",
  },
  {
    id: 40,
    country: "CONGO",
    code: "50",
  },
  {
    id: 41,
    country: "COOK ISLANDS",
    code: "52",
  },
  {
    id: 42,
    country: "COSTA RICA",
    code: "53",
  },
  {
    id: 43,
    country: "COTE D'IVOIRE",
    code: "54",
  },
  {
    id: 44,
    country: "CROATIA",
    code: "55",
  },
  {
    id: 45,
    country: "CUBA",
    code: "56",
  },
  {
    id: 46,
    country: "CYPRUS",
    code: "57",
  },
  {
    id: 47,
    country: "CZECH REPUBLIC",
    code: "58",
  },
  {
    id: 48,
    country: "DENMARK",
    code: "59",
  },
  {
    id: 49,
    country: "DJIBOUTI",
    code: "60",
  },
  {
    id: 50,
    country: "DOMINICA",
    code: "61",
  },
  {
    id: 51,
    country: "DOMINICAN REPUBLIC",
    code: "62",
  },
  {
    id: 52,
    country: "EAST TIMOR",
    code: "#N/A",
  },
  {
    id: 53,
    country: "ECUADOR",
    code: "63",
  },
  {
    id: 54,
    country: "EGYPT",
    code: "64",
  },
  {
    id: 55,
    country: "EL SALVADOR",
    code: "65",
  },
  {
    id: 56,
    country: "EQUATORIAL GUINEA",
    code: "66",
  },
  {
    id: 57,
    country: "ESTONIA",
    code: "68",
  },
  {
    id: 58,
    country: "ETHIOPIA",
    code: "69",
  },
  {
    id: 59,
    country: "FALKLAND ISLANDS",
    code: "#N/A",
  },
  {
    id: 60,
    country: "FIJI",
    code: "72",
  },
  {
    id: 61,
    country: "FINLAND",
    code: "73",
  },
  {
    id: 62,
    country: "FRANCE",
    code: "74",
  },
  {
    id: 63,
    country: "FRENCH GUIANA",
    code: "75",
  },
  {
    id: 64,
    country: "FRENCH POLYNESIA",
    code: "76",
  },
  {
    id: 65,
    country: "GABON",
    code: "78",
  },
  {
    id: 66,
    country: "GAMBIA",
    code: "79",
  },
  {
    id: 67,
    country: "GEORGIA",
    code: "80",
  },
  {
    id: 68,
    country: "GERMANY",
    code: "81",
  },
  {
    id: 69,
    country: "GHANA",
    code: "82",
  },
  {
    id: 70,
    country: "GIBRALTOR",
    code: "83",
  },
  {
    id: 71,
    country: "GREECE",
    code: "84",
  },
  {
    id: 72,
    country: "GREENLAND",
    code: "85",
  },
  {
    id: 73,
    country: "GRENADA",
    code: "86",
  },
  {
    id: 74,
    country: "GUADELOUPE",
    code: "87",
  },
  {
    id: 75,
    country: "GUAM",
    code: "88",
  },
  {
    id: 76,
    country: "GUATEMALA",
    code: "89",
  },
  {
    id: 77,
    country: "GUERNSEY",
    code: "90",
  },
  {
    id: 78,
    country: "GUINEA",
    code: "91",
  },
  {
    id: 79,
    country: "GUINEA-BISSAU",
    code: "92",
  },
  {
    id: 80,
    country: "GUYANA",
    code: "93",
  },
  {
    id: 81,
    country: "HAITI",
    code: "94",
  },
  {
    id: 82,
    country: "HONDURAS",
    code: "97",
  },
  {
    id: 83,
    country: "HONGKONG",
    code: "98",
  },
  {
    id: 84,
    country: "ICELAND",
    code: "100",
  },
  {
    id: 85,
    country: "INDIA",
    code: "101",
  },
  {
    id: 86,
    country: "INDONESIA",
    code: "102",
  },
  {
    id: 87,
    country: "IRAN",
    code: "103",
  },
  {
    id: 88,
    country: "IRAQ",
    code: "104",
  },
  {
    id: 89,
    country: "IRELAND",
    code: "105",
  },
  {
    id: 90,
    country: "ISRAEL",
    code: "107",
  },
  {
    id: 91,
    country: "ITALY",
    code: "108",
  },
  {
    id: 92,
    country: "JAMAICA",
    code: "109",
  },
  {
    id: 93,
    country: "JAPAN",
    code: "110",
  },
  {
    id: 94,
    country: "JORDAN",
    code: "112",
  },
  {
    id: 95,
    country: "KAZAKSTAN",
    code: "113",
  },
  {
    id: 96,
    country: "KENYA",
    code: "114",
  },
  {
    id: 97,
    country: "KUWAIT",
    code: "118",
  },
  {
    id: 98,
    country: "KYRGYZSTAN",
    code: "119",
  },
  {
    id: 99,
    country: "LAOS",
    code: "#N/A",
  },
  {
    id: 100,
    country: "LATVIA",
    code: "121",
  },
  {
    id: 101,
    country: "LEBANON",
    code: "122",
  },
  {
    id: 102,
    country: "LESOTHO",
    code: "123",
  },
  {
    id: 103,
    country: "LIBERIA",
    code: "124",
  },
  {
    id: 104,
    country: "LIBYA",
    code: "125",
  },
  {
    id: 105,
    country: "LITHUANIA",
    code: "127",
  },
  {
    id: 106,
    country: "LUXEMBOURG",
    code: "128",
  },
  {
    id: 107,
    country: "MACAU",
    code: "129",
  },
  {
    id: 108,
    country: "MACEDONIA",
    code: "130",
  },
  {
    id: 109,
    country: "MADAGASCAR",
    code: "131",
  },
  {
    id: 110,
    country: "MALAWI",
    code: "132",
  },
  {
    id: 111,
    country: "MALAYSIA",
    code: "133",
  },
  {
    id: 112,
    country: "MALDIVES",
    code: "134",
  },
  {
    id: 113,
    country: "MALI",
    code: "135",
  },
  {
    id: 114,
    country: "MALTA",
    code: "136",
  },
  {
    id: 115,
    country: "MAURITANIA",
    code: "139",
  },
  {
    id: 116,
    country: "MAURITIUS",
    code: "140",
  },
  {
    id: 117,
    country: "MEXICO",
    code: "142",
  },
  {
    id: 118,
    country: "MOLDOVA",
    code: "144",
  },
  {
    id: 119,
    country: "MONETARY AUTHORITIES",
    code: "#N/A",
  },
  {
    id: 120,
    country: "MONGOLIA",
    code: "146",
  },
  {
    id: 121,
    country: "MONTSERRAT",
    code: "147",
  },
  {
    id: 122,
    country: "MOROCCA",
    code: "148",
  },
  {
    id: 123,
    country: "MOZAMBIQUE",
    code: "149",
  },
  {
    id: 124,
    country: "MYANMAR",
    code: "150",
  },
  {
    id: 125,
    country: "NAMIBIA",
    code: "151",
  },
  {
    id: 126,
    country: "NEPAL",
    code: "153",
  },
  {
    id: 127,
    country: "NETHERLANDS",
    code: "154",
  },
  {
    id: 128,
    country: "NETHERLANDS ANTILLES",
    code: "155",
  },
  {
    id: 129,
    country: "NEW CALEDONIA",
    code: "156",
  },
  {
    id: 130,
    country: "NEW ZEALAND",
    code: "157",
  },
  {
    id: 131,
    country: "NICARAGUA",
    code: "158",
  },
  {
    id: 132,
    country: "NIGER",
    code: "159",
  },
  {
    id: 133,
    country: "NIGERIA",
    code: "160",
  },
  {
    id: 134,
    country: "NO SPECIFIC COUNTRY",
    code: "#N/A",
  },
  {
    id: 135,
    country: "NORTH KOREA",
    code: "116",
  },
  {
    id: 136,
    country: "NORWAY",
    code: "164",
  },
  {
    id: 137,
    country: "OMAN",
    code: "165",
  },
  {
    id: 138,
    country: "PAKISTAN",
    code: "166",
  },
  {
    id: 139,
    country: "PANAMA",
    code: "169",
  },
  {
    id: 140,
    country: "PAPUA NEW GUINEA",
    code: "170",
  },
  {
    id: 141,
    country: "PARAGUAY",
    code: "171",
  },
  {
    id: 142,
    country: "PERU",
    code: "172",
  },
  {
    id: 143,
    country: "PHILIPPINES",
    code: "173",
  },
  {
    id: 144,
    country: "POLAND",
    code: "175",
  },
  {
    id: 145,
    country: "PORTUGAL",
    code: "176",
  },
  {
    id: 146,
    country: "QATAR",
    code: "178",
  },
  {
    id: 147,
    country: "ROMANIA",
    code: "180",
  },
  {
    id: 148,
    country: "RUSSIA",
    code: "181",
  },
  {
    id: 149,
    country: "RWANDA",
    code: "182",
  },
  {
    id: 150,
    country: "SAN TOME AND PRINCIPE",
    code: "#N/A",
  },
  {
    id: 151,
    country: "SAUDI ARABIA",
    code: "191",
  },
  {
    id: 152,
    country: "SENEGAL",
    code: "192",
  },
  {
    id: 153,
    country: "SEYCHELLES",
    code: "194",
  },
  {
    id: 154,
    country: "SINGAPORE",
    code: "196",
  },
  {
    id: 155,
    country: "SLOVAKIA",
    code: "197",
  },
  {
    id: 156,
    country: "SLOVENIA",
    code: "198",
  },
  {
    id: 157,
    country: "SOLOMON ISLANDS",
    code: "199",
  },
  {
    id: 158,
    country: "SOMALIA",
    code: "200",
  },
  {
    id: 159,
    country: "SOUTH AFRICA",
    code: "201",
  },
  {
    id: 160,
    country: "SOUTH KOREA",
    code: "117",
  },
  {
    id: 161,
    country: "SPAIN",
    code: "203",
  },
  {
    id: 162,
    country: "SRI LANKA",
    code: "204",
  },
  {
    id: 163,
    country: "ST. HELENA",
    code: "#N/A",
  },
  {
    id: 164,
    country: "ST. KITTS AND NEVIS",
    code: "#N/A",
  },
  {
    id: 165,
    country: "ST. VINCENT AND GRENADINES",
    code: "#N/A",
  },
  {
    id: 166,
    country: "ST.LUCIA",
    code: "#N/A",
  },
  {
    id: 167,
    country: "SUDAN",
    code: "205",
  },
  {
    id: 168,
    country: "SURINAME",
    code: "206",
  },
  {
    id: 169,
    country: "SWAZILAND",
    code: "208",
  },
  {
    id: 170,
    country: "SWEDEN",
    code: "209",
  },
  {
    id: 171,
    country: "SWITZERLAND",
    code: "210",
  },
  {
    id: 172,
    country: "SYRIA",
    code: "#N/A",
  },
  {
    id: 173,
    country: "TAIWAN",
    code: "212",
  },
  {
    id: 174,
    country: "TAJIKISTHAN",
    code: "213",
  },
  {
    id: 175,
    country: "TANZANIA",
    code: "214",
  },
  {
    id: 176,
    country: "THAILAND",
    code: "215",
  },
  {
    id: 177,
    country: "TOGO REPUBLIC",
    code: "217",
  },
  {
    id: 178,
    country: "TOKYO",
    code: "#N/A",
  },
  {
    id: 179,
    country: "TONGA",
    code: "219",
  },
  {
    id: 180,
    country: "TRINIDAD AND TOBAGO",
    code: "220",
  },
  {
    id: 181,
    country: "TUNISIA",
    code: "221",
  },
  {
    id: 182,
    country: "TURKEY",
    code: "222",
  },
  {
    id: 183,
    country: "TURKMENISTAN",
    code: "223",
  },
  {
    id: 184,
    country: "U A E",
    code: "228",
  },
  {
    id: 185,
    country: "UGANDA",
    code: "226",
  },
  {
    id: 186,
    country: "UNITED ARAB EMIRATES",
    code: "228",
  },
  {
    id: 187,
    country: "UNITED KINGDOM",
    code: "229",
  },
  {
    id: 188,
    country: "URUGUAY",
    code: "232",
  },
  {
    id: 189,
    country: "USA",
    code: "230",
  },
  {
    id: 190,
    country: "VANUATU",
    code: "234",
  },
  {
    id: 191,
    country: "VENEZUELA",
    code: "235",
  },
  {
    id: 192,
    country: "VIETNAM",
    code: "236",
  },
  {
    id: 193,
    country: "WEST AFRICA",
    code: "#N/A",
  },
  {
    id: 194,
    country: "WESTERN SAMOA",
    code: "#N/A",
  },
  {
    id: 195,
    country: "YEMEN",
    code: "241",
  },
  {
    id: 196,
    country: "YUGOSLAVIAN",
    code: "#N/A",
  },
  {
    id: 197,
    country: "ZAIRE",
    code: "#N/A",
  },
  {
    id: 198,
    country: "ZAMBIA",
    code: "242",
  },
  {
    id: 199,
    country: "ZIMBABWE",
    code: "243",
  },
  {
    id: 200,
    country: "ALAND ISLANDS",
    code: "2",
  },
  {
    id: 201,
    country: "AMERICAN SAMOA",
    code: "5",
  },
  {
    id: 202,
    country: "ANDORRA",
    code: "6",
  },
  {
    id: 203,
    country: "ANGUILLA",
    code: "8",
  },
  {
    id: 204,
    country: "ANTARCTICA",
    code: "9",
  },
  {
    id: 205,
    country: "ANTIGUA AND BARBUDA",
    code: "10",
  },
  {
    id: 206,
    country: "BOUVET ISLAND",
    code: "30",
  },
  {
    id: 207,
    country: "BRITISH INDIAN OCEAN TERRITORY",
    code: "32",
  },
  {
    id: 208,
    country: "CHRISTMAS ISLAND",
    code: "46",
  },
  {
    id: 209,
    country: "COCOS (KEELING) ISLANDS",
    code: "47",
  },
  {
    id: 210,
    country: "ERITREA",
    code: "67",
  },
  {
    id: 211,
    country: "FALKLAND ISLANDS (MALVINAS)",
    code: "70",
  },
  {
    id: 212,
    country: "FAROE ISLANDS",
    code: "71",
  },
  {
    id: 213,
    country: "FRENCH SOUTHERN TERRITORIES",
    code: "77",
  },
  {
    id: 214,
    country: "HEARD ISLAND AND MCDONALD ISLANDS",
    code: "95",
  },
  {
    id: 215,
    country: "HOLY SEE (VATICAN CITY STATE)",
    code: "96",
  },
  {
    id: 216,
    country: "HUNGARY",
    code: "99",
  },
  {
    id: 217,
    country: "IRAN, ISLAMIC REPUBLIC OF",
    code: "103",
  },
  {
    id: 218,
    country: "ISLE OF MAN",
    code: "106",
  },
  {
    id: 219,
    country: "KIRIBATI",
    code: "115",
  },
  {
    id: 220,
    country: "LAO PEOPLE'S DEMOCRATIC REPUBLIC",
    code: "120",
  },
  {
    id: 221,
    country: "LIBYAN ARAB JAMAHIRIYA",
    code: "125",
  },
  {
    id: 222,
    country: "LIECHTENSTEIN",
    code: "126",
  },
  {
    id: 223,
    country: "MARSHALL ISLANDS",
    code: "137",
  },
  {
    id: 224,
    country: "MARTINIQUE",
    code: "138",
  },
  {
    id: 225,
    country: "MAYOTTE",
    code: "141",
  },
  {
    id: 226,
    country: "MICRONESIA, FEDERATED STATES OF",
    code: "143",
  },
  {
    id: 227,
    country: "MONACO",
    code: "145",
  },
  {
    id: 228,
    country: "NAURU",
    code: "152",
  },
  {
    id: 229,
    country: "NIUE",
    code: "161",
  },
  {
    id: 230,
    country: "NORFOLK ISLAND",
    code: "162",
  },
  {
    id: 231,
    country: "NORTHERN MARIANA ISLANDS",
    code: "163",
  },
  {
    id: 232,
    country: "PALAU",
    code: "167",
  },
  {
    id: 233,
    country: "PALESTINIAN TERRITORY, OCCUPIED",
    code: "168",
  },
  {
    id: 234,
    country: "PITCAIRN",
    code: "174",
  },
  {
    id: 235,
    country: "PUERTO RICO",
    code: "177",
  },
  {
    id: 236,
    country: "REUNION",
    code: "179",
  },
  {
    id: 237,
    country: "SAINT HELENA",
    code: "183",
  },
  {
    id: 238,
    country: "SAINT KITTS AND NEVIS",
    code: "184",
  },
  {
    id: 239,
    country: "SAINT LUCIA",
    code: "185",
  },
  {
    id: 240,
    country: "SAINT PIERRE AND MIQUELON",
    code: "186",
  },
  {
    id: 241,
    country: "SAINT VINCENT AND THE GRENADINES",
    code: "187",
  },
  {
    id: 242,
    country: "SAMOA",
    code: "188",
  },
  {
    id: 243,
    country: "SAN MARINO",
    code: "189",
  },
  {
    id: 244,
    country: "SAO TOME AND PRINCIPE",
    code: "190",
  },
  {
    id: 245,
    country: "SERBIA AND MONTENEGRO",
    code: "193",
  },
  {
    id: 246,
    country: "SIERRA LEONE",
    code: "195",
  },
  {
    id: 247,
    country: "SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS",
    code: "202",
  },
  {
    id: 248,
    country: "SVALBARD AND JAN MAYEN",
    code: "207",
  },
  {
    id: 249,
    country: "SYRIAN ARAB REPUBLIC",
    code: "211",
  },
  {
    id: 250,
    country: "TIMOR-LESTE",
    code: "216",
  },
  {
    id: 251,
    country: "TOKELAU",
    code: "218",
  },
  {
    id: 252,
    country: "TURKS AND CAICOS ISLANDS",
    code: "224",
  },
  {
    id: 253,
    country: "TUVALU",
    code: "225",
  },
  {
    id: 254,
    country: "UKRAINE",
    code: "227",
  },
  {
    id: 255,
    country: "UNITED STATES MINOR OUTLYING ISLANDS",
    code: "231",
  },
  {
    id: 256,
    country: "UZBEKISTAN",
    code: "233",
  },
  {
    id: 257,
    country: "VIRGIN ISLANDS, BRITISH",
    code: "237",
  },
  {
    id: 258,
    country: "VIRGIN ISLANDS, U.S.",
    code: "238",
  },
  {
    id: 259,
    country: "WALLIS AND FUTUNA",
    code: "239",
  },
  {
    id: 260,
    country: "WESTERN SAHARA",
    code: "240",
  },
];

export const getKraCountry = (name: string) => {
  const state = kraCountryCode.find((e) => {
    return e.country.trim().toLowerCase() == name.trim().toLowerCase();
  });
  return state;
};

export const occCode = {
  "Public Sector": "02",
  "Private Sector": "01",
  Business: "03",
  Agriculturist: "05",
  Retired: "06",
  Housewife: "07",
  Student: "08",
  "Government Sector": "10",
  Professional: "04",
  Others: "99",
};
