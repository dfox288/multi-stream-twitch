import React from 'react';
import {connect} from 'react-redux';
import AddIcon from 'react-icons/lib/md/add';
import ClearAllIcon from 'react-icons/lib/md/clear-all';
import MuteAllIcon from 'react-icons/lib/md/volume-mute';
import GridViewIcon from 'react-icons/lib/md/grid-on';
import ShuffleViewIcon from 'react-icons/lib/ti/arrow-shuffle';
import Tooltip from 'rc-tooltip';
import uuid from 'uuidv4';
import {
  WIDGET_CONSTRAINTS,
  addWidget,
  clearLayout,
  muteAllWidgets,
} from '../../../common/streams/actions';
import {
  showHelp,
  hideHelp,
  showShareableLink,
  hideShareableLink,
  toggleViewType,
} from '../../../common/home/actions';
import {Footer, Navbar, HelpDialog, ShareableLinkDialog} from '../../components';
import ChannelAutoComplete from '../ChannelAutoComplete';
import StreamGrid from '../StreamGrid';
import StreamShuffler from '../StreamShuffler';
import theme from '../../theme';
import styles from './styles';
import {getPackedPosition} from '../../../common/packer';
import * as _ from 'lodash';
import StreamGroups from '../StreamGroups';

const NavbarIconTooltip = (props) => {
  return (
      <Tooltip
          placement="bottomLeft"
          trigger={['hover']}
          overlay={<div style={theme.components.tooltip}>{props.tooltip}</div>}
      >
        {props.children}
      </Tooltip>
  );
};

const NavbarActions = ({
                         style,
                         showingGrid,
                         onAddBlankWidget,
                         onClearAllWidgets,
                         onMuteAllWidgets,
                         onToggleViewType,
                       }) => {
  const ViewToggleIcon = showingGrid ? ShuffleViewIcon : GridViewIcon;
  const toggleIconTooltip = showingGrid ? 'Shuffle View' : 'Grid View';
  return (
      <div style={style.navbar__actions}>
        <NavbarIconTooltip tooltip="Add Blank Panel">
          <AddIcon
              style={style.icon}
              onClick={onAddBlankWidget}
          />
        </NavbarIconTooltip>
        {
          /*
          Revisit mute all | change video quality, when building out custom player controls
          <NavbarIconTooltip tooltip="Mute All">
            <MuteAllIcon
              style={ style.icon }
              onClick={ onMuteAllWidgets }
            />
          </NavbarIconTooltip>
          */
        }
        {
          <NavbarIconTooltip tooltip={toggleIconTooltip}>
            <ViewToggleIcon
                style={style.icon}
                onClick={onToggleViewType}
            />
          </NavbarIconTooltip>
        }

      </div>
  );
};

const Home = ({
                footerHeight,
                navbarHeight,
                showingHelp,
                title,
                layout,
                showingShareLink,
                showingGrid,
                shortUrl,
                onHideHelp,
                onShowHelp,
                onHideShare,
                onShowShare,
                onAddBlankWidget,
                onClearAllWidgets,
                onMuteAllWidgets,
                onToggleViewType,
                onMainChannelAdd
              }) => (
    <div style={styles.container}>
      <Navbar
          title="novoque - social"
          height={navbarHeight}
          style={styles.navbar}
      >
        <div style={styles.navbar__inner}>
          <div className={"add-main"}>
            <a href={'#'} onClick={(event) => onMainChannelAdd()}>
              mainscreen
            </a>
          </div>
          <StreamGroups/>
          <NavbarActions
              style={styles}
              showingGrid={showingGrid}
              onAddBlankWidget={onAddBlankWidget.bind(this, layout)}
              onClearAllWidgets={onClearAllWidgets}
              onMuteAllWidgets={onMuteAllWidgets}
              onToggleViewType={onToggleViewType}
          />
        </div>
      </Navbar>
      <div
          className="stream-content-container"
          style={styles.content__container(navbarHeight + footerHeight)}
      >
        {
          _.isEmpty(layout) ?
              <div style={styles.no__widgets}>
                <div style={styles.no__widgets__container}>
                  You have added no streams. Select one of the collections in the header to get
                  you started. You can add more streams with the <AddIcon/> on the top right.
                </div>
                <div style={styles.no__widgets__container}>
                  You can add the main novoque twitch stream anytime with the "mainscreen"
                  option in the header. New streams in the collection will pop up as they are
                  added.
                </div>
                <div style={styles.no__widgets__container}>
                  Try "Shuffle View" and rearrange the streams as you like, or use "Grid View"
                  to follow one stream in a big window and have the other ones in smaller windows
                  on the bottom.
                </div>
              </div>
              :
              showingGrid ?
                  <StreamGrid/>
                  :
                  <StreamShuffler/>
        }
      </div>
    </div>
);

const mapState = state => {
  return {
    ...state.home.toJS(),
    layout: state.streams.layout.toJSON(),
  };
};

const mapDispatch = dispatch => ({
  onShowHelp: () => dispatch(showHelp()),
  onHideHelp: () => dispatch(hideHelp()),
  onShowShare: (layout) => dispatch(showShareableLink(layout)),
  onHideShare: () => dispatch(hideShareableLink()),
  onAddBlankWidget: (layout) => {
    const i = uuid();
    console.log('dingens', i, layout);
    dispatch(addWidget(i, {i, ...getPackedPosition(12, WIDGET_CONSTRAINTS, layout)}));
  },
  onClearAllWidgets: () => dispatch(clearLayout()),
  onMuteAllWidgets: () => dispatch(muteAllWidgets()),
  onToggleViewType: () => dispatch(toggleViewType()),
  onMainChannelAdd: () => {
    const id = "evoke";
    const type = "twitch";
    const dynamicAttribute = type === 'twitch' ? 'channelId' : 'videoId';
    const generatedId = uuid();
    dispatch(addWidget(generatedId, {
      i: generatedId,
      playerId: id,
      [dynamicAttribute]: id,
      muted: false,
      autoplay: true,
      type,
    }));
  },
});

export default connect(mapState, mapDispatch)(Home);
