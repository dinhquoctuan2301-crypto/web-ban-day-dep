import React, { Component } from 'react';
import MyContext from './MyContext';

class MyProvider extends Component {
  constructor(props) {
    super(props);
    const token = localStorage.getItem('adminToken') || '';
    const username = localStorage.getItem('adminUsername') || '';
    this.state = { // global state
      // variables
      token: token,
      username: username,
      // functions
      setToken: this.setToken,
      setUsername: this.setUsername
    };
  }
  setToken = (value) => {
    if (value) {
      localStorage.setItem('adminToken', value);
    } else {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUsername');
    }
    this.setState({ token: value });
  }
  setUsername = (value) => {
    if (value) {
      localStorage.setItem('adminUsername', value);
    }
    this.setState({ username: value });
  }
  render() {
    return (
      <MyContext.Provider value={this.state}>
        {this.props.children}
      </MyContext.Provider>
    );
  }
}
export default MyProvider;