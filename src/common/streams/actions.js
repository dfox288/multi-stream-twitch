import * as _ from 'lodash';
import {fromJS, Map} from 'immutable';

export const WIDGET_CONSTRAINTS = {
  w: 6,
  h: 10,
  minW: 3,
  minH: 4,
  maxW: 12,
  maxH: 24,
  static: false
};

export const LOAD_SHARED_LAYOUT = 'LOAD_SHARED_LAYOUT';

export const loadSharedLayout = (layout) => ({
  type: LOAD_SHARED_LAYOUT,
  data: fromJS(layout)
});

export const UPDATE_LAYOUT = 'UPDATE_LAYOUT';

export const updateLayout = (widgets, _) => {
  return {
    type: UPDATE_LAYOUT,
        data: fromJS(widgets)
  }
};

export const CLEAR_LAYOUT = 'CLEAR_LAYOUT';

export const clearLayout = () => ({
  type: CLEAR_LAYOUT
});

export const ADD_WIDGET = 'ADD_WIDGET';
export const UPDATE_WIDGET = 'UPDATE_WIDGET';
export const DELETE_WIDGET = 'DELETE_WIDGET';
export const MUTE_ALL_WIDGETS = 'MUTE_ALL_WIDGETS';

const baseFields = ['i', 'autoplay', 'muted', 'type', 'name', 'playerId', 'channelId', 'videoId', 'video_banner', 'logo'];

const generateWidgetInstance = (data) => {
  return   Map({
    ...(_.pick(data, baseFields)),
    ...WIDGET_CONSTRAINTS,
    x: _.get(data, 'x', 0),
    y: _.get(data, 'y', Infinity)
  });
};

export const muteAllWidgets = () => ({
  type: MUTE_ALL_WIDGETS
});

export const addWidget = (i, data) => {
  return {
    type: ADD_WIDGET,
        i,
        data: fromJS(generateWidgetInstance(data))
  }
};

export const updateWidget = (i, data) => {
  return {
    type: UPDATE_WIDGET,
    i,
    data: fromJS(data)
  }
};

export const deleteWidget = (i) => ({
  type: DELETE_WIDGET,
  i
});
