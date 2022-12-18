import { Delete } from '@mui/icons-material';
import { Avatar, IconButton, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { css } from '@emotion/css';
import { useTheme } from '@emotion/react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useMutation } from '@apollo/client';
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
    avatar: {
        width: 44,
        height: 44
    },
    text: {
        textOverflow: 'ellipsis',
        overflow: 'hidden'
    },
    container: {
        display: 'grid',
        gridAutoFlow: 'column',
        gridTemplateColumns: '50px auto 50px',
        gridGap: 12,
        alignItem: 'center',
        marginTop: 10 
    },
    songInfoContainer: {
        overflow: 'hidden',
        whiteSpace: 'nowrap'
    }
  });

export default function QueuedSongs({ queue }) {
    const greaterThanMedium = useMediaQuery(theme => theme.breakpoints.up('md'))
   
    return greaterThanMedium &&(
         
        <div styles={{margin: '10px 0'}}>
            <Typography color='textSecondary' variant='button'>
                QUEUE ({queue.length})
            </Typography>
            {queue.map(song => (
                <QueuedSong key={song.id} song={song}/>
            ))}

        </div>
        
        
    )

    function QueuedSong({ song }) {
        const [addOrRemoveFromQueue] = useMutation(ADD_OR_REMOVE_FROM_QUEUE)
        const classes = useClasses(styles);
        const { thumbnail, artist, title } = song

        function handleAddOrRemoveFromQueue() {
            addOrRemoveFromQueue({
                variables: { input: { ...song, __typename: 'Song' }}
            })
        }

        return (
            <div className={classes.container}>
               <Avatar src={thumbnail} alt='song thumbnail'/>
               <div className={classes.songInfoContainer}>
                    <Typography className={classes.text} variant='subtitle2'>
                        {title}
                    </Typography> 
                    <Typography className={classes.text} color='textSecondary' variant='body2'>
                        {artist}
                    </Typography>
                </div> 
                 <IconButton
                    onClick={handleAddOrRemoveFromQueue}
                 >
                    <Delete color='error'/>
                </IconButton>
            </div>
            
        )
    }
}