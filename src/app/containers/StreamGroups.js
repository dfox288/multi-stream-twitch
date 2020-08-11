import React from 'react';
import uuid from 'uuidv4';
import {addWidget, clearLayout} from '../../common/streams/actions';
import {connect} from 'react-redux';

class StreamGroups extends React.Component {

  state = {
    streams: [],
    newStreams: [],
  };

  constructor(props) {
    super(props);

  }

  componentDidMount() {
    this.updateStreams = this.updateStreams.bind(this);
    setInterval(() => {
      this.updateStreams();
    }, 30000);
    fetch('/streams.json').then(resp => resp.json()).then((data) => {
      this.setState({
        streams: data,
      });
    });
  }

  updateStreams() {
    let newStreams = [];
    fetch('/streams.json').then(resp => resp.json()).then((data) => {
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
      console.log('streams', data);
      this.setState({
        streams: data,
        newStreams: newStreams,
      });
    });
  }

  render() {
    const {onSelect, showWith} = this.props;
    const streams = this.state.streams;
    const newStreams = this.state.newStreams;
    return (
        <div className={'streamGroups'}>
          <ul>
            {
              streams.map((group, index) => (
                  <li key={group.name}>
                    <a href={'#'} onClick={(event) => onSelect(group)}>
                      {group.name}
                    </a>
                    {showWith &&
                    <div className={'streams-with'}>
                      <ul>
                        {
                          group.streams.map((stream, index) => (
                              <li key={stream.id}>
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
                <li key={stream.id}>
                  <a href={'#'} onClick={(event) => onSelectOne(stream)}>
                    {stream.id}
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
      });
    }
  },
});

export default connect(undefined, mapDispatch)(StreamGroups);
