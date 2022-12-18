import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { HeadsetTwoTone } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {main: '#311b92'},
      secondary:{main: '#536dfe'} 
    }
})

export default function Header() {
    return (
        <ThemeProvider theme={theme}>
           <AppBar position='fixed'>
            <Toolbar>
                <HeadsetTwoTone sx={{mr: 1}} />
                <Typography variant='h6' component='h1'>
                    Apollo Music Player
                </Typography>
            </Toolbar>
            </AppBar> 
        </ThemeProvider>   
    )
}