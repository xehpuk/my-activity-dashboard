import dayjs from 'dayjs'
import { mean } from 'lodash'

import getDistance from './getDistance.js'

function importAll(r) {
  const cache = []
  r.keys().forEach((key) => cache.push({ key, ...r(key) }))
  return cache
}

const activities = importAll(require.context('./activities', false, /\.json$/))

/**
 * Get dem speds plz
 * @param {Array} trkpt - puns o' trek
 * @returns {Array} tha spedo
 */
const getSpeeds = (trkpt) => {
  const { length } = trkpt
  const speeds = Array(length - 1)
  for (let i = 1; i < length; i++) {
    const pt1 = trkpt[i - 1]
    const pt2 = trkpt[i]
    speeds[i - 1] = getDistance([pt1.lat, pt1.lon], [pt2.lat, pt2.lon]) / dayjs(pt2.time).diff(pt1.time, 'h', true)
  }
  return speeds
}

const mappedActivities = activities.map(({ gpx, key }) => {
  const endTime = gpx.trk.trkseg.trkpt[gpx.trk.trkseg.trkpt.length - 1].time
  const startTime = gpx.trk.trkseg.trkpt[0].time
  const distance = gpx.trk.trkseg.trkpt.reduce((acc, val) => ({
    sum: (acc.sum || 0) + getDistance([acc.lat, acc.lon], [val.lat, val.lon]),
    ...val,
  })).sum
  const speeds = getSpeeds(gpx.trk.trkseg.trkpt)
  const trkpts = gpx.trk.trkseg.trkpt.map((pt) => [
    pt.lat,
    pt.lon,
    pt.ele,
    dayjs(pt.time).diff(startTime),
  ])

  const speed = distance / dayjs(endTime).diff(startTime, 'h', true)

  console.log({
    jguddas: speed,
    xehpuk: mean(speeds),
  })

  return ({
    id: key.replace(/^.\//, '').replace(/\.\w*$/, ''),
    endTime,
    startTime,
    distance,
    name: gpx.trk.name,
    duration: dayjs(endTime).diff(startTime),
    date: dayjs(startTime).format('YYYY-MM-DD'),
    trkpts,
    startpt: trkpts[0],
    endpt: trkpts[trkpts.length - 1],
    speed,
    speeds,
  })
}).sort((a, b) => dayjs(b.startTime).diff(a.startTime))

// console.log(JSON.stringify(mappedActivities))
export default mappedActivities
