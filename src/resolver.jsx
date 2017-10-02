import React, { Component } from 'react';
import PropTypes from 'prop-types';

import mh from 'multi-hash';
import Dijix from 'dijix';

const dijix = new Dijix();

export default class Resolver extends Component {
  static propTypes = {
    ipfsHash: PropTypes.string,
    hexHash: PropTypes.string,
    renderResolved: PropTypes.func.isRequired,
    renderLoading: PropTypes.func,
  }
  static defaultProps = {
    ipfsHash: undefined,
    hexHash: undefined,
    renderLoading: undefined,
  }
  constructor(props) {
    super(props);
    this.state = { loading: true };
  }
  componentDidMount() {
    const { ipfsHash, hexHash } = this.props;
    const hash = ipfsHash || this.decodeHash(hexHash);
    dijix.fetch(hash).then((dijixObject) => {
      this.setState({ dijixObject, loading: false });
    });
  }
  decodeHash(hexHash) {
    const parsedHash = hexHash.indexOf('0x') === 0 ? hexHash.substr(2) : hexHash;
    return mh.encode(parsedHash);
  }
  render() {
    const { loading, dijixObject } = this.state;
    if (loading) { return this.props.renderLoading || null; }
    return this.props.renderResolved(dijixObject);
  }
}
