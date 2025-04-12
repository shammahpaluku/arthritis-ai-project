import React from 'react';
import { Box, Typography, Slider, useTheme } from '@mui/material';
import BeforeAfterSlider from 'react-before-after-slider-component';
import 'react-before-after-slider-component/dist/build.css';

const ImageComparison = ({ originalImage, analyzedImage }) => {
  const theme = useTheme();
  const [sliderPosition, setSliderPosition] = React.useState(50);

  // Ensure the component is properly imported
  if (typeof BeforeAfterSlider === 'undefined') {
    console.error('BeforeAfterSlider component is not properly imported');
    return (
      <Box sx={{ p: 2, backgroundColor: 'error.light', color: 'error.contrastText' }}>
        Error: Image comparison component failed to load
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: 800,
      mx: 'auto',
      mt: 4,
      p: 2,
      backgroundColor: theme.palette.background.paper,
      borderRadius: 2,
      boxShadow: theme.shadows[2]
    }}>
      <Typography variant="h6" gutterBottom align="center">
        Image Analysis Comparison
      </Typography>
      
      <Box sx={{ position: 'relative', height: 400 }}>
        <BeforeAfterSlider
          firstImage={{
            imageUrl: originalImage || '/placeholder-xray.jpg',
            alt: 'Original X-ray'
          }}
          secondImage={{
            imageUrl: analyzedImage || '/placeholder-analysis.jpg',
            alt: 'AI Analysis'
          }}
          currentPercentPosition={sliderPosition}
          onChangePercentPosition={setSliderPosition}
          separatorLineColor={theme.palette.primary.main}
          hoverOverlayColor={theme.palette.primary.light}
        />
      </Box>

      <Box sx={{ mt: 2, px: 4 }}>
        <Slider
          value={sliderPosition}
          onChange={(e, newValue) => setSliderPosition(newValue)}
          aria-labelledby="image-comparison-slider"
          sx={{
            color: theme.palette.primary.main,
            height: 8,
            '& .MuiSlider-thumb': {
              height: 24,
              width: 24,
              backgroundColor: theme.palette.primary.main,
            },
          }}
        />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          mt: 1
        }}>
          <Typography variant="caption" color="textSecondary">
            Original Scan
          </Typography>
          <Typography variant="caption" color="textSecondary">
            AI Analysis
          </Typography>
        </Box>
      </Box>

      <Box sx={{ 
        mt: 3,
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle2" color="primary">
            Original
          </Typography>
          <Box
            component="img"
            src={originalImage || '/placeholder-xray.jpg'}
            alt="Original X-ray"
            sx={{
              height: 120,
              width: 'auto',
              maxWidth: '100%',
              objectFit: 'contain',
              border: `2px solid ${theme.palette.primary.light}`,
              borderRadius: 1
            }}
          />
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle2" color="secondary">
            AI Markers
          </Typography>
          <Box
            component="img"
            src={analyzedImage || '/placeholder-analysis.jpg'}
            alt="AI Analysis"
            sx={{
              height: 120,
              width: 'auto',
              maxWidth: '100%',
              objectFit: 'contain',
              border: `2px solid ${theme.palette.secondary.light}`,
              borderRadius: 1
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ImageComparison;