import { useTheme } from '@emotion/react';
import { PlayArrow, Save, Pause } from '@mui/icons-material';
import { Card, CardActions, CardContent, CardMedia, CircularProgress, IconButton, Typography } from '@mui/material';
import React, { useMemo, useContext, useEffect, useState } from 'react';
import { css } from '@emotion/css';
import { useSubscription, useMutation } from '@apollo/client';
import { GET_SONGS } from '../graphql/subscriptions';
import { SongContext } from '../App';
import { ADD_OR_REMOVE_FROM_QUEUE } from '../graphql/mutations';

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
        margin: theme.spacing(3)
    },
    songInfoContainer: {
        display: 'flex',
        alignItems: 'center'
    },
    songInfo: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between'
    },
    thumbnail: {
        objectFit: 'cover',
        width: 140,
        height: 140
    }
  });

export default function SongList() {
    const { data, loading, error } = useSubscription(GET_SONGS)

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: 50
            }}>
                <CircularProgress color='pink'/>
            </div>
        )
    }
    if (error) return <div>error fetching songs</div>
    return (
        <div>{data.songs.map(song => (
          <Song key={song.id} song={song}/>  
        ))}</div>
    )
   function Song( {song} ) {
        const classes = useClasses(styles);
        const [addOrRemoveFromQueue] = useMutation(ADD_OR_REMOVE_FROM_QUEUE, {
            onCompleted: data => {
               localStorage.setItem('queue', JSON.stringify(data.addOrRemoveFromQueue)) 
            }
        })
        const { state, dispatch } = useContext(SongContext)
        const [currentSongPlaying, setCurrentSongPlaying] = useState(false)
        const { thumbnail, title, artist, id } = song;

        function handleTogglePlay() {
            dispatch({ type: 'SET_SONG', payload: { song } })
            dispatch(state.isPlaying? { type: 'PAUSE_SONG' } : { type: 'PLAY_SONG' });
          }

        function handleAddOrRemoveFromQueue() {
            addOrRemoveFromQueue({
                variables: { input: { ...song, __typename: 'Song' }}
            })
        }

        useEffect(() => {
            const isSongPlaying = state.isPlaying && id === state.song.id;
            setCurrentSongPlaying(isSongPlaying)
        }, [id, state.song.id, state.isPlaying])

        return (
                <Card className={classes.container}>
                    <div className={classes.songInfoContainer}>
                        <CardMedia image={thumbnail} className={classes.thumbnail}/>
                        <div className={classes.songInfo}>
                            <CardContent>
                                <Typography gutterBottom variant='h5' component='h2'>
                                    {title}
                                </Typography>
                                <Typography gutterBottom variant='body1' component='p' color='textSecondary'>
                                    {artist}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <IconButton 
                                    onClick={handleTogglePlay}
                                    size='small' 
                                    color='secondary'>
                                    {currentSongPlaying ? 
                                    <Pause /> :
                                    <PlayArrow />
                                    }
                                </IconButton>
                                <IconButton 
                                    onClick={handleAddOrRemoveFromQueue}
                                    size='small' 
                                    color='pink'>
                                    <Save />
                                </IconButton>

                            </CardActions>
                        </div>
                    </div>
                </Card>
            )
    } 
}
