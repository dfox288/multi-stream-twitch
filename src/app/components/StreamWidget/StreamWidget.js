import React from 'react';
import PropTypes from 'prop-types';
import YoutubePlayerIcon from 'react-icons/lib/fa/youtube';
import TwitchIcon from 'react-icons/lib/fa/twitch';
import DefaultToolbarIcon from 'react-icons/lib/fa/question';
import * as _ from 'lodash';
import WidgetToolbar from './WidgetToolbar';
import LoadingIndicator from '../LoadingIndicator';
import StreamDropZone from './StreamDropZone';
import theme from '../../theme';
import Hls from "hls.js";

const baseStyles = (overrides) => ({
  widget__container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: theme.colors.black,
    border: '1px solid #333',
    cursor: 'move'
  },
  stream__view: {
    height: 'calc(100% - 25px)',
    width: '100%'
  },
  moving__container: {
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%'
  },
  widget__toolbar: {
    toolbar: {
      height: 25
    }
  }
});

/*
* Custom component that interacts w/ the twitch player api to have full-control
* over any actions and events you can perform w/ the player itself
*/

class StreamWidget extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      isReady: false
    };
    this.playerInstance = undefined;
    this.defaultStartVolume = 0.25; // 25%
    this.playerInstanceEl = undefined;
  }

  setupYTStream = (props) => {
    const { muted, autoplay, seekTo } = props;

    if(muted){
      this.playerInstance.mute();
    } else {
      this.playerInstance.unMute();
      this.playerInstance.setVolume(this.defaultStartVolume * 100);
    }

    if(seekTo && seekTo > 0){
      this.playerInstance.seekTo(seekTo, true);
    }

    if(autoplay){
      this.playerInstance.playVideo();
    }
  }

  setupHLSStream = (props) => {
    const { muted, autoplay, seekTo } = props;

    if(muted){
      this.playerInstance.mute();
    } else {
      this.playerInstance.unMute();
      this.playerInstance.setVolume(this.defaultStartVolume * 100);
    }

    if(seekTo && seekTo > 0){
      this.playerInstance.seekTo(seekTo, true);
    }

    if(autoplay){
      this.playerInstance.playVideo();
    }
  }

  setupTwitchStream = (props) => {
    const { muted, autoplay } = props;
    this.playerInstance.setMuted(muted);
    if(!muted){
      this.playerInstance.setVolume(this.defaultStartVolume);
    }
  }

  setupChannelConfiguration = (props) => {
    switch(props.type){
      case 'twitch':
        this.setupTwitchStream(props);
        break;
      case 'youtube':
        this.setupYTStream(props);
        break;
      default:
        this.setupHLSStream(props);
    }
  }

  delayTime(type){
    switch(type){
      case 'youtube':
        // yt - you load so fasts!
        return 100;
      default:
        return 1500;
    }
  }

  setReady = (props) => {
    setTimeout(() => {
      this.setState({ isReady: true }, this.setupChannelConfiguration.bind(this, props));
    }, this.delayTime(props.type));
  }

  onStartError = (errorMessage) => {
    this.setState({ isReady: true });
  }

  startStream = (props) => {
    const { type, playerId } = props;
    const onReady = this.setReady.bind(this, props);
    const playerContainerId = this.playerContainerId();
    switch(type){
      case 'hls':
        setTimeout(() => {
          var hlsVideoPlayer = document.createElement('video');
          hlsVideoPlayer.setAttribute('id', 'horst_' + playerContainerId);
          hlsVideoPlayer.setAttribute('controls', 'controls');
          hlsVideoPlayer.style.width = '100%';
          hlsVideoPlayer.style.height = '100%';
          document.getElementById(playerContainerId).appendChild(hlsVideoPlayer);

          console.log(props);
          try {
            this.playerInstance  = document.getElementById('horst_' + playerContainerId);
            if (Hls.isSupported()) {
              const hls = new Hls();
              hls.loadSource(props.videoId ? props.videoId : props.channelId);
              hls.attachMedia(this.playerInstance);
              console.log("Not Safari");
            }
                // HLS.js is not supported on platforms that do not have Media Source
                // Extensions (MSE) enabled.
                //
                // When the browser has built-in HLS support (check using `canPlayType`),
                // we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video
                // element through the `src` property. This is using the built-in support
                // of the plain video element, without using HLS.js.
                //
                // Note: it would be more normal to wait on the 'canplay' event below however
                // on Safari (where you are most likely to find built-in HLS support) the
                // video.src URL must be on the user-driven white-list before a 'canplay'
                // event will be emitted; the last video event that can be reliably
            // listened-for when the URL is not on the white-list is 'loadedmetadata'.
            else if (this.playerInstance .canPlayType('application/vnd.apple.mpegurl')) {
              console.log("Probably Safari");
              this.playerInstance .src = (props.videoId ? props.videoId : props.channelId);
            }
            } catch (e){
              console.error(e);
              this.onStartError('Failed to start HLS stream.');
            }
          //
          //
          //   this.playerInstance = videojs('horst', {
          //     height: '100%',
          //     width: '100%',
          //     src: props.videoId,
          //     events: {
          //       onReady: onReady
          //     }}, function onPlayerReady() { onReady });
        }, 300);
        break;

      case 'youtube':
        setTimeout(() => {
          try {
            this.playerInstance = new window.YT.Player(playerContainerId, {
              height: '100%',
              width: '100%',
              videoId: props.videoId,
              events: {
                onReady: onReady
              }
            });
          } catch (e){
            console.error(e);
            this.onStartError('Failed to start youtube stream.');
          }
        }, 300);
        break;

      default:
        setTimeout(() => {
          try {
            this.playerInstance = new window.Twitch.Player(playerContainerId, {
              width: '100%',
              height: '100%',
              channel: props.channelId,
              theme: 'dark'
            });
            this.playerInstance.addEventListener(window.Twitch.Player.READY, onReady);
            setTimeout(onReady, 2000);

          } catch(e){
            console.error(e);
            this.onStartError('Failed to start twitch stream.');
          }
        }, 0);
      }
  }

  toolbarIcon(type){
    const baseToolbarStyle = {
      fontSize: '1em',
      color: theme.colors.white
    };
    const toolbarIcons = {
      youtube: (
        <YoutubePlayerIcon
          style={ Object.assign({},theme.branding.youtube, baseToolbarStyle) }
        />
      ),
      twitch: (
        <TwitchIcon
          style={ Object.assign({}, theme.branding.twitch, baseToolbarStyle) }
        />
      )
    };
    return toolbarIcons[type] || <DefaultToolbarIcon />;
  }

  handleDelete = () => {
    this.props.onDeleteWidget(this.props.i);
  }

  handleChangeChannel = () => {
    this.props.onUpdateWidget(this.props.i, {
      type: '',
      playerId: '',
      channelId: ''
    });
  }

  handleChannelInputChanged = (channelInput, streamType = "twitch") => {
    const { i, type } = this.props;
    // Normalize inputs into onUpdateWidget which requires a format of <id>,<data>
    this.props.onUpdateWidget(this.props.i, {
      type: streamType,
      playerId: channelInput,
      channelId: channelInput
    });
  }

  playerContainerId = () => `${ this.props.playerId }_${ this.props.i }`

  componentDidMount(){
    if(this.props.playerId){
      this.setState({ isReady: false }, this.startStream.bind(this, this.props));
    } else {
      console.warn('No playerId was provided for the container');
    }
  }

  componentWillReceiveProps(newProps){
    // Start up the stream if it was changed to a different id
    if(newProps.playerId !== this.props.playerId){
      this.setState({ isReady: false }, this.startStream.bind(this, newProps));
    }
  }

  render(){
    const { i, style, type, playerId } = this.props;
    const styles = baseStyles(style);
    const playerContainerId = this.playerContainerId();
    return (
      <div
        id={ `stream_widget_${i}` }
        className="stream-widget-component"
        style={ styles.widget__container }
      >
        <WidgetToolbar
          icon={ this.toolbarIcon(type) }
          style={ styles.widget__toolbar }
          onClose={ this.props.onDeleteWidget && this.handleDelete }
          onChange={ this.props.onUpdateWidget && this.props.handleChangeChannel }
        />
        {
          playerId ?
            <div
              id={ playerContainerId }
              ref={ (el) => { this.playerInstanceEl = el; }}
              className="stream-container"
              style={ styles.stream__view }
            />
            :
            <StreamDropZone
              id={ i }
              onLoad={ () => this.setState({ isReady: true }) }
              onDrop={ this.props.onUpdateWidget }
              onChannelSelected={ this.handleChannelInputChanged }
            />
        }
        <div
          className="moving-container"
          style={ styles.moving__container }
        >
          { type ? `${type.toUpperCase()} - ${playerId}` : 'Blank Stream' }
        </div>
      </div>
    );
  }
}

StreamWidget.propTypes = {
  i: PropTypes.string.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  w: PropTypes.number.isRequired,
  h: PropTypes.number.isRequired,
  onUpdateWidget: PropTypes.func.isRequired,
  style: PropTypes.object
};

export default StreamWidget;
