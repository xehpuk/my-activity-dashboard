import React, { useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'
import { maxBy } from 'lodash'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import {
  Page, Card, Button, colors,
} from 'tabler-react'
import C3Chart from 'react-c3js'

import getDistance from '../../getDistance.js'

import ActivityMapWithSlider from './ActivityMapWithSlider.js'
import MatchedActivitiesTable from '../Matched/MatchedActivitiesTable.js'

function ActivityPage({ activity, activities }) {
  const matchedActivities = useMemo(() => getDistance(activity.startpt, activity.endpt) <= 0.5
    ? [activity]
    : activities.filter(({ startpt, endpt }) => (
      getDistance(endpt, activity.endpt) < 0.5
      && getDistance(startpt, activity.startpt) < 0.5
    )), [activity, activities])
  const maxActivityDurationInMinutes = useMemo(() => Math.ceil(
    maxBy([activity].concat(matchedActivities), 'duration').duration / 60000,
  ), [activity, matchedActivities])

  const requestRef = useRef()
  const matchedTimeRef = useRef()
  const chartRef = useRef()

  const [{ playing, time }, setState] = useState({
    time: maxActivityDurationInMinutes,
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const animate = (newTime) => {
    if (matchedTimeRef.current !== undefined) {
      setState((matchedState) => {
        const deltaTime = newTime - matchedTimeRef.current
        const nextTime = matchedState.time + deltaTime * 0.01
        const inRange = nextTime < maxActivityDurationInMinutes
        return (
          matchedState.playing ? ({
            playing: inRange,
            time: inRange ? nextTime : maxActivityDurationInMinutes,
          }) : matchedState
        )
      })
    }
    matchedTimeRef.current = newTime
    requestRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(requestRef.current)
  }, [animate])

  const timezoneOffsetMs = new Date(0).getTimezoneOffset() * 60000

  const chartElement = useMemo(() => (
    <MyChart
      ref={chartRef}
      data={{
        columns: [
          ['duration', ...activity.trkpts.slice(1).map(([,,, ms]) => new Date(ms + timezoneOffsetMs))],
          ['speedStroke', ...activity.speeds],
          ['speedFill', ...activity.speeds],
        ],
        x: 'duration',
        type: 'line',
        colors: {
          speedFill: colors.purple,
          speedStroke: 'black',
        },
      }}
      point={{ show: false }}
      legend={{ show: false }}
      axis={{
        y: { show: false },
        x: { show: false, type: 'timeseries', tick: { format: '%H:%M:%S' } },
      }}
    />
  ), [activity, timezoneOffsetMs])

  useEffect(() => {
    if (chartRef.current) {
      // performance killer 👌
      chartRef.current.chart.xgrids([
        { value: new Date(1000 * 60 * time + timezoneOffsetMs) },
      ])
    }
  }, [time, timezoneOffsetMs])

  return (
    <Page.Content>
      <Button
        icon="arrow-left"
        prefix="fe"
        color="secondary"
        RootComponent={Link}
        to={`/activities/${dayjs(activity.date).format('YYYY-MM')}`}
      >
        Go Back
      </Button>
      <Page.Header>
        <Page.Title>
          {`${activity.name} - ${dayjs(activity.date).format('DD.MM.YYYY')}`}
        </Page.Title>
      </Page.Header>
      <ActivityMapWithSlider
        activity={activity}
        matchedActivities={
          matchedActivities.filter(({ id }) => id !== activity.id)
        }
        maxActivityDurationInMinutes={maxActivityDurationInMinutes}
        playing={playing}
        time={time}
        setState={setState}
      />
      <Card>
        {chartElement}
      </Card>
      <Card>
        <Card.Header>
          <Card.Title>Matched - Start and End Point</Card.Title>
        </Card.Header>
        <MatchedActivitiesTable
          activities={matchedActivities}
          activity={activity}
        />
      </Card>
    </Page.Content>
  )
}

export default ActivityPage

const MyChart = styled(C3Chart)`
  height: 10rem;
  * { fill: none };
  .c3-lines {
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .c3-lines-speedFill { stroke-width: 3; }
  .c3-lines-speedStroke { stroke-width: 5; }
  .c3-grid-lines { stroke: black; }
`
