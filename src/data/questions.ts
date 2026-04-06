// Answer encoding: Base64 + reverse to deter casual inspection
function encode(answer: string): string {
  return btoa(answer.split('').reverse().join(''));
}

export interface Question {
  id: number;
  section: string;
  sectionLabel: string;
  question: string;
  answer: string; // encoded
  hasAvailabilityDisplay: boolean;
  availabilityText: string | null;
}

export interface Section {
  id: string;
  label: string;
  range: [number, number];
}

export function decodeAnswer(encoded: string): string {
  return atob(encoded).split('').reverse().join('');
}

export const SECTIONS: Section[] = [
  { id: 'encode_decode', label: 'Encoding & Decoding', range: [1, 120] },
  { id: 'time_difference', label: 'Time Difference', range: [21, 130] },
  { id: 'availability', label: 'Air Availability', range: [31, 180] },
  { id: 'pnr_name', label: 'PNR - Name Element', range: [81, 185] },
  { id: 'pnr_itinerary', label: 'PNR - Itinerary', range: [86, 194] },
  { id: 'pnr_contact', label: 'PNR - Contact', range: [95, 196] },
  { id: 'pnr_ticketing', label: 'PNR - Ticketing', range: [97, 198] },
  { id: 'pnr_received', label: 'PNR - Received From', range: [99, 200] },
];

// Availability displays for SS questions (86-94)
const availabilityDisplays: Record<number, string> = {
  86: '1  PR 507  Y4 J4 R2  MNL BKK  0800 1030\n2  PR 509  Y2 J0 R0  MNL BKK  1400 1630',
  87: '1  PR 535  Y4 J0 R0  MNL SIN  0900 1300\n2  PR 537  Y2 J4 R2  MNL SIN  1500 1900',
  88: '1  SQ 919  Y4 J2 W4  MNL SIN  0700 1100\n2  SQ 921  Y0 J0 W2  MNL SIN  1300 1700',
  89: '1  EK 335  Y4 J2 R2  MNL DXB  2200 0400+1\n2  EK 337  Y2 J0 R0  MNL DXB  0100 0700',
  90: '1  5J 826  Y4 J0 R0  MNL NRT  0800 1330\n2  5J 827  Y2 J0 R0  MNL NRT  1200 1730\n3  5J 828  Y4 J2 R0  MNL NRT  1600 2130',
  91: '1  5J 108  Y4 J0 W2  MNL HKG  0600 0830\n2  5J 110  Y2 J2 W4  MNL HKG  1000 1230',
  92: '1  TG 621  Y4 J4 R2  BKK MNL  0800 1230\n2  TG 623  Y2 J0 R0  BKK MNL  1400 1830',
  93: '1  PR 504  Y4 J2 R0  SIN MNL  0900 1300\n2  PR 506  Y2 J4 R4  SIN MNL  1500 1900',
  94: '1  CX 709  Y4 J2 R2  MNL BKK  0700 0930\n2  CX 710  Y0 J0 R0  MNL BKK  1100 1330\n3  CX 712  Y2 J4 R2  MNL BKK  1500 1730\n4  CX 711  Y4 J2 R0  MNL BKK  1900 2130',
};

// Raw question data: [id, section, sectionLabel, question, answer]
const rawQuestions: [number, string, string, string, string][] = [
  // Section 1: Encoding & Decoding (1-20)
  [1, 'encode_decode', 'Encoding & Decoding', 'Decode the city: Manila', 'DAN MANILA'],
  [2, 'encode_decode', 'Encoding & Decoding', 'Decode the city: Bangkok', 'DAN BANGKOK'],
  [3, 'encode_decode', 'Encoding & Decoding', 'Decode the city: Singapore', 'DAN SINGAPORE'],
  [4, 'encode_decode', 'Encoding & Decoding', 'Decode the city: Tokyo', 'DAN TOKYO'],
  [5, 'encode_decode', 'Encoding & Decoding', 'Decode the city: Los Angeles', 'DAN LOS ANGELES'],
  [6, 'encode_decode', 'Encoding & Decoding', 'Encode the city: Montevideo, Uruguay — using first 2 letters of city + country code', 'DAN MO*/UY'],
  [7, 'encode_decode', 'Encoding & Decoding', 'Encode the city: Paris, France — using first letters + country code', 'DAN PA*/FR'],
  [8, 'encode_decode', 'Encoding & Decoding', 'Encode the city: Tokyo, Japan — using first letters + country code', 'DAN TO*/JP'],
  [9, 'encode_decode', 'Encoding & Decoding', 'Encode the city: London, United Kingdom — using first letters + country code', 'DAN LO*/GB'],
  [10, 'encode_decode', 'Encoding & Decoding', 'Encode the city: Seoul, South Korea — using first letters + country code', 'DAN SE*/KR'],
  [11, 'encode_decode', 'Encoding & Decoding', 'Display the 10 nearest airports to PAR', 'DAC PAR/N'],
  [12, 'encode_decode', 'Encoding & Decoding', 'Display the 10 nearest airports to LON', 'DAC LON/N'],
  [13, 'encode_decode', 'Encoding & Decoding', 'Decode the country code: PH', 'DC PH'],
  [14, 'encode_decode', 'Encoding & Decoding', 'Encode the country: Japan', 'DC JAPAN'],
  [15, 'encode_decode', 'Encoding & Decoding', 'Decode the country and state: US-NY', 'DNS USNY'],
  [16, 'encode_decode', 'Encoding & Decoding', 'Decode the country and state: US-CA', 'DNS USCA'],
  [17, 'encode_decode', 'Encoding & Decoding', 'Encode/Decode the airline code: PR', 'DNA PR'],
  [18, 'encode_decode', 'Encoding & Decoding', 'Encode/Decode the airline: Emirates', 'DNA EMIRATES'],
  [19, 'encode_decode', 'Encoding & Decoding', 'Encode/Decode the aircraft type: 777', 'DNE 777'],
  [20, 'encode_decode', 'Encoding & Decoding', 'Encode/Decode the aircraft type: Airbus A320', 'DNE A320'],

  // Section 2: Time Difference (21-30)
  [21, 'time_difference', 'Time Difference', 'Display the time difference between Athens (ATH) and Frankfurt (FRA)', 'DD ATH/FRA'],
  [22, 'time_difference', 'Time Difference', 'Display the time difference between Manila (MNL) and London (LON)', 'DD MNL/LON'],
  [23, 'time_difference', 'Time Difference', 'Display the time difference between Tokyo (TYO) and New York (NYC)', 'DD TYO/NYC'],
  [24, 'time_difference', 'Time Difference', 'Display the local time in Frankfurt (FRA) and time difference with the default city', 'DD FRA'],
  [25, 'time_difference', 'Time Difference', 'Display the local time in Bangkok (BKK) and time difference with the default city', 'DD BKK'],
  [26, 'time_difference', 'Time Difference', 'Display the local time in London when the time in Bangkok is 13:00', 'DD BKK1300/LON'],
  [27, 'time_difference', 'Time Difference', 'Display the local time in Manila when the time in Tokyo is 09:00', 'DD TYO0900/MNL'],
  [28, 'time_difference', 'Time Difference', 'Display the local time in New York when the time in Manila is 20:00', 'DD MNL2000/NYC'],
  [29, 'time_difference', 'Time Difference', 'Display the time difference between Singapore (SIN) and Dubai (DXB)', 'DD SIN/DXB'],
  [30, 'time_difference', 'Time Difference', 'Display the local time in Seoul when the time in Los Angeles is 08:00', 'DD LAX0800/SEL'],

  // Section 3: Air Availability (31-80)
  [31, 'availability', 'Air Availability', 'One-way: Manila to Bangkok on 05 April', 'AN05APRMNLBKK'],
  [32, 'availability', 'Air Availability', 'One-way: Manila to Singapore on 10 May', 'AN10MAYMNLSIN'],
  [33, 'availability', 'Air Availability', 'One-way: Tokyo to Manila on 15 June', 'AN15JUNTYOMNL'],
  [34, 'availability', 'Air Availability', 'One-way: Seoul to Bangkok on 20 July', 'AN20JULSELBKK'],
  [35, 'availability', 'Air Availability', 'One-way: London to New York on 01 August', 'AN01AUGLONNYC'],
  [36, 'availability', 'Air Availability', 'Round-trip: MNL-BKK depart 05 May, return 07 May', 'AN05MAYMNLBKK*07MAYBKKMNL'],
  [37, 'availability', 'Air Availability', 'Round-trip: MNL-SIN depart 10 June, return 15 June', 'AN10JUNMNLSIN*15JUNSINMNL'],
  [38, 'availability', 'Air Availability', 'Round-trip: TYO-MNL depart 01 July, return 10 July', 'AN01JULTYOMNL*10JULMNLTYO'],
  [39, 'availability', 'Air Availability', 'Round-trip: SEL-BKK depart 20 August, return 25 August', 'AN20AUGSELBKK*25AUGBKKSEL'],
  [40, 'availability', 'Air Availability', 'Round-trip: LON-PAR depart 05 September, return 12 September', 'AN05SEPLONPAR*12SEPPARLON'],
  [41, 'availability', 'Air Availability', 'MNL-BKK 05 April, Philippine Airlines (PR)', 'AN05APRMNLBKK/APR'],
  [42, 'availability', 'Air Availability', 'MNL-SIN 12 May, Singapore Airlines (SQ)', 'AN12MAYMNLSIN/ASQ'],
  [43, 'availability', 'Air Availability', 'MNL-NRT 20 June, Japan Airlines (JL)', 'AN20JUNMNLNRT/AJL'],
  [44, 'availability', 'Air Availability', 'MNL-HKG 15 July, Cebu Pacific (5J)', 'AN15JULMNLHKG/A5J'],
  [45, 'availability', 'Air Availability', 'BKK-LON 10 August, Emirates (EK)', 'AN10AUGBKKLON/AEK'],
  [46, 'availability', 'Air Availability', 'Round-trip MNL-BKK 05 May / 07 May, Philippine Airlines (PR)', 'AN05MAYMNLBKK*07MAYBKKMNL/APR'],
  [47, 'availability', 'Air Availability', 'Round-trip MNL-SIN 01 Jun / 10 Jun, Singapore Airlines (SQ)', 'AN01JUNMNLSIN*10JUNSINMNL/ASQ'],
  [48, 'availability', 'Air Availability', 'MNL-LON 05 April, stopover BKK', 'AN05APRMNLLON/XBKK'],
  [49, 'availability', 'Air Availability', 'MNL-PAR 12 May, stopover SIN', 'AN12MAYMNLPAR/XSIN'],
  [50, 'availability', 'Air Availability', 'MNL-NYC 20 June, stopover NRT', 'AN20JUNMNLNYC/XNRT'],
  [51, 'availability', 'Air Availability', 'SEL-LON 15 July, stopover DXB', 'AN15JULSELLON/XDXB'],
  [52, 'availability', 'Air Availability', 'MNL-FRA 10 August, stopover HKG', 'AN10AUGMNLFRA/XHKG'],
  [53, 'availability', 'Air Availability', 'MNL-BKK 05 April, First Class (R)', 'AN05APRMNLBKK/KR'],
  [54, 'availability', 'Air Availability', 'MNL-SIN 12 May, Business Class (J)', 'AN12MAYMNLSIN/KJ'],
  [55, 'availability', 'Air Availability', 'MNL-NRT 20 June, Economy Class (W)', 'AN20JUNMNLNRT/KW'],
  [56, 'availability', 'Air Availability', 'BKK-LON 15 July, First Class (R)', 'AN15JULBKKLON/KR'],
  [57, 'availability', 'Air Availability', 'SEL-PAR 10 August, Business Class (J)', 'AN10AUGSELPAR/KJ'],
  [58, 'availability', 'Air Availability', 'MNL-DXB 25 September, Economy Class (W)', 'AN25SEPMNLDXB/KW'],
  [59, 'availability', 'Air Availability', 'Direct flights MNL-BKK 05 April', 'AN05APRMNLBKK/FN'],
  [60, 'availability', 'Air Availability', 'Direct flights MNL-SIN 12 May', 'AN12MAYMNLSIN/FN'],
  [61, 'availability', 'Air Availability', 'Direct flights MNL-NRT 20 June', 'AN20JUNMNLNRT/FN'],
  [62, 'availability', 'Air Availability', 'Direct flights BKK-HKG 15 July', 'AN15JULBKKHKG/FN'],
  [63, 'availability', 'Air Availability', 'Direct flights SEL-TYO 10 August', 'AN10AUGSELTYO/FN'],
  [64, 'availability', 'Air Availability', 'MNL-BKK 05 April, PR + Business Class (J)', 'AN05APRMNLBKK/APR/KJ'],
  [65, 'availability', 'Air Availability', 'MNL-SIN 12 May, SQ + direct flights', 'AN12MAYMNLSIN/ASQ/FN'],
  [66, 'availability', 'Air Availability', 'MNL-LON 20 June, stopover BKK + First Class (R)', 'AN20JUNMNLLON/XBKK/KR'],
  [67, 'availability', 'Air Availability', 'MNL-NRT 15 July, JL + Economy Class (W)', 'AN15JULMNLNRT/AJL/KW'],
  [68, 'availability', 'Air Availability', 'Round-trip MNL-BKK 01 Aug / 10 Aug, 5J + direct flights', 'AN01AUGMNLBKK*10AUGBKKMNL/A5J/FN'],
  [69, 'availability', 'Air Availability', 'MNL-DXB 05 Sep, EK + Business (J) + stopover BKK', 'AN05SEPMNLDXB/AEK/KJ/XBKK'],
  [70, 'availability', 'Air Availability', 'MNL-PAR 10 October, direct flights + First Class (R)', 'AN10OCTMNLPAR/FN/KR'],
  [71, 'availability', 'Air Availability', 'Scenario: Client flies MNL-HKG on 25 November', 'AN25NOVMNLHKG'],
  [72, 'availability', 'Air Availability', 'Scenario: Round-trip MNL-BKK depart 01 Dec return 15 Dec', 'AN01DECMNLBKK*15DECBKKMNL'],
  [73, 'availability', 'Air Availability', 'Scenario: VIP wants First Class (R) MNL-LON on 20 January', 'AN20JANMNLLON/KR'],
  [74, 'availability', 'Air Availability', 'Scenario: Direct flights only MNL-SIN on 14 February', 'AN14FEBMNLSIN/FN'],
  [75, 'availability', 'Air Availability', 'Scenario: PR airline MNL-TYO 10 March, Business Class (J)', 'AN10MARMNLTYO/APR/KJ'],
  [76, 'availability', 'Air Availability', 'Scenario: 5J airline MNL-BKK 05 April, Economy Class (W)', 'AN05APRMNLBKK/A5J/KW'],
  [77, 'availability', 'Air Availability', 'Scenario: Round-trip MNL-SIN 01 May / 10 May, SQ + Business (J)', 'AN01MAYMNLSIN*10MAYSINMNL/ASQ/KJ'],
  [78, 'availability', 'Air Availability', 'Scenario: MNL-LON 15 June, EK + stopover DXB', 'AN15JUNMNLLON/AEK/XDXB'],
  [79, 'availability', 'Air Availability', 'Scenario: Direct flights First Class (R) BKK-TYO on 20 July', 'AN20JULBKKTYO/FN/KR'],
  [80, 'availability', 'Air Availability', 'Scenario: Round-trip MNL-PAR 01 Aug / 15 Aug, stopover HKG + Economy (W)', 'AN01AUGMNLPAR*15AUGPARMNL/XHKG/KW'],

  // Section 4: PNR Elements (81-100)
  // Name Element
  [81, 'pnr_name', 'PNR - Name Element', '1 adult: DELA CRUZ/JUAN MR', 'NM1DELACRUZ/JUANMR'],
  [82, 'pnr_name', 'PNR - Name Element', '2 pax same last name: SANTOS — MARIA MRS, ANA MISS', 'NM2SANTOS/MARIAMRS/ANAMISS'],
  [83, 'pnr_name', 'PNR - Name Element', '2 pax different last names: REYES/CARLOS MR + GARCIA/ANNA MRS', 'NM1REYES/CARLOSMR;NM1GARCIA/ANNAMRS'],
  [84, 'pnr_name', 'PNR - Name Element', 'Adult + Child (same last name): TORRES/MARK MR + TORRES/LILY MISS (born 15MAR15)', 'NM2TORRES/MARKMR/LILYMISS(CHD/15MAR15)'],
  [85, 'pnr_name', 'PNR - Name Element', 'Adult + Infant (same last name): CRUZ/MARIA MRS + CRUZ/BABY MSTR (born 10JAN24)', 'NM1CRUZ/MARIAMRS(INF/BABYMSTR/10JAN24)'],

  // Itinerary Element
  [86, 'pnr_itinerary', 'PNR - Itinerary', 'Based on the availability display below, sell 2 seats in Y class from line 1:', 'SS2Y1'],
  [87, 'pnr_itinerary', 'PNR - Itinerary', 'Based on the availability display below, sell 1 seat in J class from line 2:', 'SS1J2'],
  [88, 'pnr_itinerary', 'PNR - Itinerary', 'Based on the availability display below, sell 3 seats in W class from line 1:', 'SS3W1'],
  [89, 'pnr_itinerary', 'PNR - Itinerary', 'Based on the availability display below, sell 1 seat in R class from line 1:', 'SS1R1'],
  [90, 'pnr_itinerary', 'PNR - Itinerary', 'Based on the availability display below, sell 2 seats in Y class from line 3:', 'SS2Y3'],
  [91, 'pnr_itinerary', 'PNR - Itinerary', 'Based on the availability display below, sell 4 seats in W class from line 2:', 'SS4W2'],
  [92, 'pnr_itinerary', 'PNR - Itinerary', 'Based on the availability display below, sell 1 seat in J class from line 1:', 'SS1J1'],
  [93, 'pnr_itinerary', 'PNR - Itinerary', 'Based on the availability display below, sell 2 seats in R class from line 2:', 'SS2R2'],
  [94, 'pnr_itinerary', 'PNR - Itinerary', 'Based on the availability display below, sell 1 seat in Y class from line 4:', 'SS1Y4'],

  // Contact Element
  [95, 'pnr_contact', 'PNR - Contact', 'Add mobile contact: 0917-123-4567', 'AP09171234567-M'],
  [96, 'pnr_contact', 'PNR - Contact', 'Add email: juan.delacruz@gmail.com', 'APE-JUAN.DELACRUZ@GMAIL.COM'],

  // Ticketing Element
  [97, 'pnr_ticketing', 'PNR - Ticketing', 'Confirm booking for immediate ticketing', 'TKOK'],
  [98, 'pnr_ticketing', 'PNR - Ticketing', 'Ticketing time limit: issue by 25 April', 'TKTL25APR'],

  // Received From
  [99, 'pnr_received', 'PNR - Received From', 'Booking made by agent JUAN', 'RFJUAN'],
  [100, 'pnr_received', 'PNR - Received From', 'Booking received from MARIA', 'RFMARIA'],
];

import { extraRawQuestions, extraAvailabilityDisplays } from './questions-extra';

const allAvailabilityDisplays: Record<number, string> = {
  ...availabilityDisplays,
  ...extraAvailabilityDisplays,
};

const allRawQuestions = [...rawQuestions, ...extraRawQuestions];

export const QUESTIONS: Question[] = allRawQuestions.map(([id, section, sectionLabel, question, answer]) => ({
  id,
  section,
  sectionLabel,
  question,
  answer: encode(answer),
  hasAvailabilityDisplay: (id >= 86 && id <= 94) || (id >= 186 && id <= 194),
  availabilityText: allAvailabilityDisplays[id] || null,
}));
