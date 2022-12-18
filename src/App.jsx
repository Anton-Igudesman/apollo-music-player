import React, { useContext, createContext, useState, useReducer } from 'react';
import Grid from '@mui/material/Grid';
import Header from './components/Header';
import AddSong from './components/AddSong';
import SongPlayer from './components/SongPlayer';
import SongList from './components/SongList';
import useMediaQuery from '@mui/material/useMediaQuery';
import songReducer from './reducer'

export const SongContext = createContext({
  song: {
    id: '4816a204-a566-4711-99d9-a0e5a5a1297e',
    title: 'Man With An Open Heart',
    artist: 'King Crimson',
    thumbnail: 'http://img.youtube.com/vi/ojDaQMbKiJs/0.jpg',
    url: 'https://www.youtube.com/watch?v=ojDaQMbKiJs',
    duration: 186
  },
  isPlaying: false
});

export default function App() {
  const initialSongState = useContext(SongContext)
  const [state, dispatch] = useReducer(songReducer, initialSongState)
  const greaterThanMedium = useMediaQuery(theme => theme.breakpoints.up('md'))
  const greaterThanSmall = useMediaQuery(theme => theme.breakpoints.up('sm'))

  
  

  return (
    <SongContext.Provider value={{ state, dispatch }}>
      { greaterThanSmall && <Header /> }
      <Grid container spacing={3}>
        <Grid style={{
          paddingTop: greaterThanSmall ? 110 : 20
          }}
          item 
          xs={12} 
          md={7}>
          <AddSong />
          <SongList />
        </Grid>
        <Grid 
          style={
            greaterThanMedium ? {
            position: 'fixed',
            width: '100%',
            right: 0,
            top: 70, 
           }: {
            position: 'fixed',
            left: 0,
            bottom: 0,
            width: '100%'
           }}
        item xs={12} md={5}>
          <SongPlayer />
        </Grid>
      </Grid>
    </SongContext.Provider>
  )
}


