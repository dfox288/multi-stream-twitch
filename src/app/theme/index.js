import Color from 'color';
import * as _ from 'lodash';

/******************************************************************************
* Colors
*******************************************************************************/

const baseColor = Color('#000000');

const defaultColorScheme = {
  black: 'black',
  white: 'white',
  gray: '#777777',
  darkGray: '#555555',
  darkestGray: '#333333',
  lightGray: '#dddddd',
  lightestGray: '#f2f2f2',
  primary: '#fff',
  secondary: '#fff',
  accent: '#fff',
  // others
  red: Color('#e74c3c').string(),
};

const colors = (overrides) => defaultColorScheme;

/******************************************************************************
* TYPOGRAPHY
*******************************************************************************/

const defaultFonts = 'Quattrocento Sans, sans-serif';

const typography = (overrides) => ({
  base: {
    fontFamily: _.get(overrides, ['base', 'fontFamily'], defaultFonts),
    fontWeight: _.get(overrides, ['base', 'fontWeight'], 500),
    color:  _.get(overrides, ['base', 'color'], defaultColorScheme.white)
  },
  branding: {
    fontFamily: _.get(overrides, ['branding', 'fontFamily'], defaultFonts),
    fontWeight: _.get(overrides, ['branding', 'fontWeight'], 900)
  },
  header: {
    fontSize: '1.75em',
    fontWeight: 900
  },
  labels: {
    fontSize: '0.8em',
    fontWeight: 500
  }
});

const spacing = 10;

/******************************************************************************
* Default Theme
*******************************************************************************/

const theme = ({ typography: typoOverrides, colors: colorOverrides }) => ({
  typography: typography(typoOverrides),
  colors: colors(colorOverrides),
  spacing,
  branding: {
    youtube: {
      color: '#cc181e'
    },
    twitch: {
      color: '#4b367c'
    },
    hls: {
      color: '#4b367c'
    }
  },
  components: {
    tooltip: {
      fontFamily: 'Quattrocento Sans, sans-serif',
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      width: '100%',
      fontWeight: 400,
      justifyContent: 'center',
      color: "#fff"
    }
  }
});

/******************************************************************************
* Application specific overrides
*******************************************************************************/

const applicationThemeOverrides = {
  typography: {
    base: {
      fontFamily: 'Quattrocento Sans, sans-serif',
      color: colors.white
    },
    branding: {
      fontFamily: 'Quattrocento Sans, sans-serif',
      fontWeight: 300
    }
  }
};

export default theme(applicationThemeOverrides);
