export function fullDateDiff(startingDate, endingDate) {
    var startDate = new Date(new Date(startingDate).toISOString().substr(0, 10));
    if (!endingDate) {
      endingDate = new Date().toISOString().substr(0, 10); // need date in YYYY-MM-DD format
    }
    var endDate = new Date(endingDate);
    if (startDate > endDate) {
      var swap = startDate;
      startDate = endDate;
      endDate = swap;
    }
    var startYear = startDate.getFullYear();
    var february = (startYear % 4 === 0 && startYear % 100 !== 0) || startYear % 400 === 0 ? 29 : 28;
    var daysInMonth = [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
    var yearDiff = endDate.getFullYear() - startYear;
    var monthDiff = endDate.getMonth() - startDate.getMonth();
    if (monthDiff < 0) {
      yearDiff--;
      monthDiff += 12;
    }
    var dayDiff = endDate.getDate() - startDate.getDate();
    if (dayDiff < 0) {
      if (monthDiff > 0) {
        monthDiff--;
      } else {
        yearDiff--;
        monthDiff = 11;
      }
      dayDiff += daysInMonth[startDate.getMonth()];
    }
  
    return yearDiff + 'Y ' + monthDiff + 'M ' + dayDiff + 'D';
}

export function daysDifference (ad,bd) {
  if (!ad||!bd) return 1;
  if (isNaN(ad))
    ad = new Date(ad).getTime()
  if (isNaN(bd))
    bd = new Date(bd).getTime()

  let a = ad, b= bd;
  if (a > b) {
      var swap = a;
      a = b;
      b = swap;
  }
  return (b-a)/(1000 * 3600 * 24);
}

export function isPatchDay(date, lastPatchDate = '2022-09-29') {
  return !(Math.round(daysDifference(date, lastPatchDate)) % 14)
}



export function setClosestWeekDay(date, weekDay=0, time) {
  if (!(date instanceof Date)) {
    date = new Date(date)
  }
  if (time)
    date.setUTCHours(...time);
  
  if(weekDay === undefined || isNaN(weekDay)) {
    console.error('Missing target day.')
    return null
  }
  weekDay = Math.min(weekDay, 6) 
  
  var nextWeeks = new Date(date)
  var prevWeeks = new Date(date)
  while (nextWeeks.getUTCDay() != weekDay) {
    nextWeeks.setUTCDate(nextWeeks.getUTCDate() + 1)
  }
  while (prevWeeks.getDay() != weekDay) {
    prevWeeks.setUTCDate(prevWeeks.getUTCDate() - 1)
  }

  if (Math.abs(date-nextWeeks) < Math.abs(date-prevWeeks)) {
    date.setTime(nextWeeks)
  } else {
    date.setTime(prevWeeks)
  }
  //var day = date.getUTCDay()

  // date.setUTCDate(date.getUTCDate() + (weekDay + 7 - date.getUTCDay()) % 7);
  // // if (Math.abs(day-weekDay) < Math.abs(7+weekDay-day))
  // //   date.setUTCDate(date.getUTCDate() + ((7 - date.getUTCDay() + weekDay) % 7))
  // // else
  // //   date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + [0,6,5,4,3,2,1][weekDay]) % 7);
  // return date
}

export function fullDateDiff2(from, to) {
  var isNegative = false;
  var startDate = new Date(new Date(from).toISOString().substr(0, 10));
  if (!to) {
    to = new Date().toISOString().substr(0, 10); // need date in YYYY-MM-DD format
  }
  var endDate = new Date(to);
  if (startDate > endDate) {
    isNegative = true;
    var swap = startDate;
    startDate = endDate;
    endDate = swap;
  }
  var startYear = startDate.getFullYear();
  var february = (startYear % 4 === 0 && startYear % 100 !== 0) || startYear % 400 === 0 ? 29 : 28;
  var daysInMonth = [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  var yearDiff = endDate.getFullYear() - startYear;
  var monthDiff = endDate.getMonth() - startDate.getMonth();
  if (monthDiff < 0) {
    yearDiff--;
    monthDiff += 12;
  }
  var dayDiff = endDate.getDate() - startDate.getDate();
  if (dayDiff < 0) {
    if (monthDiff > 0) {
      monthDiff--;
    } else {
      yearDiff--;
      monthDiff = 11;
    }
    dayDiff += daysInMonth[startDate.getMonth()];
  }

  return [yearDiff, monthDiff, dayDiff, isNegative]
}