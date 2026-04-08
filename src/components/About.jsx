// src/components/About.jsx
import React from 'react'
import { Typography, Box } from '@mui/material'

const About = () => {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                About Page
            </Typography>
            <Typography variant="body1">
                This is the about page of the application.
            </Typography>
        </Box>
    )
}

export default About