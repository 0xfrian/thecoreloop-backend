// Days of the week
export const WEEKDAYS: string[] = [
  "monday", "tuesday", "wednesday", 
  "thursday", "friday", "saturday", "sunday",
];

// Numbered days with suffix
export const DAYS: string[] = [
  "1st",  "2nd",  "3rd",  "4th",  "5th",  "6th",  "7th",  "8th",  "9th",  
  "10th", "11th", "12th", "13th", "14th", "15th", "16th", "17th", "18th", 
  "19th", "20th", "21st", "22nd", "23rd", "24th", "25th", "26th", "27th", 
  "28th", "29th", "30th", "31st",
];

// Months of the year
export const MONTHS: string[] = [
  "january", "february", "march", "april", 
  "may", "june", "july", "august", 
  "september", "october", "november", "december",
];

// Years valid for LAG posts
export const YEARS: string[] = [
  "2022", "2023", "2024"
];

// Format date string e.g. "Wednesday April 20th 2022"
export function parseDate(line: string, verbose: boolean = true): string {
  const words: string[] = line.toLowerCase().split(" ");

  let Weekday = "";
  let Day = "";
  let Month = "";
  let Year = "";

  for (const word of words) {
    if      (WEEKDAYS.includes(word))   Weekday = word;
    else if (DAYS.includes(word))       Day     = word;
    else if (MONTHS.includes(word))     Month   = word;
    else if (YEARS.includes(word))      Year    = word;
  }

  try {
    Weekday = verbose
      ? Weekday[0].toUpperCase() + Weekday.slice(1)
      : Weekday[0].toUpperCase() + Weekday.slice(1, 3);
    Month = verbose
      ? Month[0].toUpperCase() + Month.slice(1)
      : Month[0].toUpperCase() + Month.slice(1, 3);
    Day = verbose
      ? Day
      : Day.slice(0, -2).padStart(2, "0");
    Year = Year;

    return `${Weekday} ${Month} ${Day} ${Year}`;
  } catch (error) {
    throw error;
  }
}

export function reformatDate(_date_string: string) {
  const words: string[] = _date_string.toLowerCase().split(" ");

  let Weekday = words[0];
  for (const WEEKDAY of WEEKDAYS) {
    if (WEEKDAY.includes(Weekday.toLowerCase())) {
      Weekday = WEEKDAY[0].toUpperCase() + WEEKDAY.slice(1);
      break;
    }
  }

  let Month = words[1];
  for (const MONTH of MONTHS) {
    if (MONTH.includes(Month.toLowerCase())) {
      Month = MONTH[0].toUpperCase() + MONTH.slice(1);
      break;
    }
  }

  let Day = Number(words[2]).toString();
  for (const DAY of DAYS) {
    if (DAY.includes(Day.toLowerCase())) {
      Day = DAY;
      break;
    }
  }

  let Year = words[3];

  return `${Weekday} ${Month} ${Day} ${Year}`;
}

