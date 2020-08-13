import React from 'react';
import uuid from 'uuidv4';
import {addWidget, clearLayout} from '../../common/streams/actions';
import {connect} from 'react-redux';
import MdNewReleases from 'react-icons/lib/md/new-releases';

class StreamGroups extends React.Component {

  static UPDATE_INTERVAL = 30000;
  static JSON_URL = 'https://social.novoque.eu/streams.json';

  state = {
    streams: [],
    newStreams: [],
    intervalId: null,
  };

  constructor(props) {
    super(props);
  }

  componentDidMount = () => {
    this.updateStreams = this.updateStreams.bind(this);
    const intervalId = setInterval(this.updateStreams, StreamGroups.UPDATE_INTERVAL);
    fetch(StreamGroups.JSON_URL).then(resp => resp.json()).then((data) => {
      this.setState({
        streams: data,
      });
    }).catch((err) => {
      console.log("got invalid json or something, ignoring this", err);
    });
    this.setState({intervalId});
  };

  componentWillUnmount = () => {
    // use intervalId from the state to clear the interval
    clearInterval(this.state.intervalId);
  };

  updateStreams = () => {
    let newStreams = [];
    fetch(StreamGroups.JSON_URL).then(resp => resp.json()).then((data) => {
      if (Array.isArray(data)) {
        data.forEach(group => {
          if (Array.isArray(group.streams)) {
            group.streams.forEach(s => {
              s.new = true;
              if (this.state.streams.length > 0) {
                this.state.streams.forEach(group => {
                  group.streams.forEach(groupStream => {
                    if (groupStream.id === s.id) {
                      s.new = false;
                    }
                  });
                });
              }
              if (s.new) {
                newStreams.push(s);
              }
            });
          }
        });
      }
      this.setState({
        streams: data,
        newStreams: newStreams,
      });
    }).catch((err) => {
      console.log("got invalid json or something, ignoring this", err);
    });
  };

  render() {
    const {onSelect, showWith, onSelectOne} = this.props;
    const streams = this.state.streams;
    const newStreams = this.state.newStreams;
    return (
        <div className={'streamGroups'}>
          <ul>
            {
              streams.map((group, index) => (
                  <li key={group.name + '_' + index}>
                    <a href={'#'} onClick={(event) => onSelect(group)}>
                      {group.name}
                    </a>
                    {showWith &&
                    <div className={'streams-with'}>
                      <ul>
                        {
                          group.streams.map((stream, innerIndex) => (
                              <li key={stream.id + '_' + innerIndex}>
                                {stream.title || stream.id} - {stream.type}
                              </li>
                          ))
                        }
                      </ul>
                    </div>
                    }
                  </li>
              ))
            }
            {newStreams.length > 0 &&
            newStreams.map((stream, index) => (
                <li key={stream.id + '_' + index} className={"new"}>
                  <a href={'#'} onClick={(event) => onSelectOne(stream)}>
                    <MdNewReleases/> {stream.id} <MdNewReleases/>
                  </a>
                </li>
            ))
            }
          </ul>
        </div>
    );
  }
}

const mapDispatch = (dispatch) => ({
  onSelectOne: (stream) => {
    const id = stream.id;
    // TODO: Remove hardcodedness for `onSelect` when we implement a tabbed
    // interface for other streams apart from twitch
    const type = stream.type;
    const dynamicAttribute = type === 'twitch' ? 'channelId' : 'videoId';
    const generatedId = uuid();
    dispatch(addWidget(generatedId, {
      i: generatedId,
      playerId: id,
      [dynamicAttribute]: id,
      muted: true,
      autoplay: true,
      type,
    }));
  },
  onSelect: (group) => {
    if (Array.isArray(group.streams)) {
      dispatch(clearLayout());
      group.streams.forEach((stream) => {
        const id = stream.id;
        const type = stream.type;
        const dynamicAttribute = type === 'twitch' ? 'channelId' : 'videoId';
        const generatedId = uuid();
        dispatch(addWidget(generatedId, {
          i: generatedId,
          playerId: id,
          [dynamicAttribute]: id,
          muted: true,
          autoplay: true,
          type,
        }));
      });
    }
  },
});

export default connect(undefined, mapDispatch)(StreamGroups);
