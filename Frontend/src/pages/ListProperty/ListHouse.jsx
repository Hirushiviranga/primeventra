import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'material-symbols';
import '../../styles/list.css';
import homeImg from '../../assets/webpfiles/home.webp';
import { supabase } from '../../api/supabaseClient';
import PaymentGateway from '../../components/PaymentGateway';

const WhatsAppIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 16 16" 
    width="16" 
    height="16" 
    fill="currentColor"
    style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.005c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
  </svg>
);

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 
  'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna', 
  'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa', 
  'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura', 
  'Polonnaruwa', 'Badulla', 'Moneragala', 'Ratnapura', 'Kegalle'
];

const ROOM_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '10+'];

const COUNTRY_CODES = [
  {
    "name": "Sri Lanka",
    "code": "+94",
    "iso": "lk"
  },
  {
    "name": "Afghanistan",
    "code": "+93",
    "iso": "af"
  },
  {
    "name": "Aland Islands",
    "code": "+358",
    "iso": "ax"
  },
  {
    "name": "Albania",
    "code": "+355",
    "iso": "al"
  },
  {
    "name": "Algeria",
    "code": "+213",
    "iso": "dz"
  },
  {
    "name": "AmericanSamoa",
    "code": "+1684",
    "iso": "as"
  },
  {
    "name": "Andorra",
    "code": "+376",
    "iso": "ad"
  },
  {
    "name": "Angola",
    "code": "+244",
    "iso": "ao"
  },
  {
    "name": "Anguilla",
    "code": "+1264",
    "iso": "ai"
  },
  {
    "name": "Antarctica",
    "code": "+672",
    "iso": "aq"
  },
  {
    "name": "Antigua and Barbuda",
    "code": "+1268",
    "iso": "ag"
  },
  {
    "name": "Argentina",
    "code": "+54",
    "iso": "ar"
  },
  {
    "name": "Armenia",
    "code": "+374",
    "iso": "am"
  },
  {
    "name": "Aruba",
    "code": "+297",
    "iso": "aw"
  },
  {
    "name": "Australia",
    "code": "+61",
    "iso": "au"
  },
  {
    "name": "Austria",
    "code": "+43",
    "iso": "at"
  },
  {
    "name": "Azerbaijan",
    "code": "+994",
    "iso": "az"
  },
  {
    "name": "Bahamas",
    "code": "+1242",
    "iso": "bs"
  },
  {
    "name": "Bahrain",
    "code": "+973",
    "iso": "bh"
  },
  {
    "name": "Bangladesh",
    "code": "+880",
    "iso": "bd"
  },
  {
    "name": "Barbados",
    "code": "+1246",
    "iso": "bb"
  },
  {
    "name": "Belarus",
    "code": "+375",
    "iso": "by"
  },
  {
    "name": "Belgium",
    "code": "+32",
    "iso": "be"
  },
  {
    "name": "Belize",
    "code": "+501",
    "iso": "bz"
  },
  {
    "name": "Benin",
    "code": "+229",
    "iso": "bj"
  },
  {
    "name": "Bermuda",
    "code": "+1441",
    "iso": "bm"
  },
  {
    "name": "Bhutan",
    "code": "+975",
    "iso": "bt"
  },
  {
    "name": "Bolivia, Plurinational State of",
    "code": "+591",
    "iso": "bo"
  },
  {
    "name": "Bosnia and Herzegovina",
    "code": "+387",
    "iso": "ba"
  },
  {
    "name": "Botswana",
    "code": "+267",
    "iso": "bw"
  },
  {
    "name": "Brazil",
    "code": "+55",
    "iso": "br"
  },
  {
    "name": "British Indian Ocean Territory",
    "code": "+246",
    "iso": "io"
  },
  {
    "name": "Brunei Darussalam",
    "code": "+673",
    "iso": "bn"
  },
  {
    "name": "Bulgaria",
    "code": "+359",
    "iso": "bg"
  },
  {
    "name": "Burkina Faso",
    "code": "+226",
    "iso": "bf"
  },
  {
    "name": "Burundi",
    "code": "+257",
    "iso": "bi"
  },
  {
    "name": "Cambodia",
    "code": "+855",
    "iso": "kh"
  },
  {
    "name": "Cameroon",
    "code": "+237",
    "iso": "cm"
  },
  {
    "name": "Canada",
    "code": "+1",
    "iso": "ca"
  },
  {
    "name": "Cape Verde",
    "code": "+238",
    "iso": "cv"
  },
  {
    "name": "Cayman Islands",
    "code": "+ 345",
    "iso": "ky"
  },
  {
    "name": "Central African Republic",
    "code": "+236",
    "iso": "cf"
  },
  {
    "name": "Chad",
    "code": "+235",
    "iso": "td"
  },
  {
    "name": "Chile",
    "code": "+56",
    "iso": "cl"
  },
  {
    "name": "China",
    "code": "+86",
    "iso": "cn"
  },
  {
    "name": "Christmas Island",
    "code": "+61",
    "iso": "cx"
  },
  {
    "name": "Cocos (Keeling) Islands",
    "code": "+61",
    "iso": "cc"
  },
  {
    "name": "Colombia",
    "code": "+57",
    "iso": "co"
  },
  {
    "name": "Comoros",
    "code": "+269",
    "iso": "km"
  },
  {
    "name": "Congo",
    "code": "+242",
    "iso": "cg"
  },
  {
    "name": "Congo, The Democratic Republic of the Congo",
    "code": "+243",
    "iso": "cd"
  },
  {
    "name": "Cook Islands",
    "code": "+682",
    "iso": "ck"
  },
  {
    "name": "Costa Rica",
    "code": "+506",
    "iso": "cr"
  },
  {
    "name": "Cote d'Ivoire",
    "code": "+225",
    "iso": "ci"
  },
  {
    "name": "Croatia",
    "code": "+385",
    "iso": "hr"
  },
  {
    "name": "Cuba",
    "code": "+53",
    "iso": "cu"
  },
  {
    "name": "Cyprus",
    "code": "+357",
    "iso": "cy"
  },
  {
    "name": "Czech Republic",
    "code": "+420",
    "iso": "cz"
  },
  {
    "name": "Denmark",
    "code": "+45",
    "iso": "dk"
  },
  {
    "name": "Djibouti",
    "code": "+253",
    "iso": "dj"
  },
  {
    "name": "Dominica",
    "code": "+1767",
    "iso": "dm"
  },
  {
    "name": "Dominican Republic",
    "code": "+1849",
    "iso": "do"
  },
  {
    "name": "Ecuador",
    "code": "+593",
    "iso": "ec"
  },
  {
    "name": "Egypt",
    "code": "+20",
    "iso": "eg"
  },
  {
    "name": "El Salvador",
    "code": "+503",
    "iso": "sv"
  },
  {
    "name": "Equatorial Guinea",
    "code": "+240",
    "iso": "gq"
  },
  {
    "name": "Eritrea",
    "code": "+291",
    "iso": "er"
  },
  {
    "name": "Estonia",
    "code": "+372",
    "iso": "ee"
  },
  {
    "name": "Ethiopia",
    "code": "+251",
    "iso": "et"
  },
  {
    "name": "Falkland Islands (Malvinas)",
    "code": "+500",
    "iso": "fk"
  },
  {
    "name": "Faroe Islands",
    "code": "+298",
    "iso": "fo"
  },
  {
    "name": "Fiji",
    "code": "+679",
    "iso": "fj"
  },
  {
    "name": "Finland",
    "code": "+358",
    "iso": "fi"
  },
  {
    "name": "France",
    "code": "+33",
    "iso": "fr"
  },
  {
    "name": "French Guiana",
    "code": "+594",
    "iso": "gf"
  },
  {
    "name": "French Polynesia",
    "code": "+689",
    "iso": "pf"
  },
  {
    "name": "Gabon",
    "code": "+241",
    "iso": "ga"
  },
  {
    "name": "Gambia",
    "code": "+220",
    "iso": "gm"
  },
  {
    "name": "Georgia",
    "code": "+995",
    "iso": "ge"
  },
  {
    "name": "Germany",
    "code": "+49",
    "iso": "de"
  },
  {
    "name": "Ghana",
    "code": "+233",
    "iso": "gh"
  },
  {
    "name": "Gibraltar",
    "code": "+350",
    "iso": "gi"
  },
  {
    "name": "Greece",
    "code": "+30",
    "iso": "gr"
  },
  {
    "name": "Greenland",
    "code": "+299",
    "iso": "gl"
  },
  {
    "name": "Grenada",
    "code": "+1473",
    "iso": "gd"
  },
  {
    "name": "Guadeloupe",
    "code": "+590",
    "iso": "gp"
  },
  {
    "name": "Guam",
    "code": "+1671",
    "iso": "gu"
  },
  {
    "name": "Guatemala",
    "code": "+502",
    "iso": "gt"
  },
  {
    "name": "Guernsey",
    "code": "+44",
    "iso": "gg"
  },
  {
    "name": "Guinea",
    "code": "+224",
    "iso": "gn"
  },
  {
    "name": "Guinea-Bissau",
    "code": "+245",
    "iso": "gw"
  },
  {
    "name": "Guyana",
    "code": "+595",
    "iso": "gy"
  },
  {
    "name": "Haiti",
    "code": "+509",
    "iso": "ht"
  },
  {
    "name": "Holy See (Vatican City State)",
    "code": "+379",
    "iso": "va"
  },
  {
    "name": "Honduras",
    "code": "+504",
    "iso": "hn"
  },
  {
    "name": "Hong Kong",
    "code": "+852",
    "iso": "hk"
  },
  {
    "name": "Hungary",
    "code": "+36",
    "iso": "hu"
  },
  {
    "name": "Iceland",
    "code": "+354",
    "iso": "is"
  },
  {
    "name": "India",
    "code": "+91",
    "iso": "in"
  },
  {
    "name": "Indonesia",
    "code": "+62",
    "iso": "id"
  },
  {
    "name": "Iran, Islamic Republic of Persian Gulf",
    "code": "+98",
    "iso": "ir"
  },
  {
    "name": "Iraq",
    "code": "+964",
    "iso": "iq"
  },
  {
    "name": "Ireland",
    "code": "+353",
    "iso": "ie"
  },
  {
    "name": "Isle of Man",
    "code": "+44",
    "iso": "im"
  },
  {
    "name": "Israel",
    "code": "+972",
    "iso": "il"
  },
  {
    "name": "Italy",
    "code": "+39",
    "iso": "it"
  },
  {
    "name": "Jamaica",
    "code": "+1876",
    "iso": "jm"
  },
  {
    "name": "Japan",
    "code": "+81",
    "iso": "jp"
  },
  {
    "name": "Jersey",
    "code": "+44",
    "iso": "je"
  },
  {
    "name": "Jordan",
    "code": "+962",
    "iso": "jo"
  },
  {
    "name": "Kazakhstan",
    "code": "+77",
    "iso": "kz"
  },
  {
    "name": "Kenya",
    "code": "+254",
    "iso": "ke"
  },
  {
    "name": "Kiribati",
    "code": "+686",
    "iso": "ki"
  },
  {
    "name": "Korea, Democratic People's Republic of Korea",
    "code": "+850",
    "iso": "kp"
  },
  {
    "name": "Korea, Republic of South Korea",
    "code": "+82",
    "iso": "kr"
  },
  {
    "name": "Kuwait",
    "code": "+965",
    "iso": "kw"
  },
  {
    "name": "Kyrgyzstan",
    "code": "+996",
    "iso": "kg"
  },
  {
    "name": "Laos",
    "code": "+856",
    "iso": "la"
  },
  {
    "name": "Latvia",
    "code": "+371",
    "iso": "lv"
  },
  {
    "name": "Lebanon",
    "code": "+961",
    "iso": "lb"
  },
  {
    "name": "Lesotho",
    "code": "+266",
    "iso": "ls"
  },
  {
    "name": "Liberia",
    "code": "+231",
    "iso": "lr"
  },
  {
    "name": "Libyan Arab Jamahiriya",
    "code": "+218",
    "iso": "ly"
  },
  {
    "name": "Liechtenstein",
    "code": "+423",
    "iso": "li"
  },
  {
    "name": "Lithuania",
    "code": "+370",
    "iso": "lt"
  },
  {
    "name": "Luxembourg",
    "code": "+352",
    "iso": "lu"
  },
  {
    "name": "Macao",
    "code": "+853",
    "iso": "mo"
  },
  {
    "name": "Macedonia",
    "code": "+389",
    "iso": "mk"
  },
  {
    "name": "Madagascar",
    "code": "+261",
    "iso": "mg"
  },
  {
    "name": "Malawi",
    "code": "+265",
    "iso": "mw"
  },
  {
    "name": "Malaysia",
    "code": "+60",
    "iso": "my"
  },
  {
    "name": "Maldives",
    "code": "+960",
    "iso": "mv"
  },
  {
    "name": "Mali",
    "code": "+223",
    "iso": "ml"
  },
  {
    "name": "Malta",
    "code": "+356",
    "iso": "mt"
  },
  {
    "name": "Marshall Islands",
    "code": "+692",
    "iso": "mh"
  },
  {
    "name": "Martinique",
    "code": "+596",
    "iso": "mq"
  },
  {
    "name": "Mauritania",
    "code": "+222",
    "iso": "mr"
  },
  {
    "name": "Mauritius",
    "code": "+230",
    "iso": "mu"
  },
  {
    "name": "Mayotte",
    "code": "+262",
    "iso": "yt"
  },
  {
    "name": "Mexico",
    "code": "+52",
    "iso": "mx"
  },
  {
    "name": "Micronesia, Federated States of Micronesia",
    "code": "+691",
    "iso": "fm"
  },
  {
    "name": "Moldova",
    "code": "+373",
    "iso": "md"
  },
  {
    "name": "Monaco",
    "code": "+377",
    "iso": "mc"
  },
  {
    "name": "Mongolia",
    "code": "+976",
    "iso": "mn"
  },
  {
    "name": "Montenegro",
    "code": "+382",
    "iso": "me"
  },
  {
    "name": "Montserrat",
    "code": "+1664",
    "iso": "ms"
  },
  {
    "name": "Morocco",
    "code": "+212",
    "iso": "ma"
  },
  {
    "name": "Mozambique",
    "code": "+258",
    "iso": "mz"
  },
  {
    "name": "Myanmar",
    "code": "+95",
    "iso": "mm"
  },
  {
    "name": "Namibia",
    "code": "+264",
    "iso": "na"
  },
  {
    "name": "Nauru",
    "code": "+674",
    "iso": "nr"
  },
  {
    "name": "Nepal",
    "code": "+977",
    "iso": "np"
  },
  {
    "name": "Netherlands",
    "code": "+31",
    "iso": "nl"
  },
  {
    "name": "Netherlands Antilles",
    "code": "+599",
    "iso": "an"
  },
  {
    "name": "New Caledonia",
    "code": "+687",
    "iso": "nc"
  },
  {
    "name": "New Zealand",
    "code": "+64",
    "iso": "nz"
  },
  {
    "name": "Nicaragua",
    "code": "+505",
    "iso": "ni"
  },
  {
    "name": "Niger",
    "code": "+227",
    "iso": "ne"
  },
  {
    "name": "Nigeria",
    "code": "+234",
    "iso": "ng"
  },
  {
    "name": "Niue",
    "code": "+683",
    "iso": "nu"
  },
  {
    "name": "Norfolk Island",
    "code": "+672",
    "iso": "nf"
  },
  {
    "name": "Northern Mariana Islands",
    "code": "+1670",
    "iso": "mp"
  },
  {
    "name": "Norway",
    "code": "+47",
    "iso": "no"
  },
  {
    "name": "Oman",
    "code": "+968",
    "iso": "om"
  },
  {
    "name": "Pakistan",
    "code": "+92",
    "iso": "pk"
  },
  {
    "name": "Palau",
    "code": "+680",
    "iso": "pw"
  },
  {
    "name": "Palestinian Territory, Occupied",
    "code": "+970",
    "iso": "ps"
  },
  {
    "name": "Panama",
    "code": "+507",
    "iso": "pa"
  },
  {
    "name": "Papua New Guinea",
    "code": "+675",
    "iso": "pg"
  },
  {
    "name": "Paraguay",
    "code": "+595",
    "iso": "py"
  },
  {
    "name": "Peru",
    "code": "+51",
    "iso": "pe"
  },
  {
    "name": "Philippines",
    "code": "+63",
    "iso": "ph"
  },
  {
    "name": "Pitcairn",
    "code": "+872",
    "iso": "pn"
  },
  {
    "name": "Poland",
    "code": "+48",
    "iso": "pl"
  },
  {
    "name": "Portugal",
    "code": "+351",
    "iso": "pt"
  },
  {
    "name": "Puerto Rico",
    "code": "+1939",
    "iso": "pr"
  },
  {
    "name": "Qatar",
    "code": "+974",
    "iso": "qa"
  },
  {
    "name": "Reunion",
    "code": "+262",
    "iso": "re"
  },
  {
    "name": "Romania",
    "code": "+40",
    "iso": "ro"
  },
  {
    "name": "Russia",
    "code": "+7",
    "iso": "ru"
  },
  {
    "name": "Rwanda",
    "code": "+250",
    "iso": "rw"
  },
  {
    "name": "Saint Barthelemy",
    "code": "+590",
    "iso": "bl"
  },
  {
    "name": "Saint Helena, Ascension and Tristan Da Cunha",
    "code": "+290",
    "iso": "sh"
  },
  {
    "name": "Saint Kitts and Nevis",
    "code": "+1869",
    "iso": "kn"
  },
  {
    "name": "Saint Lucia",
    "code": "+1758",
    "iso": "lc"
  },
  {
    "name": "Saint Martin",
    "code": "+590",
    "iso": "mf"
  },
  {
    "name": "Saint Pierre and Miquelon",
    "code": "+508",
    "iso": "pm"
  },
  {
    "name": "Saint Vincent and the Grenadines",
    "code": "+1784",
    "iso": "vc"
  },
  {
    "name": "Samoa",
    "code": "+685",
    "iso": "ws"
  },
  {
    "name": "San Marino",
    "code": "+378",
    "iso": "sm"
  },
  {
    "name": "Sao Tome and Principe",
    "code": "+239",
    "iso": "st"
  },
  {
    "name": "Saudi Arabia",
    "code": "+966",
    "iso": "sa"
  },
  {
    "name": "Senegal",
    "code": "+221",
    "iso": "sn"
  },
  {
    "name": "Serbia",
    "code": "+381",
    "iso": "rs"
  },
  {
    "name": "Seychelles",
    "code": "+248",
    "iso": "sc"
  },
  {
    "name": "Sierra Leone",
    "code": "+232",
    "iso": "sl"
  },
  {
    "name": "Singapore",
    "code": "+65",
    "iso": "sg"
  },
  {
    "name": "Slovakia",
    "code": "+421",
    "iso": "sk"
  },
  {
    "name": "Slovenia",
    "code": "+386",
    "iso": "si"
  },
  {
    "name": "Solomon Islands",
    "code": "+677",
    "iso": "sb"
  },
  {
    "name": "Somalia",
    "code": "+252",
    "iso": "so"
  },
  {
    "name": "South Africa",
    "code": "+27",
    "iso": "za"
  },
  {
    "name": "South Georgia and the South Sandwich Islands",
    "code": "+500",
    "iso": "gs"
  },
  {
    "name": "South Sudan",
    "code": "+211",
    "iso": "ss"
  },
  {
    "name": "Spain",
    "code": "+34",
    "iso": "es"
  },
  {
    "name": "Sudan",
    "code": "+249",
    "iso": "sd"
  },
  {
    "name": "Suriname",
    "code": "+597",
    "iso": "sr"
  },
  {
    "name": "Svalbard and Jan Mayen",
    "code": "+47",
    "iso": "sj"
  },
  {
    "name": "Swaziland",
    "code": "+268",
    "iso": "sz"
  },
  {
    "name": "Sweden",
    "code": "+46",
    "iso": "se"
  },
  {
    "name": "Switzerland",
    "code": "+41",
    "iso": "ch"
  },
  {
    "name": "Syrian Arab Republic",
    "code": "+963",
    "iso": "sy"
  },
  {
    "name": "Taiwan",
    "code": "+886",
    "iso": "tw"
  },
  {
    "name": "Tajikistan",
    "code": "+992",
    "iso": "tj"
  },
  {
    "name": "Tanzania, United Republic of Tanzania",
    "code": "+255",
    "iso": "tz"
  },
  {
    "name": "Thailand",
    "code": "+66",
    "iso": "th"
  },
  {
    "name": "Timor-Leste",
    "code": "+670",
    "iso": "tl"
  },
  {
    "name": "Togo",
    "code": "+228",
    "iso": "tg"
  },
  {
    "name": "Tokelau",
    "code": "+690",
    "iso": "tk"
  },
  {
    "name": "Tonga",
    "code": "+676",
    "iso": "to"
  },
  {
    "name": "Trinidad and Tobago",
    "code": "+1868",
    "iso": "tt"
  },
  {
    "name": "Tunisia",
    "code": "+216",
    "iso": "tn"
  },
  {
    "name": "Turkey",
    "code": "+90",
    "iso": "tr"
  },
  {
    "name": "Turkmenistan",
    "code": "+993",
    "iso": "tm"
  },
  {
    "name": "Turks and Caicos Islands",
    "code": "+1649",
    "iso": "tc"
  },
  {
    "name": "Tuvalu",
    "code": "+688",
    "iso": "tv"
  },
  {
    "name": "Uganda",
    "code": "+256",
    "iso": "ug"
  },
  {
    "name": "Ukraine",
    "code": "+380",
    "iso": "ua"
  },
  {
    "name": "United Arab Emirates",
    "code": "+971",
    "iso": "ae"
  },
  {
    "name": "United Kingdom",
    "code": "+44",
    "iso": "gb"
  },
  {
    "name": "United States",
    "code": "+1",
    "iso": "us"
  },
  {
    "name": "Uruguay",
    "code": "+598",
    "iso": "uy"
  },
  {
    "name": "Uzbekistan",
    "code": "+998",
    "iso": "uz"
  },
  {
    "name": "Vanuatu",
    "code": "+678",
    "iso": "vu"
  },
  {
    "name": "Venezuela, Bolivarian Republic of Venezuela",
    "code": "+58",
    "iso": "ve"
  },
  {
    "name": "Vietnam",
    "code": "+84",
    "iso": "vn"
  },
  {
    "name": "Virgin Islands, British",
    "code": "+1284",
    "iso": "vg"
  },
  {
    "name": "Virgin Islands, U.S.",
    "code": "+1340",
    "iso": "vi"
  },
  {
    "name": "Wallis and Futuna",
    "code": "+681",
    "iso": "wf"
  },
  {
    "name": "Yemen",
    "code": "+967",
    "iso": "ye"
  },
  {
    "name": "Zambia",
    "code": "+260",
    "iso": "zm"
  },
  {
    "name": "Zimbabwe",
    "code": "+263",
    "iso": "zw"
  }
];

const validatePhoneNumber = (number, countryIso) => {
  const cleanNum = number.replace(/[\s\-\(\)]/g, '');
  const numWithoutLeadingZero = cleanNum.startsWith('0') ? cleanNum.substring(1) : cleanNum;

  switch (countryIso) {
    case 'lk': // Sri Lanka
      return /^[1-9]\d{8}$/.test(numWithoutLeadingZero);
    case 'us':
    case 'ca': // USA / Canada: 10 digits
      return /^[2-9]\d{9}$/.test(numWithoutLeadingZero);
    case 'gb': // UK: 10 digits
      return /^7\d{9}$/.test(numWithoutLeadingZero) || /^[1-9]\d{9}$/.test(numWithoutLeadingZero);
    case 'au': // Australia: 9 digits
      return /^[45]\d{8}$/.test(numWithoutLeadingZero) || /^[1-9]\d{8}$/.test(numWithoutLeadingZero);
    case 'in': // India: 10 digits
      return /^[6-9]\d{9}$/.test(numWithoutLeadingZero);
    case 'ae': // UAE: 9 digits
      return /^5\d{8}$/.test(numWithoutLeadingZero) || /^[1-9]\d{8}$/.test(numWithoutLeadingZero);
    case 'sg': // Singapore: 8 digits
      return /^[3689]\d{7}$/.test(numWithoutLeadingZero);
    case 'fr': // France: 9 digits
      return /^[1-9]\d{8}$/.test(numWithoutLeadingZero);
    case 'de': // Germany: 10-11 digits
      return /^[1-9]\d{9,11}$/.test(numWithoutLeadingZero);
    case 'it': // Italy: 9-11 digits
      return /^[03]\d{8,10}$/.test(numWithoutLeadingZero);
    case 'jp': // Japan: 9-10 digits
      return /^[1-9]\d{8,9}$/.test(numWithoutLeadingZero);
    case 'mv': // Maldives: 7 digits
      return /^[79]\d{6}$/.test(numWithoutLeadingZero);
    case 'nz': // New Zealand: 8-10 digits
      return /^[1-9]\d{7,9}$/.test(numWithoutLeadingZero);
    default:
      return /^\d{7,15}$/.test(cleanNum);
  }
};

const CountrySelector = ({ value, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const selectedCountry = COUNTRY_CODES.find(c => c.iso === value) || COUNTRY_CODES[0];

  const handleSelect = (iso) => {
    if (disabled) return;
    onChange(iso);
    setIsOpen(false);
  };

  const filteredCountries = COUNTRY_CODES.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.includes(searchTerm)
  );

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          paddingRight: '8px',
          borderRight: '1px solid var(--color-outline-variant)',
          marginRight: '10px'
        }}
      >
        <img 
          src={`https://flagcdn.com/w40/${selectedCountry.iso}.png`} 
          alt={selectedCountry.name}
          style={{ width: '22px', height: '15px', objectFit: 'cover', borderRadius: '2px' }}
        />
        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-muted)' }}>{selectedCountry.code}</span>
        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-text-muted)', marginLeft: '-2px' }}>
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </div>

      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: '130%',
            left: 0,
            zIndex: 9999,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            maxHeight: '220px',
            overflowY: 'auto',
            width: '210px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ position: 'sticky', top: 0, backgroundColor: 'var(--color-surface)', padding: '6px', borderBottom: '1px solid var(--color-outline-variant)' }}>
            <input 
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: '4px',
                fontSize: '12px',
                outline: 'none',
                backgroundColor: 'var(--color-surface-container)',
                color: 'var(--color-on-surface)',
                boxSizing: 'border-box'
              }}
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filteredCountries.map(c => (
              <div 
                key={`${c.iso}-${c.code}`}
                onClick={() => handleSelect(c.iso)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  backgroundColor: c.iso === value ? 'var(--color-surface-container)' : 'transparent',
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = c.iso === value ? 'var(--color-surface-container)' : 'transparent'}
              >
                <img 
                  src={`https://flagcdn.com/w40/${c.iso}.png`} 
                  alt={c.name}
                  style={{ width: '20px', height: '14px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }}
                />
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-on-surface)' }}>{c.name} ({c.code})</span>
              </div>
            ))}
            {filteredCountries.length === 0 && (
              <div style={{ padding: '12px', fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ListHouse() {
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [phoneCountryCode, setPhoneCountryCode] = useState('lk');
  const [whatsappCountryCode, setWhatsappCountryCode] = useState('lk');
  const phoneDialCode = COUNTRY_CODES.find(c => c.iso === phoneCountryCode)?.code || '+94';
  const whatsappDialCode = COUNTRY_CODES.find(c => c.iso === whatsappCountryCode)?.code || '+94';

  useEffect(() => {
    const saved = sessionStorage.getItem('pending_listing_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.type === 'House') {
          setFormData(parsed.formData);
          setPhoneCountryCode(parsed.phoneCountryCode);
          setWhatsappCountryCode(parsed.whatsappCountryCode);
          setIsSameAsWhatsapp(parsed.isSameAsWhatsapp);
          setUploadedPhotos(parsed.uploadedPhotos || []);
          setPhotoPreviews(parsed.photoPreviews || []);
          if (parsed.draftListingId) {
            setDraftListingId(parsed.draftListingId);
          }
        }
      } catch (e) {
        console.error("Failed to restore draft listing state", e);
      } finally {
        sessionStorage.removeItem('pending_listing_draft');
      }
    }

    return () => {
      sessionStorage.removeItem('pending_listing_draft');
    };
  }, []);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    whatsapp: '',
    email: '',
    title: '',
    district: '',
    city: '',
    description: '',
    price: '',
    negotiable: 'No',
    landSize: '1',
    landUnit: 'Perches',
    houseSize: '',
    bedrooms: '',
    bathrooms: '',
    agreeToTerms: false,
    mapLink: '',
  });

  const [isSameAsWhatsapp, setIsSameAsWhatsapp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => {
        const nextData = { ...prev, [name]: value };
        if (name === 'phone' && isSameAsWhatsapp) {
          nextData.whatsapp = value;
        }
        return nextData;
      });
    }
  };

  const handleSameAsWhatsappChange = (e) => {
    const checked = e.target.checked;
    setIsSameAsWhatsapp(checked);
    if (checked) {
      setFormData(prev => ({ ...prev, whatsapp: prev.phone }));
      setWhatsappCountryCode(phoneCountryCode);
    }
  };

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - uploadedPhotos.length;
    if (files.length > remaining) {
      alert(`You can only upload up to 10 images. Only the first ${remaining} images were added.`);
      const allowedFiles = files.slice(0, remaining);
      setUploadedPhotos(prev => [...prev, ...allowedFiles]);
      const newPreviews = allowedFiles.map(file => URL.createObjectURL(file));
      setPhotoPreviews(prev => [...prev, ...newPreviews]);
    } else {
      setUploadedPhotos(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPhotoPreviews(prev => [...prev, ...newPreviews]);
    }
    e.target.value = ''; // Reset input so same file can be selected again
  };

  const handleRemovePhoto = (index) => {
    if (photoPreviews[index]) {
      URL.revokeObjectURL(photoPreviews[index]);
    }
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handlePhoneCountryCodeChange = (code) => {
    setPhoneCountryCode(code);
    if (isSameAsWhatsapp) {
      setWhatsappCountryCode(code);
    }
  };

  const handleWhatsappCountryCodeChange = (code) => {
    setWhatsappCountryCode(code);
  };

  const [showPayment, setShowPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [bankSubmitOption, setBankSubmitOption] = useState('upload');
  const [draftListingId, setDraftListingId] = useState(null);
  const [publishedPropertyId, setPublishedPropertyId] = useState(null);

  const handleNextStep = async (e) => {
    e.preventDefault();
    if (uploadedPhotos.length === 0) {
      alert("Please upload at least one photo.");
      return;
    }

    // Phone validation
    if (!validatePhoneNumber(formData.phone, phoneCountryCode)) {
      alert(`Please enter a valid phone number belonging to the selected country (${phoneDialCode}).`);
      return;
    }

    // WhatsApp validation
    if (!formData.whatsapp) {
      alert("Please enter a WhatsApp number.");
      return;
    }
    if (!validatePhoneNumber(formData.whatsapp, whatsappCountryCode)) {
      alert(`Please enter a valid WhatsApp number belonging to the selected country (${whatsappDialCode}).`);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload photos to Supabase Storage if not already uploaded/saved
      const photoUrls = [];
      
      for (const file of uploadedPhotos) {
        if (typeof file === 'string') {
          photoUrls.push(file);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `houses/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        photoUrls.push(publicUrl);
      }

      // 2. Retrieve logged-in portal user
      const portalUserStr = sessionStorage.getItem('portalUser');
      const portalUser = portalUserStr ? JSON.parse(portalUserStr) : null;
      const submittedBy = portalUser ? (portalUser.username || portalUser.email || portalUser.mobile) : null;

      // 3. Prepare payload for the backend draft
      const payload = {
        type: 'House',
        photos: photoUrls,
        ...formData,
        phone: `${phoneDialCode} ${formData.phone}`,
        whatsapp: formData.whatsapp ? `${whatsappDialCode} ${formData.whatsapp}` : '',
        submittedBy,
        status: 'Draft',
        paymentMethod: 'Bank Transfer',
        paymentStatus: 'Pending'
      };

      const API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
        ? 'http://localhost:5000/api/drafts'
        : 'https://primeventra-vrmv.vercel.app/api/drafts';

      const url = draftListingId ? `${API_URL}/${draftListingId}` : API_URL;
      const method = draftListingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save draft. Status: ${response.status}`);
      }

      const resData = await response.json();
      const savedListing = resData.data && resData.data[0];
      if (savedListing && (savedListing.property_id || savedListing.id)) {
        const pId = savedListing.property_id || savedListing.id;
        setDraftListingId(pId);
        sessionStorage.setItem('pending_listing_draft', JSON.stringify({
          type: 'House',
          draftListingId: pId,
          formData,
          phoneCountryCode,
          whatsappCountryCode,
          isSameAsWhatsapp,
          uploadedPhotos: photoUrls,
          photoPreviews: photoUrls
        }));
      }

      setShowPayment(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error(error);
      alert(`Error saving draft: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerSubmitListing = async (method, status, transactionId = null, packagePrice = null, packageName = null, receiptUrl = null) => {
    setIsSubmitting(true);

    try {
      const portalUserStr = sessionStorage.getItem('portalUser');
      const portalUser = portalUserStr ? JSON.parse(portalUserStr) : null;
      const email = portalUser ? portalUser.email : (formData.email || '');

      const API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
        ? `http://localhost:5000/api/drafts/${draftListingId}/pay`
        : `https://primeventra-vrmv.vercel.app/api/drafts/${draftListingId}/pay`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packagePrice,
          packageName,
          email,
          paymentMethod: method,
          paymentStatus: status,
          receiptUrl
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to submit listing payment. Status: ${response.status}`);
      }

      const resData = await response.json();
      setPublishedPropertyId(resData.property_id);

      sessionStorage.removeItem('pending_listing_draft');
      setIsSubmitting(false);
      setIsSuccess(true);
      
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        whatsapp: '',
        email: '',
        title: '',
        district: '',
        city: '',
        description: '',
        price: '',
        negotiable: 'No',
        landSize: '1',
        landUnit: 'Perches',
        houseSize: '',
        bedrooms: '',
        bathrooms: '',
        agreeToTerms: false,
        mapLink: '',
      });
      photoPreviews.forEach(url => URL.revokeObjectURL(url));
      setUploadedPhotos([]);
      setPhotoPreviews([]);
      setDraftListingId(null);
    } catch (error) {
      console.error(error);
      alert(`Error submitting payment: ${error.message}`);
      setIsSubmitting(false);
      throw error;
    }
  };

  return (
    <main className="list-property-page">
      {/* Hero Section */}
      <div className="hero-banner">
        <img 
          className="hero-banner__img" 
          src={homeImg}
          alt="Modern luxury house"
        />
        {showPayment ? (
          <a 
            href="#"
            className="btn-back btn-back-floating"
            onClick={(e) => {
              e.preventDefault();
              if (paymentStep === 2) {
                setShowPayment(false);
              } else if (paymentStep === 3) {
                setPaymentStep(2);
              } else if (paymentStep === 4) {
                setPaymentStep(3);
              } else if (paymentStep === 5) {
                setPaymentStep(4);
              } else if (paymentStep === 6) {
                setPaymentStep(bankSubmitOption === 'upload' ? 5 : 4);
              }
            }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            {paymentStep === 2 ? 'Back to Form' : 'Previous Step'}
          </a>
        ) : (
          <Link to="/list" className="btn-back btn-back-floating">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Selection
          </Link>
        )}
        <div className="hero-banner__overlay">
          <h1 className="hero-banner__title">Sell Your House</h1>
          <p className="hero-banner__subtitle">
            List your house on PrimeVentra and connect directly with verified home buyers.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="form-container">

        {/* Navigation Category Cards */}
        <div className="category-cards" style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
          <div className="category-card-new" style={{ cursor: 'default' }}>
            <div className="card-image-header" style={{ backgroundImage: `url(${homeImg})` }}>
              <div className="card-image-overlay" />
            </div>
            <div className="card-icon-badge">
              <span className="material-symbols-outlined">home</span>
            </div>
            <div className="card-info-body">
              <h3>House</h3>
              <p>List individual houses, bungalows, & townhouses</p>
            </div>
          </div>
        </div>

        {showPayment ? (
          <PaymentGateway
            propertyType="House"
            formData={{
              ...formData,
              phone: `${phoneDialCode} ${formData.phone}`,
              whatsapp: formData.whatsapp ? `${whatsappDialCode} ${formData.whatsapp}` : ''
            }}
            onBack={() => setShowPayment(false)}
            onSubmitListing={triggerSubmitListing}
            isSubmitting={isSubmitting}
            isSuccess={isSuccess}
            step={paymentStep}
            setStep={setPaymentStep}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            bankSubmitOption={bankSubmitOption}
            setBankSubmitOption={setBankSubmitOption}
            propertyId={publishedPropertyId}
          />
        ) : (
          <form onSubmit={handleNextStep} className="form-box" id="houseForm">
            <p style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.125rem', marginBottom: '0.5rem', textAlign: 'left' }}>
              Fill the Form and Proceed to Payment.
            </p>

          {/* Top Form Section: House Details */}
          <section className="form-section">
            <div className="form-section__header">
              <span className="material-symbols-outlined form-section__icon">home</span>
              <h2 className="form-section__title">House Information</h2>
            </div>
            
            <div className="form-section__grid">
              
              {/* Title * */}
              <div className="input-group input-group--full">
                <label className="input-label">
                  <span className="input-label__text">Title <span style={{ color: 'red' }}>*</span></span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>දේපලෙහි නම</span>
                </label>
                <input 
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="Enter Short Title" 
                  required
                />
              </div>

              {/* District * */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">District <span style={{ color: 'red' }}>*</span></span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>දිස්ත්‍රික්කය</span>
                </label>
                <select 
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="form-control form-control--select"
                  required
                >
                  <option value="">Select Your District (දිස්ත්‍රික්කය තෝරන්න)</option>
                  {DISTRICTS.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

              {/* City * */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">City <span style={{ color: 'red' }}>*</span></span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>නගරය</span>
                </label>
                <input 
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="Enter Nearest City" 
                  required
                />
              </div>

              {/* Land Size * */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Land Size <span style={{ color: 'red' }}>*</span></span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>ඉඩමේ ප්‍රමාණය</span>
                </label>
                <input 
                  type="number"
                  name="landSize"
                  value={formData.landSize}
                  onChange={handleInputChange}
                  min="1"
                  className="form-control"
                  required
                />
              </div>

              {/* Unit * */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Unit <span style={{ color: 'red' }}>*</span></span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>ඒකකය</span>
                </label>
                <select 
                  name="landUnit"
                  value={formData.landUnit}
                  onChange={handleInputChange}
                  className="form-control form-control--select"
                  required
                >
                  
                  <option value="Perches">Perches (පර්චස්)</option>
                  <option value="Acres">Acres (අක්කර)</option>
                </select>
              </div>

              {/* House Size (sqft) * */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">House Size (sqft) <span style={{ color: 'red' }}>*</span></span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>නිවසේ ප්‍රමාණය (වර්ග අඩි)</span>
                </label>
                <input 
                  type="number"
                  name="houseSize"
                  value={formData.houseSize}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="House Size"
                  required
                />
              </div>

              {/* Bedrooms * */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Bedrooms <span style={{ color: 'red' }}>*</span></span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>නිදන කාමර</span>
                </label>
                <select 
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  className="form-control form-control--select"
                  required
                >
                  <option value="">Select Bedrooms (තෝරන්න)</option>
                  {ROOM_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Bathrooms * */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Bathrooms <span style={{ color: 'red' }}>*</span></span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>නාන කාමර</span>
                </label>
                <select 
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  className="form-control form-control--select"
                  required
                >
                  <option value="">Select Bathrooms (තෝරන්න)</option>
                  {ROOM_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Description * */}
              <div className="input-group input-group--full">
                <label className="input-label">
                  <span className="input-label__text">Description <span style={{ color: 'red' }}>*</span></span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>විස්තරය</span>
                </label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-control form-control--textarea" 
                  placeholder="Describe the property's features, nearby amenities, and key selling points..." 
                  rows={4}
                  required
                />
              </div>

              {/* Price * */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Price <span style={{ color: 'red' }}>*</span></span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>මිල</span>
                </label>
                <input 
                  type="number" 
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="Enter Price" 
                  required
                />
              </div>

              {/* Negotiable * */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Negotiable <span style={{ color: 'red' }}>*</span></span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>මිල සාකච්ඡා කළ හැක</span>
                </label>
                <select 
                  name="negotiable"
                  value={formData.negotiable}
                  onChange={handleInputChange}
                  className="form-control form-control--select"
                  required
                >
                  <option value="Yes">Yes (ඔව්)</option>
                  <option value="No">No (නැත)</option>
                </select>
              </div>

              {/* Google Map Link */}
              <div className="input-group input-group--full">
                <label className="input-label">
                  <span className="input-label__text">Google Map Link</span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>ගූගල් මැප් ලින්ක් එක</span>
                </label>
                <input 
                  type="text"
                  name="mapLink"
                  value={formData.mapLink}
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="Paste Google Map URL (optional)" 
                />
              </div>

            </div>
          </section>

          {/* Photo Upload Section */}
          <section className="form-section">
            <div className="form-section__header">
              <span className="material-symbols-outlined form-section__icon">add_a_photo</span>
              <h2 className="form-section__title">
                Media Upload
                <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.25rem' }}>මාධ්‍ය උඩුගත කිරීම</span>
              </h2>
            </div>

            <div 
              className="upload-dropzone" 
              onClick={() => document.getElementById('imageUpload').click()}
              style={{ cursor: 'pointer' }}
            >
              <span className="material-symbols-outlined upload-dropzone__icon">cloud_upload</span>
              <p className="upload-dropzone__title">Click to upload images</p>
              <p className="upload-dropzone__desc">Upload up to 10 high-resolution photos (JPG, PNG).</p>
              <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ marginTop: '0.5rem' }}>ඡායාරූප උඩුගත කරන්න</span>
              <input 
                type="file" 
                id="imageUpload" 
                multiple 
                accept="image/*" 
                className="hidden-file-input" 
                onChange={handlePhotosChange}
              />
            </div>

            {/* Display chosen files preview grid */}
            {uploadedPhotos.length > 0 && (
              <div className="uploaded-files-list" style={{ marginTop: '1.5rem' }}>
                <p style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Selected Images ({uploadedPhotos.length} of 10):</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '1rem' }}>
                  {uploadedPhotos.map((file, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '110px', height: '110px', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid var(--color-outline-variant)', boxShadow: '0 2px 5px rgba(0,0,0,0.08)' }}>
                      <img 
                        src={photoPreviews[idx]} 
                        alt={file.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(234, 67, 53, 0.95)',
                          color: '#fff',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                          transition: 'all 0.2s ease',
                          zIndex: 10
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#d32f2f'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(234, 67, 53, 0.95)'; e.currentTarget.style.transform = 'scale(1)'; }}
                        title="Remove this image"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', fontWeight: 'bold' }}>close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Bottom Form Section: Contact Details */}
          <section className="form-section">
            <div className="form-section__header">
              <span className="material-symbols-outlined form-section__icon">contact_phone</span>
              <h2 className="form-section__title">
                Contact Details
                <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.25rem' }}>සම්බන්ධතා තොරතුරු</span>
              </h2>
            </div>
            
            <div className="form-section__grid">
              
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">First Name <span style={{ color: 'red' }}>*</span></span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>මුල් නම</span>
                </label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="First Name" 
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Last Name <span style={{ color: 'red' }}>*</span></span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>වාසගම</span>
                </label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="Last Name" 
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Phone Number <span style={{ color: 'red' }}>*</span></span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>දුරකථන අංකය</span>
                </label>
                <div className="prefix-input-control" style={{ gap: '0.25rem' }}>
                  <CountrySelector 
                    value={phoneCountryCode}
                    onChange={handlePhoneCountryCodeChange}
                    disabled={false}
                  />
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="prefix-input-control__input" 
                    placeholder="77 123 4567" 
                    required
                  />
                </div>
                <label className="checkbox-label" style={{ fontSize: '0.825rem', marginTop: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                  <input 
                    type="checkbox" 
                    checked={isSameAsWhatsapp} 
                    onChange={handleSameAsWhatsappChange} 
                    className="form-checkbox"
                    style={{ width: '1rem', height: '1rem', cursor: 'pointer', marginTop: '2px' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span>Is this also your WhatsApp number?</span>
                    <span style={{ fontSize: '0.8rem' }}>(මෙය ඔබගේ වට්ස්ඇප් අංකයද?)</span>
                  </div>
                </label>
              </div>

              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Enter WhatsApp Number</span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>වට්ස්ඇප් අංකය</span>
                </label>
                <div className="prefix-input-control prefix-input-control--whatsapp" style={{ gap: '0.25rem' }}>
                  <span className="prefix-input-control__icon" style={{ display: 'inline-flex', alignItems: 'center', marginRight: '4px' }}>
                    <WhatsAppIcon />
                  </span>
                  <CountrySelector 
                    value={whatsappCountryCode}
                    onChange={handleWhatsappCountryCodeChange}
                    disabled={isSameAsWhatsapp}
                  />
                  <input 
                    type="tel" 
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className="prefix-input-control__input" 
                    placeholder="77 123 4567" 
                    readOnly={isSameAsWhatsapp}
                    required
                  />
                </div>
              </div>

              <div className="input-group input-group--full">
                <label className="input-label">
                  <span className="input-label__text">Email Address <span style={{ color: 'red' }}>*</span></span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>විද්‍යුත් තැපෑල</span>
                </label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="Email Address" 
                  required
                />
              </div>

            </div>
          </section>

          {/* Form Actions */}
          <div className="form-actions">
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                id="terms" 
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="form-checkbox" 
                required
              />
              <label className="checkbox-label" htmlFor="terms">
                I agree to the Terms of Service and Privacy Policy. (සේවා කොන්දේසි සහ රහස්‍යතා ප්‍රතිපත්තියට මම එකඟ වෙමි.)
              </label>
            </div>
            
            <button 
              type="submit" 
              className="form-submit-btn"
              disabled={isSubmitting}
            >
              Post Ad <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </form>
        )}
      </div>

      {/* Trust Badges */}
      <div className="trust-badges-container">
        <div className="badge-item">
          <div className="badge-item__icon-wrapper">
            <span className="material-symbols-outlined badge-item__icon">verified_user</span>
          </div>
          <h3 className="badge-item__title">Verified Leads</h3>
          <p className="badge-item__desc">Connect only with authenticated potential buyers.</p>
        </div>
        <div className="badge-item">
          <div className="badge-item__icon-wrapper">
            <span className="material-symbols-outlined">speed</span>
          </div>
          <h3 className="badge-item__title">Fast Approval</h3>
          <p className="badge-item__desc">Your listing goes live within 24 hours.</p>
        </div>
        <div className="badge-item">
          <div className="badge-item__icon-wrapper">
            <span className="material-symbols-outlined">support_agent</span>
          </div>
          <h3 className="badge-item__title">24/7 Support</h3>
          <p className="badge-item__desc">Our dedicated team is here to help.</p>
        </div>
      </div>
    </main>
  );
}