import { SkipPrevious, PlayArrow, SkipNext, Pause } from '@mui/icons-material';
import { useTheme } from '@emotion/react';
import { css } from '@emotion/css';
import { Card, CardContent, CardMedia, IconButton, Slider, Typography } from '@mui/material';
import React, { useMemo, useContext, useRef, useState, useEffect } from 'react';
import QueuedSongs from './QueuedSongs'
import { SongContext } from '../App';
import { useQuery } from '@apollo/client';
import { GET_QUEUED_SONGS } from '../graphql/queries';
import ReactPlayer from 'react-player';

const useClasses = stylesElement => {
    const theme = useTheme();
    return useMemo(() => {
      const rawClasses = typeof stylesElement === 'function'
        ? stylesElement(theme)
        : stylesElement;
      const prepared = {};
  
      Object.entries(rawClasses).forEach(([key, value = {}]) => {
        prepared[key] = css(value);
      });
  
      return prepared;
    }, [stylesElement, theme]);
  };
  
  const styles = theme => ({
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      marginRight: 30,
    },
    details: {
      display: 'flex',
      flexDirection: 'column',
      padding: '0px 15px'
    },
    content: {
      flex: '1 0 auto',
    },
    thumbnail: {
      width: 150
    },
    controls: {
      display: 'flex',
      alignItems: 'center',
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1)
    },
  });

export default function SongPlayer() {
    const reactPlayerRef = useRef();
    const [played, setPlayed] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [playedSeconds, setPlayedSeconds] = useState(0);
    const [positionInQueue, setPositionInQueue] = useState(0);
    const { data } = useQuery(GET_QUEUED_SONGS);
    const { dispatch, state  } = useContext(SongContext);
    const classes = useClasses(styles);

    useEffect(() => {
      const songIndex = data.queue.findIndex(song => song.id === state.song.id);
      setPositionInQueue(songIndex)
      console.log(songIndex)
    }, [data.queue, state.song.id])

    useEffect(() => {
      const nextSong = data.queue[positionInQueue + 1];
      if (played >= .99 && nextSong) {
        setPlayed(0);
        dispatch({ type: 'SET_SONG', payload: { song: nextSong }})
      }
    }, [data.queue, played, dispatch, positionInQueue])
    
    function handleTogglePlay() {
      dispatch(state.isPlaying? { type: 'PAUSE_SONG' } : { type: 'PLAY_SONG' });
    }

    function handleProgressChange(event, newValue) {
      setPlayed(newValue);
    }

    function handleSeekMouseDown() {
      setSeeking(true);
      
    }

    function handleSeekMouseUp() {
      setSeeking(false);
      reactPlayerRef.current.seekTo(played)
    }

    function formatDuration(seconds) {
      return new Date(seconds * 1000).toISOString().substr(11, 8);
    }

    function handlePlayPrevious() {
      const prevSong = data.queue[positionInQueue - 1];
      if (prevSong) {
        dispatch({ type: 'SET_SONG', payload: { song: prevSong }})
      }
    }

    function handlePlayNext() {
      const nextSong = data.queue[positionInQueue + 1];
      if (nextSong) {
        dispatch({ type: 'SET_SONG', payload: { song: nextSong }})
      }
    }
    
    return (
        <>
           <Card className={classes.container} variant='outlined'>
                <div className={classes.details}>
                   <CardContent className={classes.content}>
                    <Typography variant='h5' component='h3'>
                        {state.song.title}
                     </Typography>
                     <Typography variant='subtitle1' component='p'>
                        {state.song.artist}
                     </Typography>
                    </CardContent> 
                        <div className={classes.controls}>
                            <IconButton onClick={handlePlayPrevious}>
                                <SkipPrevious />
                            </IconButton>
                            <IconButton onClick={handleTogglePlay}>
                                
                                {state.isPlaying ? 
                                <Pause fontSize='large' /> : 
                                <PlayArrow fontSize='large' />
                                }
                            </IconButton>
                            <IconButton onClick={handlePlayNext}>
                                <SkipNext />
                            </IconButton>
                            <Typography variant='subtitle1' component='p'>
                                {formatDuration(playedSeconds)}
                            </Typography>
                        </div>
                    <Slider
                        onMouseUp={handleSeekMouseUp}
                        onMouseDown={handleSeekMouseDown}
                        onChange={handleProgressChange}
                        value={played}
                        className={classes.slider}
                        color='neongreen'
                        type='range'
                        min={0}
                        max={1}
                        step={0.01}
                    />
                </div>
                <ReactPlayer 
                  ref={reactPlayerRef}
                  onProgress={({ played, playedSeconds }) => {
                    if (!seeking) {
                      setPlayed(played);
                      setPlayedSeconds(playedSeconds);
                    }
                  }}
                  playing={state.isPlaying}
                  url={state.song.url} 
                  hidden 
                />
                <CardMedia 
                    className={classes.thumbnail}
                    image={state.song.thumbnail}
                />
            </Card> 
            <QueuedSongs queue={data.queue} />
        </>
    )
}