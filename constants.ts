
import { QuadrantInfo, DialItem, SelectionId } from './types';

export const QUADRANTS: QuadrantInfo[] = [
  {
    id: 'Q1',
    label: 'Need campaign',
    title: 'WILL OTHERS JOIN?',
    description: 'A Need campaign is set - WHAT , WHERE ,  WHEN and for HOW Much is defined - We are waiting for enough "WHO" as backers to Join and sign A NEED-DEED ',
    startAngle: -90,
    endAngle: 0,
    angle: -45,
    color: '#6366f1', // Indigo

    iconPath: 'M3 11v2 M5 10h3l8-4v12l-8-4H5 M5 14l1.5 6H9l-1.5-6 M18.5 9.5l1-1 M19.5 12h1.5 M18.5 14.5l1 1',
  },
  {
    id: 'Q2',
    label: 'VALIDOTION',
    title: 'Summarization of Need',
    description: 'The total amount  NEED-DEED is calculated',
    startAngle: 0,
    endAngle: 90,
    angle: 45,
    // color: '#f97316', // Orange
    color: '#14b8a6', // Teal

    iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
  {
    id: 'Q3',
    label: 'Feed campaign',
    title: 'WILL A SUPPLIER JOIN?',
    description: 'A Feed campaign is set, a supplier join by sign A FEED-DEED',
    startAngle: 90,
    endAngle: 180,
    angle: 135,
    // color: '#14b8a6', // Teal
        color: '#6366f1', // Indigo

    iconPath: 'M3 11v2 M5 10h3l8-4v12l-8-4H5 M5 14l1.5 6H9l-1.5-6 M18.5 9.5l1-1 M19.5 12h1.5 M18.5 14.5l1 1',
  },
  {
    id: 'Q4',
    label: 'Fulfilment',
    title: ' Win-Win-Win-Win',
    description: 'The backers and the supplier will continue the fulfilment stage - A WEED commission  will be transfer to the initiator and the platform',
    startAngle: 180,
    endAngle: 270,
    angle: 225,
    // color: '#ec4899', // Pink
        color: '#14b8a6', // Teal

    iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
];

export const CARDINAL_ITEMS: DialItem[] = [
  {
    id: 'N',
    label: 'NEED',
    title: 'IS THERE A NEED?',
    description: 'Initiator can imagine a shared need  for product or services- but is it there?',
    angle: -90,
    color: '#000000',
    iconPath: 'M9 18h6 M10 22h4 M12 2a7 7 0 0 0-7 7c0 2.22 1.02 4.18 2.62 5.5A3 3 0 0 1 8.5 17h7a3 3 0 0 1 .88-2.5c1.6-1.32 2.62-3.28 2.62-5.5a7 7 0 0 0-7-7z',
  },
  {
    id: 'S',
    label: 'SEED',
    title: 'FROM NEED TO SEED',
    description: 'The Need campaign was saucerful completed - enough Need quantity or value is reached',
    angle: 0,
    color: '#000000',
    iconPath: 'M12 21V11 M12 11c0-4.2 3.3-7 8-7c0 4.8-2.8 8-8 8Z M12 12c0-3.6-2.8-6-8-6c0 4.2 2.4 7 8 7Z M7 21h10',
  },
  {
    id: 'F',
    label: 'FEED',
    title: 'IS THERE A SUPPLIER?',
    description: 'There is a Seed but will he get to grow?',
    angle: 90,
    color: '#000000',
    // Watering Can Icon with Sprinkles
    iconPath: 'M4 12h10c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-3c0-1.1.9-2 2-2z M9 12V9.5c0-1.4 1.1-2.5 2.5-2.5h1.5 M16 14l4.5-3.5 M20 8l.5-.5 M21.5 10.5l1 0 M21 13l.5.5',
  },
  {
    id: 'R',
    label: 'REED',
    title: 'FROM SEED TO REED',
    description: 'a Product or Service-market fit was met - A REED-DEED is sign and assignment of all the NEED-DEED to the Supplier',
    angle: 180,
    color: '#000000',
    // Grown Reed/Cattail Plant Icon
    iconPath: 'M12 22V5 M10.5 5.5a1.5 1.5 0 0 1 1.5-1.5h0a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5h0a1.5 1.5 0 0 1-1.5-1.5V5.5z M12 18c-3-1-5-4-5-8 M12 20c4-1 6-4 6-9 M9 22h6',
  },
];

export const ALL_ITEMS = [
  CARDINAL_ITEMS[0],
  QUADRANTS[0],
  CARDINAL_ITEMS[1],
  QUADRANTS[1],
  CARDINAL_ITEMS[2],
  QUADRANTS[2],
  CARDINAL_ITEMS[3],
  QUADRANTS[3]
];
