"use strict";

var React = require("react");
var ReactQuill = require("react-quill");

module.exports = React.createClass({
  insertText: function (index, text, source) {
    this.refs.quill.editor.insertText(index, text, source);
  },

  deleteText: function (index, numChars, source) {
    this.refs.quill.editor.deleteText(index, index + numChars, source);
  },

  setText: function (text) {
    this.refs.quill.editor.setText(text);
  },

  handleChange: function (text, delta, source) {
    // only handle changes from user
    if (source !== "user"){
      return;
    }
    var index, type, value;
    if(delta.ops.length === 1) {
      index = 0;
      type = Object.keys(delta.ops[0])[0];
      value = delta.ops[0][type];
    } else {
      index = delta.ops[0].retain;
      type = Object.keys(delta.ops[1])[0];
      value = delta.ops[1][type];
    }
    if (type === "insert") {
      this.props.otp2pModel.insert(index, value);
    } else {
      this.props.otp2pModel.delete(index, value);
    }
  },

  focus: function () {
    this.refs.quill.editor.focus();
  },

  componentDidMount: function () {
    // this should be in focus when page first loads
    this.focus();
  },

  render: function(){
    var divStyle = {
      padding: "20px",
      fontSize: "13px",
      fontWeight: "500"
    };
    return (
      <div style={divStyle} onClick={this.focus}>
        <ReactQuill ref="quill" toolbar={[]} onChange={this.handleChange} />
      </div>
    );
  }
});
