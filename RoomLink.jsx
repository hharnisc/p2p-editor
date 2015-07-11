"use strict";

var React = require("react");

module.exports = React.createClass({
  handleClick: function () {
    // select the room link text when clicked
    var range = document.createRange();
    range.selectNode(React.findDOMNode(this.refs.roomLink));
    window.getSelection().addRange(range);
  },

  render: function() {
    var divStyle = {
      height: "100%",
      padding: "20px"
    };
    var titleStyle = {
      marginBottom: "10px",
      fontSize: "24px"
    };
    var roomStyle = {
      fontSize: "16px"
    };
    var iconStyle = {
      marginLeft: "10px",
      verticalAlign: "bottom",
      fontSize: "18px"
    };

    var room = [
      location.protocol, "//", location.host, "/?room=", this.props.roomId
    ].join("");
    return (
      <div style={divStyle}>
        <div style={titleStyle}>P2P Editing</div>
        <span ref="roomLink" style={roomStyle} onClick={this.handleClick}>
          { room }
        </span>
        <i className="material-icons" style={iconStyle}>open_in_new</i>
      </div>
    );
  }
});
