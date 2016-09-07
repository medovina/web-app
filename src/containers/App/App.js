import React, { Component } from 'react';
import { connect } from 'react-redux';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { fetchUserIfNeeded } from '../../redux/modules/users';

class App extends Component {

  componentWillMount() {
    App.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.loggedInUserId !== newProps.loggedInUserId) {
      App.loadData(newProps);
    }
  }

  static loadData = ({
    loggedInUserId,
    loadUser
  }) => {
    if (loggedInUserId !== null) {
      loadUser(loggedInUserId);
    }
  };

  render() {
    return this.props.children;
  }

}

export default connect(
  state => ({
    loggedInUserId: loggedInUserIdSelector(state)
  }),
  dispatch => ({
    loadUser: (userId) => dispatch(fetchUserIfNeeded(userId))
  })
)(App);
