import React from 'react';
import './mainContainer.css';
import HeaderNavbar from '../Navbar/navbar';
import Grid from '../Grid/grid';

function MainContainer() {
    return (
        <div style={{ height: '100%' }}>
            <HeaderNavbar></HeaderNavbar>
            <Grid></Grid>
        </div>
    )
}

export default MainContainer;
