"use strict";

var React = require("react");

module.exports = React.createClass({
  render: function() {
    var wrapperStyle = {
      marginTop: "20px"
    };
    var titleStyle = {
      fontSize: "20px",
      fontWeight: "500"
    };
    var clientListStyle = {
      fontSize: "13px",
      listStyleType: "none",
      paddingLeft: "0"
    };
    var iconStyle = {
      marginRight: "10px",
      verticalAlign: "bottom",
      fontSize: "16px"
    };
    return (
      <div style={wrapperStyle}>
        <div style={titleStyle}>Peers ({this.props.knownClients.length})</div>
        <ul style={clientListStyle}>
          {
            this.props.knownClients.map(function(client) {
              return (
                <li key={client}>
                  <i className="material-icons" style={iconStyle}>mood</i>
                  {client}
                </li>
              );
            })
          }
        </ul>
      </div>
    );
  }
});
