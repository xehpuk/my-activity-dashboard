import React from 'react'
import dayjs from 'dayjs'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import {
  Page, Card, Button, colors,
} from 'tabler-react'
import C3Chart from 'react-c3js'

import getDistance from '../../getDistance.js'

import ActivityMapWithSlider from './ActivityMapWithSlider.js'
import MatchedActivitiesTable from '../Matched/MatchedActivitiesTable.js'

function ActivitysPage({ activity, activities }) {
  const isRoundTrip = getDistance(activity.startpt, activity.endpt) <= 0.5

  const matchedActivities = isRoundTrip
    ? [activity]
    : activities.filter(({ startpt, endpt }) => (
      getDistance(endpt, activity.endpt) < 0.5
      && getDistance(startpt, activity.startpt) < 0.5
    ))

  const timezoneOffsetMs = new Date(0).getTimezoneOffset() * 60000

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
      />
      <Card>
        <MyChart
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

export default ActivitysPage

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
`
