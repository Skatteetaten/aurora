import React from 'react'
import Grid from 'aurora-frontend-react-komponenter/beholdere/Grid/Grid'

const doubleColGrid = {
  sm: 10,
  smPush: 1,
  md: 10,
  mdPush: 1,
  lg: 10,
  lgPush: 1,
  xl: 3,
  xlPush: 3,
  xxl: 3,
  xxlPush: 3,
}

const singleColGrid = {
  ...doubleColGrid,
  xl: 6,
  xlPush: 3,
  xxl: 6,
  xxlPush: 3,
}

export const SingleColumn = ({ children }) => (
  <Grid.Col {...singleColGrid}>{children}</Grid.Col>
)

export const DoubleColumn = ({ children }) => (
  <Grid.Col {...doubleColGrid}>{children}</Grid.Col>
)
