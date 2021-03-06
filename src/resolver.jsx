import React, { Component } from 'react';
import PropTypes from 'prop-types';

import mh from 'multi-hash';
import Dijix from 'dijix';
import DijixImage from 'dijix-image';
import DijixAttestation from 'dijix-attestation';

const initialState = {
  dijixObject: {
    data: {},
  },
  loading: true,
};
const emptyHash = '0x0000000000000000000000000000000000000000000000000000000000000000';

export default class Resolver extends Component {
  static propTypes = {
    ipfsHash: PropTypes.string,
    hexHash: PropTypes.string,
    renderResolved: PropTypes.func.isRequired,
    renderLoading: PropTypes.func,
    ipfsEndpoint: PropTypes.string,
    httpEndpoint: PropTypes.string,
  }
  static defaultProps = {
    ipfsHash: undefined,
    hexHash: undefined,
    renderLoading: undefined,
    ipfsEndpoint: 'https://ipfs.infura.io:5001',
    httpEndpoint: 'https://ipfs.infura.io/ipfs',
  }
  constructor(props) {
    super(props);
    this.state = { ...initialState };
  }
  componentDidMount() {
    const { ipfsHash, hexHash, ipfsEndpoint, httpEndpoint } = this.props;
    this.dijix = new Dijix({
      ipfsEndpoint,
      httpEndpoint,
      types: [
        new DijixAttestation(),
        new DijixImage(),
      ],
    });
    const hash = ipfsHash || this.decodeHash(hexHash);
    this.dijix.fetch(hash).then((dijixObject) => {
      this.setState({ dijixObject, loading: false });
    });
  }
  componentWillReceiveProps(nextProps) {
    const { ipfsHash, hexHash } = nextProps;
    if (this.props.hexHash !== hexHash || this.props.ipfsHash !== ipfsHash) {
      this.setState({ loading: true });

      if (ipfsHash && hexHash === emptyHash) {
        this.setState({ ...initialState, loading: false });
        return;
      }

      const hash = ipfsHash || this.decodeHash(hexHash);
      this.dijix.fetch(hash).then((dijixObject) => {
        this.setState({ dijixObject, loading: false });
      });
    }
  }
  decodeHash(hexHash) {
    const parsedHash = hexHash.indexOf('0x') === 0 ? hexHash.substr(2) : hexHash;
    return mh.encode(parsedHash);
  }
  render() {
    const { loading, dijixObject } = this.state;
    const { renderLoading, renderResolved } = this.props;
    if (loading) { return renderLoading ? renderLoading() : null; }
    return renderResolved(dijixObject);
  }
}
