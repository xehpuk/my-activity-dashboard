import React, { useState } from 'react'
import L from 'leaflet'
import styled from 'styled-components'
import screenfull from 'screenfull'
import { round } from 'lodash'
import {
  Card, Button, Form, colors,
} from 'tabler-react'

import formatDuration from '../../formatDuration.js'

import ActivityMap from './ActivityMap.js'

function ActivityMapWithSlider({ activity, matchedActivities, maxActivityDurationInMinutes, playing, time, setState }) {
  const [isFullscreen, setFullscreen] = useState(screenfull.isFullscreen)

  return (
    <div className="card">
      <ActivityMap
        activity={activity}
        matchedActivities={matchedActivities}
        trimEnd={time * 60000}
        controls
        scrollWheelZoom={isFullscreen}
        dragging={isFullscreen || !L.Browser.touch}
        setFullscreen={setFullscreen}
        smoothFactor={3}
        height={isFullscreen ? 'calc(100vh - 87px)' : 350}
      >
        <MyCardBody className="bg-white">
          <div className="d-flex">
            <Button
              icon={playing ? 'pause' : 'play'}
              prefix="fe"
              color="purple"
              className="mr-4"
              onClick={() => setState((matchedState) => ({
                playing: !matchedState.playing,
                time: matchedState.time % (maxActivityDurationInMinutes),
              }))}
            />
            <MyRangeSlider
              type="range"
              className="form-control custom-range"
              onChange={(e) => setState(({ time: Number(e.target.value) }))}
              step={0.1}
              min={0}
              max={maxActivityDurationInMinutes}
              value={round(time, 2)}
            />
            <Form.MaskedInput
              className="w-9 ml-4 form-control text-center"
              onChange={(e) => {
                const [hours, minutes, seconds] = e.target.value.split(':')
                const nextTime = (
                  parseInt(hours, 10) * 60
                  + parseInt(minutes, 10)
                  + parseInt(seconds, 10) / 60
                )
                if (nextTime <= maxActivityDurationInMinutes) {
                  setState({ time: nextTime })
                }
              }}
              onClick={() => setState((matchedState) => ({
                time: matchedState.time,
                playing: false,
              }))}
              mask={[/\d/, /\d/, ':', /\d/, /\d/, ':', /\d/, /\d/]}
              value={formatDuration(time * 60000)}
            />
          </div>
        </MyCardBody>
      </ActivityMap>
    </div>
  )
}

export default ActivityMapWithSlider

const MyCardBody = styled(Card.Body)`
  border-top: 1px solid rgba(0, 40, 100, 0.12);
`

const MyRangeSlider = styled.input`
  &:focus::-webkit-slider-thumb {
    border-color: ${() => colors.purple};
    background-color: ${() => colors.purple};
  }

  &:focus::-moz-range-thumb {
    border-color: ${() => colors.purple};
    background-color: ${() => colors.purple};
  }

  &:focus::-ms-thumb {
    border-color: ${() => colors.purple};
    background-color: ${() => colors.purple};
  }

  &::-webkit-slider-runnable-track {
    border-radius: 2px;
    height: 4px;
    background: ${() => colors.purple};
    background-color: ${() => colors.purple};
  }

  &::-moz-range-progress {
    border-radius: 2px;
    height: 4px;
    background: ${() => colors.purple};
    background-color: ${() => colors.purple};
  }

  &::-ms-fill-lower {
    border-radius: 2px;
    height: 4px;
    background: ${() => colors.purple};
    background-color: ${() => colors.purple};
  }
`
