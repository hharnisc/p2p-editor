"use strict";

var React = require("react");
var OTP2PModel = require("ot-p2p-model").OTP2PModel;
var TextBox = require("./TextBox");
var RoomLink = require("./RoomLink");
var ClientDisplay = require("./ClientDisplay");
var KnownClientDisplay = require("./KnownClientDisplay");

var P2P = require("socket.io-p2p");
var io = require("socket.io-client");
var queryString = require("query-string");


var Main = React.createClass({
  getDefaultProps: function () {
    // socket.io-p2p-server hosted locally
    var socket = io("localhost:3030");
    return {
      otp2pModel: new OTP2PModel(),
      socket: socket,
      p2p: new P2P({}, socket)
    };
  },

  getInitialState: function () {
    return {
      clientId: null,
      roomId: null,
      knownClients: []
    };
  },

  componentWillUnmount: function () {
    this.props.p2p.disconnect();
  },

  componentWillMount: function () {
    var that = this;
    var model = this.props.otp2pModel;
    var p2p = this.props.p2p;
    var socket = this.props.socket;
    var roomId = queryString.parse(location.search).room;
    if (!!roomId && roomId.endsWith("/")) {
      roomId = roomId.substring(0, roomId.length - 1);
    }

    // update the client id when connected
    // this is always done over the socket connection
    socket.on("connect", function () {
      that.setState({
        clientId: socket.id,
        roomId: roomId ? roomId : socket.id
      });
      if (roomId) {
        socket.emit("join-room", roomId);
      } else {
        socket.emit("create-room", socket.id);
      }
    });

    socket.on("disconnect", function () {
      p2p.disconnect();
    });

    // broadcast model changes
    // these are sent between peers
    model.on("broadcast", function (command) {
      p2p.emit("peer-msg", command);
    });

    p2p.on("ready", function () {
      // all comminication on this channel
      // will be sent to peers with WebRTC
      p2p.usePeerConnection = true;

      // announce yourself
      p2p.emit("peer-obj", {
        peerId: socket.id
      });
      if (!roomId){
        that.sendPeerInit();
      }
    });

    p2p.on("offer", function (data) {
      console.log("offer", data);
    });

    socket.on("numClients", function (data) {
      console.log("numClients", data);
    });

    p2p.on("peer-obj", function (data) {
      console.log("peer-obj", data);
      that.addPeer(data.peerId);
    });

    p2p.on("peer-disconnect", function (data) {
      console.log("peer-disconnect", data);
      that.removePeer(data.peerId);
    });

    p2p.on("peer-msg", function (data) {
      that.routePeerMessage(data);
    });
  },

  addPeer: function(peerId) {
    if (this.state.knownClients.indexOf(peerId) < 0) {
      this.state.knownClients.push(peerId);
      this.setState({knownClients: this.state.knownClients});
    }
  },

  removePeer: function(peerId) {
    var clientIndex = this.state.knownClients.indexOf(peerId);
    if (clientIndex > -1) {
      this.state.knownClients.pop(clientIndex);
      this.setState({knownClients: this.state.knownClients});
    }
  },

  routePeerMessage: function (data) {
    if (data.type === "insert") {
      this.insertText(data);
    } else if (data.type === "delete") {
      this.deleteText(data);
    } else if (data.type === "peer-init") {
      this.peerInit(data);
    }
  },

  insertText: function (command) {
    var viewIndex = this.props.otp2pModel.modelIndexToViewIndex(
      command.index,
      this.props.otp2pModel.typeModel.data
    );
    this.props.otp2pModel.remoteInsert(command.index, command.value);
    this.refs.textBox.insertText(viewIndex, command.value, "remote");
  },

  deleteText: function (command) {
    var viewIndex = this.props.otp2pModel.modelIndexToViewIndex(
      command.index,
      this.props.otp2pModel.typeModel.data
    );

    this.props.otp2pModel.remoteDelete(command.index, command.numChars);
    this.refs.textBox.deleteText(viewIndex, command.numChars, "remote");
  },

  peerInit: function (command) {
    // accept the initialized data
    this.props.otp2pModel.typeModel = command.model;
    this.props.otp2pModel.view = this.props.otp2pModel.modelItemsToView(command.model.data);
    this.refs.textBox.setText(this.props.otp2pModel.view);
  },

  sendPeerInit: function () {
    // transmit initialization data
    this.props.p2p.emit("peer-msg", {
      type: "peer-init",
      model: this.props.otp2pModel.typeModel
    });
  },

  focusTextBox: function () {
    this.refs.textBox.focus();
  },

  render: function () {
    var wrapper = {
      height: "100%",
      display: "flex",
      flexDirection: "column"
    };
    var headerStyle = {
      background: "#3F51B5",
      color: "#FFF",
      boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
      zIndex: "2"
    };
    var toolsWrapper = {
      flex: "2",
      display: "flex"
    };
    var sidebar = {
      flex: "1 1",
      background: "#E8EAF6",
      padding: "20px"
    };
    var textDisplay = {
      flex: "3 1",
      boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
      zIndex: "1"
    };
    return (
      <div style={wrapper}>
        <div style={headerStyle}>
          <RoomLink roomId={this.state.roomId}></RoomLink>
        </div>
        <div style={toolsWrapper}>
          <div style={sidebar}>
            <ClientDisplay clientId={this.state.clientId}></ClientDisplay>
            <KnownClientDisplay knownClients={this.state.knownClients}></KnownClientDisplay>
          </div>
          <div style={textDisplay} onClick={this.focusTextBox}>
            <TextBox ref="textBox" otp2pModel={this.props.otp2pModel}></TextBox>
          </div>
        </div>
      </div>
    );
  }
});

React.render(<Main />, document.getElementById("content"));
