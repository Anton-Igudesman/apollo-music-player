import { AddBoxOutlined, Link } from '@mui/icons-material';
import { createTheme } from '@mui/material/styles';
import SoundCloudPlayer from 'react-player/lib/players/SoundCloud';
import YouTubePlayer from 'react-player/lib/players/YouTube';
import ReactPlayer from 'react-player';
import { InputAdornment, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import React, { useState, useEffect, useMemo } from 'react';
import { css } from '@emotion/css';
import { useTheme } from '@emotion/react';
import { useMutation } from '@apollo/client';
import { ADD_SONG } from '../graphql/mutations';

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
        alignItems: 'center'
    },
    urlInput: {
        margin: theme.spacing(1)
    },
    addSongButton: {
        margin: theme.spacing(1)
    },
    dialog: {
        textAlign: 'center'
    },
    thumbnail: {
       width: '80%' 
    }
  });

  const DEFAULT_SONG = {
        duration: 0,
        title: '',
        artist: '',
        thumbnail: ''
  }

export default function AddSong() {
    const [addSong, { error }] = useMutation(ADD_SONG)
    const [dialog, setDialog] = useState(false);
    const [url, setUrl] = useState('');
    const [playable, setPlayable] = useState(false)
    const [songData, setSongData] = useState(DEFAULT_SONG)
    const classes = useClasses(styles);

    function handleCloseDialog() {
        setDialog(false)
        setSongData(DEFAULT_SONG)
        setUrl('')
    }

    useEffect(() => {
       const isPlayable = SoundCloudPlayer.canPlay(url) || YouTubePlayer.canPlay(url) 
       setPlayable(isPlayable)
    }, [url])

    async function handleEditSong({ player }) {
        const nestedPlayer = player.player.player
        let songData;
        if (nestedPlayer.getVideoData) {
            songData = getYouTubeInfo(nestedPlayer)
        } else if (nestedPlayer.getCurrentSound) {
            songData = await getSoundCloudInfo(nestedPlayer)
        }
        setSongData({ ...songData, url });
    }

    async function handleAddSong() {
        try {
            const {url, thumbnail, duration, artist, title} = songData
        await addSong({
            variables: {
                url: url.length > 0 ? url : null,
                thumbnail: thumbnail.length > 0 ? thumbnail : null,
                duration: duration > 0 ? duration : null,
                title: title.length > 0 ? title : null,
                artist: artist.length > 0 ? artist : null
            }
        })
        handleCloseDialog()
        } catch (error){
            console.error('error adding song', error)
        }
    }

    function getYouTubeInfo(player) {
        const duration = player.getDuration();
        const { title, video_id, author } = player.getVideoData();
        const thumbnail = `http://img.youtube.com/vi/${video_id}/0.jpg`
        return {
            duration,
            title,
            artist: author,
            thumbnail
        }
    }

    function getSoundCloudInfo(player) {
        return new Promise(resolve => {
           player.getCurrentSound(songData => {
            if (songData) {
                resolve({
                    duration: Number(songData.duration / 1000),
                    title: songData.title,
                    artist: songData.user.username,
                    thumbnail: songData.artwork_url.replace('-large', '-t500x500')
                })
            }
        }) 
    })
}

    function handleInfoEdit(event) {
        const { name, value } = event.target
        setSongData(prevData => ({
            ...prevData,
            [name] : value
        }))
    }

    function handleError(field) {
        return error && error.graphQLErrors[0].extensions.path.includes(field);
    }
    
    const { thumbnail, title, artist } = songData
    return (
        <div className={classes.container}>
            <Dialog
                className={classes.dialog}
                open={dialog}
                onClose={handleCloseDialog}
            >
                <DialogTitle>Edit Song</DialogTitle>
                <DialogContent>
                    <img
                        className={classes.thumbnail}
                        src={thumbnail}
                        alt='Song thumbnail'
                    />
                    <TextField
                        onChange={handleInfoEdit}
                        value={title}
                        sx={{pa:5}} 
                        color='pink'
                        margin='dense'
                        name='title'
                        label='Title'
                        error={handleError('title')}
                        helperText={handleError('title') && 'Fill out field'}
                        fullWidth
                    />
                    <TextField 
                        onChange={handleInfoEdit}
                        value={artist}
                        color= 'neongreen'
                        margin='dense'
                        name='artist'
                        label='Artist'
                        error={handleError('artist')}
                        helperText={handleError('artist') && 'Fill out field'}
                        fullWidth
                    />
                    <TextField
                        onChange={handleInfoEdit}
                        value={thumbnail}
                        color='brightyellow'
                        margin='dense'
                        name='thumbnail'
                        label='Thumbnail'
                        error={handleError('thumbnail')}
                        helperText={handleError('thumbnail') && 'Fill out field'}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        color='secondary' 
                        variant='outlined' 
                        onClick={handleCloseDialog}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddSong}
                        className={classes.addSongButton}
                        variant='contained'
                        color='pink'
                    >
                        Add Song
                    </Button>
                </DialogActions>
            </Dialog>
            <TextField
                sx={{mr:1, ml:1}}
                className={classes.urlInput}
                onChange={event => setUrl(event.target.value)}
                value={url}
                variant='standard'
                placeholder='Add a YouTube or SoundCloud URL'
                fullWidth
                margin='normal'
                type='url'
                InputProps={{
                    startAdornment: (
                        <InputAdornment position='start'>
                            <Link sx={{mr:1}} />
                        </InputAdornment>
                    )
                }}
            />
            <Button
                disabled={!playable}
                sx={{mr:1}}
                onClick={() => setDialog(true)}
                variant='outlined'
                color='secondary'
                endIcon={<AddBoxOutlined />}
            >
                Add
            </Button>
            <ReactPlayer url={url} hidden onReady={handleEditSong} />
        </div>
    )
}