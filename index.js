import React from "react";
import PropTypes from "prop-types";

class ClipboardWrapper extends React.Component {
  static propTypes = {
    options: function(props, propName, componentName) {
      const options = props[propName];
      if ((options && typeof options !== "object") || Array.isArray(options)) {
        return new Error(
          `Invalid props '${propName}' supplied to '${componentName}'. ` +
            `'${propName}' is not an object.`
        );
      }

      if (props["option-text"] !== undefined) {
        const optionText = props["option-text"];
        if (typeof optionText !== "function") {
          return new Error(
            `Invalid props 'option-text' supplied to '${componentName}'. ` +
              `'option-text' is not a function.`
          );
        }
      }
    },
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.arrayOf(PropTypes.element),
      PropTypes.string,
      PropTypes.number,
      PropTypes.object,
    ]),
  };

  static defaultProps = {
    onClick: function() {},
  };

  /* Returns a object with all props that fulfill a certain naming pattern
   *
   * @param {RegExp} regexp - Regular expression representing which pattern
   *                          you'll be searching for.
   * @param {Boolean} remove - Determines if the regular expression should be
   *                           removed when transmitting the key from the props
   *                           to the new object.
   *
   * e.g:
   *
   * // Considering:
   * // this.props = {option-foo: 1, onBar: 2, data-foobar: 3 data-baz: 4};
   *
   * // *RegExps not using // so that this comment doesn't break up
   * this.propsWith(option-*, true); // returns {foo: 1}
   * this.propsWith(on*, true); // returns {Bar: 2}
   * this.propsWith(data-*); // returns {data-foobar: 1, data-baz: 4}
   */
  propsWith(regexp, remove = false) {
    const object = {};

    Object.keys(this.props).forEach(function(key) {
      if (key.search(regexp) !== -1) {
        const objectKey = remove ? key.replace(regexp, "") : key;
        object[objectKey] = this.props[key];
      }
    }, this);

    return object;
  }

  componentWillUnmount() {
    this.clipboard && this.clipboard.destroy();
  }

  componentDidMount() {
    // Support old API by trying to assign this.props.options first;
    const options = this.props.options || this.propsWith(/^option-/, true);
    const element = React.version.match(/0\.13(.*)/)
      ? this.refs.element.getDOMNode()
      : this.element;
    const Clipboard = require("clipboard");
    this.clipboard = new Clipboard(element, options);

    const callbacks = this.propsWith(/^on/, true);
    Object.keys(callbacks).forEach(function(callback) {
      this.clipboard.on(callback.toLowerCase(), this.props["on" + callback]);
    }, this);
  }

  render() {
    return (
      <div
        ref={element => {
          this.element = element;
        }}
      >
        {this.children}
      </div>
    );
  }
}

export default ClipboardWrapper;
