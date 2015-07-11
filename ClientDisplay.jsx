"use strict";

var React = require("react");

module.exports = React.createClass({
  render: function() {
    var titleStyle = {
      fontSize: "20px",
      fontWeight: "500"
    };
    var clientStyle = {
      fontSize: "13px",
      paddingTop: "5px"
    };
    var iconStyle = {
      marginRight: "10px",
      verticalAlign: "bottom",
      fontSize: "16px"
    };
    return (
      <div>
        <div style={titleStyle}>You</div>
        <i className="material-icons" style={iconStyle}>person</i>
        <span style={clientStyle}>{this.props.clientId}</span>
      </div>
    );
  }
});
