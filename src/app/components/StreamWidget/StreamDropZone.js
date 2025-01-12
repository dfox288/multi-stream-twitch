import React from 'react';
import CheckIcon from 'react-icons/lib/md/check';
import PropTypes from 'prop-types';
import uuid from 'uuidv4';
import theme from '../../theme';

/*
* Returns a component tht handles dragging a link into the frame and passes back
* the stream data configuration.
*
* Currently only supports youtube and twitch.
*/

const styles = {
  stream__configure: {
    height: 'calc(100% - 25px)',
    width: '100%',
    backgroundColor: '#222222'
  },
  configure__inner: {
    height: 'calc(100% - 25px)',
    width: '100%',
    color: theme.colors.white,
    fontFamily: 'Quattrocento Sans, sans-serif',
    overflowY: 'auto'
  },
  configure__error: {
    marginTop: 10,
    fontSize: '2em',
    color: theme.colors.red,
    fontWeight: 500
  },
  padding: {
    padding: 20
  },
  input__container: {
    display: 'inline-flex',
    marginTop: theme.spacing,
    height: 32,
    width: '100%',
    border: '1px solid #333333',
    maxWidth: 300
  },
  manual__input: {
    height: '100%',
    width: 'calc(100% - 50px)',
    padding: '0 10px',
    border: 'none',
    outline: 'none'
  },
  button: {
    cursor: 'pointer',
    height: '100%',
    width: 50,
    backgroundColor: theme.colors.primary,
    border: 'none'
  },
  icon: {
    fontSize: '1.2em',
    color: theme.colors.white
  }
};

class StreamDropZone extends React.Component {

  constructor(props){
    super(props);
    this.dropzoneInstance = undefined;
    this.regex = {
      youtube: /https:\/\/www.(youtube).com\/.+v=(.+)/ig,
      youtube_embed: /https:\/\/www.(youtube).com\/embed\/(.+)/ig,
      youtube_short: /https:\/\/(youtu).be\/(.+)/ig,
      youtube_studio: /https:\/\/studio.(youtube).com\/video\/(.+)\/livestreaming/ig,
      twitch: /https:\/\/www.(twitch).tv\/(.+)/ig,
      hls: /(.+)\.m3u8/ig
    };
    this.configurationHelp = (
      'Enter a Twitch, YouTube or HLS stream URL to add a stream to your local configuration:'
    );
    this.state = {
      dropzoneError: undefined,
      channelInput: props.channelInput || ''
    };
  }

  dropzoneId = () => {
    return `dropzone_${this.props.id}`;
  }

  destroyDropzone = () => {
    // Destroy the dropzone instance listeners
    if(this.dropzoneInstance){
      this.dropzoneInstance.removeEventListener('dragover', this.handleDragOver);
      this.dropzoneInstance.removeEventListener('drop', this.handleDrop);
    }
  }

  handleDragOver(e){
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }

  extractedUrlObject = (droppedUrl) => {
    // TODO: make generic when we have more url types that are valid to drop
    let youtubeMatch = this.regex.youtube.exec(droppedUrl);
    if(!youtubeMatch) youtubeMatch = this.regex.youtube_embed.exec((droppedUrl));
    if(!youtubeMatch) youtubeMatch = this.regex.youtube_short.exec((droppedUrl));
    if(!youtubeMatch) youtubeMatch = this.regex.youtube_studio.exec((droppedUrl));
    const twitchMatch = this.regex.twitch.exec(droppedUrl);
    const hlsMatch = this.regex.hls.exec(droppedUrl);
    const matchedOnUrl = twitchMatch || youtubeMatch || hlsMatch;

    console.log(matchedOnUrl);

    // extract out stream type and stream data i.e videoId or channelId
    if(matchedOnUrl){
      let [_, type, playerId] = matchedOnUrl;

      console.log(playerId);

      if(type === "youtu") type = "youtube"; // fix for youtubes short urls...
      let playerTypeReference = type === 'twitch' ? 'channelId' : 'videoId';

      if (type !== 'twitch' && type !== 'youtube') {

        // playerId = 'hls_' + Math.floor(Math.random(0, 1000)*1000)
        playerId = matchedOnUrl[0];
        type = 'hls';
        playerTypeReference = 'videoId';
      }

      console.log(type, playerId, playerTypeReference);

      return [true, {
        type,
        playerId,
        [playerTypeReference]: playerId,
      }];
    }
    return [false, {}];
  }

  handleDrop = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const streamUrlDropped = e.dataTransfer.getData('url');
    const [isValid, urlData] = this.extractedUrlObject(streamUrlDropped);
    if(isValid){
      // Set new widget configuration that was dragged into the panel
      this.setState({ dropzoneError: undefined },
        this.props.onDrop.bind(null, this.props.id, urlData));
    } else {
      console.warn('Invalid URL was dragged into dropzone container.');
      this.setState({
        dropzoneError: new Error(
          `Invalid URL dropped "${streamUrlDropped}". Please try a youtube or twitch stream.`
        )
      });
    }
  }

  setupDropzone = () => {
    this.dropzoneInstance = document.getElementById(this.dropzoneId());
    if(this.dropzoneInstance){
      // Handle when a user drags something overtop the dropzone
      // Maybe validate its some data we can actually deal with
      this.dropzoneInstance.addEventListener('dragover', this.handleDragOver);
      // Configure the widget w/ the proper data i.e update the layout object
      this.dropzoneInstance.addEventListener('drop', this.handleDrop);
    } else {
      console.warn('There was an issue while trying to setup the widgets dropzone container.');
    }
  }

  handleInputChange = (e) => {
    this.setState({ channelInput: e.target.value })
  }

  handleChannelInputSelection = (e) => {
    e.preventDefault();

    let channelId = this.state.channelInput;
    const input = this.extractedUrlObject(this.state.channelInput);
    let streamType = "twitch";
    if(input[0]) {
      const data = input[1];
      streamType = data.type;
      channelId = data.playerId
    }

    if(this.props.onChannelSelected){
      this.props.onChannelSelected(channelId, streamType);
    }
  }

  componentDidMount(){
    /*
    * Allow for external component callback, like in the case of state in the parent
    * depending on knowing the dropzone has initialized e.g, `LoadingIndicator` state
    * is autoset to isReady true in `StreamWidget`
    */
    if(this.props.onLoad){
      this.props.onLoad();
    };
    this.setupDropzone();
  }

  componentWillUnmount(){
    this.destroyDropzone();
  }

  render(){
    const {
      channelInput,
      dropzoneError
    } = this.state;
    return (
      <div
        className="stream-container"
        style={ styles.stream__configure }
      >
        <div
          id={ this.dropzoneId() }
          className="dropzone"
          style={ styles.configure__inner }
        >
          <form onSubmit={ this.handleChannelInputSelection }
            style={ styles.padding }
          >
            <h3>Configure Stream</h3>
            <p>{ this.configurationHelp }</p>
            <div style={ styles.input__container }>
              <input
                style={ styles.manual__input }
                value={ channelInput }
                onChange={ this.handleInputChange }
                placeholder="Enter URL"
              />
              <button
                type="submit"
                style={ styles.button }
              >
                <CheckIcon style={ styles.icon } />
              </button>
            </div>
            {
              dropzoneError &&
                <div style={ styles.configure__error }>
                  { dropzoneError.message }
                </div>
            }
          </form>
        </div>
      </div>
    );
  }
}

StreamDropZone.propTypes = {
  id: PropTypes.string.isRequired,
  onChannelSelected: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
  onLoad: PropTypes.func
};

export default StreamDropZone;
