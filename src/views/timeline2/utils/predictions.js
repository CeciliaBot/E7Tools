import { daysDifference, setClosestWeekDay } from '@/utils/dates.js'


function getLastOfCondition(array, callback) {
    for (var i=array.length-1; i>0; i--) {
        if ( callback(array[i]) ) return array[i];
    }
    return null
}
function returnTime(date) {
    return [date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()]
}
function getAvarage(list, type = null, callback) {
    var last = list[list.length-1]
    if (last.isPrediction || list.length === 1)
        return;
    var stats = {
        avgLength: 0,
        avgDownTime: 0,
        avgStartDay: 0,     // Day of the week (Monday etc...)
        avgEndDay: 0,
        avgStartTime: [0,0,0],
        avgEndTime: [0,0,0]
    },
        scoutedEvents = 0,
        scoutedCompleteEvents = 0,
        prevDate = null;
    for (var i=list.length-1; i>=0; i--) {
        if (!list[i])
            break;
        if (type && list[i].type !== type)
            continue;
        if (scoutedEvents === 6)
            break;

        scoutedEvents++;
        var d1 = new Date(list[i].dt[0])
        stats.avgStartDay += d1.getUTCDay()
        returnTime(d1).forEach( (x,i) => { stats.avgStartTime[i] += x })
        if (list[i].dt[1]) {
            var d2 = new Date(list[i].dt[1])
            stats.avgEndDay += d2.getUTCDay()
            returnTime(d2).forEach( (x,i) => { stats.avgEndTime[i] += x })
            stats.avgLength += list[i].size
            scoutedCompleteEvents++
        }
        if (prevDate) {
            stats.avgDownTime += prevDate-Number(list[i].dt[1] || list[i].dt[0])
        }
        prevDate = Number(list[i].dt[0])
    }
    stats.avgLength = Math.round(stats.avgLength/scoutedCompleteEvents)*(1000 * 3600 * 24) // in ms
    stats.avgDownTime =  Math.round(stats.avgDownTime/scoutedEvents)
    stats.avgStartDay = Math.round(stats.avgStartDay/scoutedEvents)
    stats.avgEndDay = Math.round(stats.avgEndDay/scoutedCompleteEvents)
    stats.avgStartTime = stats.avgStartTime.map(x => { return x = x/scoutedEvents })
    stats.avgEndTime = stats.avgEndTime.map(x => { return x = x/scoutedCompleteEvents })
    return callback(stats)
}

function setLinearPrediction (list, options) {
    var average = {
        title: options.title || '',
        length: options.length || 0,
        downTime: options.downTime ? options.downTime<1000 ? options.downTime*86400000 : options.downTime : 1,
        startingDay: options.startingDay,
        endingDay: options.endingDay,
        startTime: options.startTime,
        endTime: options.endTime,
        timelineStartingPoint: options.timelineStartingPoint,
        timelineEndingPoint: options.timelineEndingPoint || Date.now()
    }
    var last = getLastOfCondition(list, (el) => options.type ? el.type === options.type : true )
    if (!last) return;
    else if (!last.dt[1] && average.length) {// predict ending date
        var startingDate = new Date(last.dt[0]).getTime()
        var date = new Date( startingDate + average.length )
        setClosestWeekDay(date, average.endingDay, average.endTime)
        last.dt.push(date.getTime())
        last.size = (date.getTime()-startingDate) / (1000 * 3600 * 24)
        last.isPrediction = true
        last.name = (last.name || '') + '[Ending Prediction]'
        Date.now() < startingDate ? last.isComingSoon = true : Date.now() < date.getTime() ? last.isOngoing = true : null
        return date
    } else {// predict starting date and duration
        if (last.dt[1]>Date.now()) return; // don't predict next one if current event is still ongoing
        var startDate = new Date( Number(last.dt[1] || last.dt[0]) + average.downTime )
        setClosestWeekDay(startDate, average.startingDay, average.startTime)

        var endDate = startDate;
        if (average.length) {
            endDate = new Date( startDate.getTime() + average.length )
            setClosestWeekDay(endDate, average.endingDay, average.endTime)
        }

        var obj = {
            dt: average.length ? [startDate.getTime(), endDate.getTime()] : [startDate.getTime()],
            name: average.title,
            size: average.length ? (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) : 1,
            fromStart: daysDifference(startDate,average.timelineStartingPoint),
            fromEnd: daysDifference(endDate,average.timelineEndingPoint),
            inDayIndex: 0,
            isPrediction: true
        }
        Date.now() < startDate.getTime() ? obj.isComingSoon = true : Date.now() < endDate.getTime() ? obj.isOngoing = true : null
        list.push(obj)
        return endDate
    }
}


export function arenaPrediction(list, _this) {
    return getAvarage(list, 'season', stats => {
        return setLinearPrediction(list, {
            title: 'Arena Season Automated Prediction',
            type: 'season',
            length: stats.avgLength,
            downTime: stats.avgDownTime,
            startingDay: 0,
            endingDay: 1,
            startTime: [10,0,0],
            endTime: [5,0,0],
            timelineStartingPoint: _this.start,
            timelineEndingPoint: _this.end
        })
    })
}
export function worldArenaPrediction(list, _this) {
    return getAvarage(list, 'season', stats => {
        return setLinearPrediction(list, {
            title: 'World Arena Season Automated Prediction',
            type: 'season',
            length: stats.avgLength,
            downTime: stats.avgDownTime,
            startingDay: 6,
            endingDay: 6,
            startTime: [3,0,0],
            endTime: [2,59,59],
            timelineStartingPoint: _this.start,
            timelineEndingPoint: _this.end
        })
    })
}
export function guildWarPrediction(list, _this) {
    return getAvarage(list, 'season', stats => {
        return setLinearPrediction(list, {
            title: 'Guild War Season Automated Prediction',
            type: 'season',
            length: stats.avgLength,
            downTime: stats.avgDownTime,
            startingDay: 6,
            endingDay: 6,
            startTime: [10,0,0],
            endTime: [9,59,59],
            timelineStartingPoint: _this.start,
            timelineEndingPoint: _this.end
        })
    })
}
export function exclusiveEquipmentPrediction(list, _this) {
    return getAvarage(list, null, stats => {
        return setLinearPrediction(list, {
            title: 'New EEs [Expected]',
            length: stats.avgLength,
            downTime: stats.avgDownTime,
            startingDay: 4,
            endingDay: 4,
            startTime: [0,0,0],
            endTime: [0,0,0],
            timelineStartingPoint: _this.start,
            timelineEndingPoint: _this.end
        })
    })
}
export function balancePrediction(list, _this) {
    return setLinearPrediction(list, {
        title: 'Balance Preview Prediction',
        type: 'balance',
        length: 0,
        downTime: 6*7, // preview is every 6 weeks
        startingDay: 5,
        endingDay: 5,
        startTime: [10,0,0],
        endTime: [0,0,0],
        timelineStartingPoint: _this.start,
        timelineEndingPoint: _this.end
    })
}