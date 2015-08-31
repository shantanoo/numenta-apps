/* -----------------------------------------------------------------------------
 * Copyright © 2015, Numenta, Inc. Unless you have purchased from
 * Numenta, Inc. a separate commercial license for this software code, the
 * following terms and conditions apply:
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero Public License for
 * more details.
 *
 * You should have received a copy of the GNU Affero Public License along with
 * this program. If not, see http://www.gnu.org/licenses.
 *
 * http://numenta.org/licenses/
 * -------------------------------------------------------------------------- */

'use strict';

import React from 'react';
import Material from 'material-ui';
import SearchStore from '../stores/search';
import SearchQueryAction from '../actions/search-query';

const {
  LeftNav, MenuItem, Styles
} = Material;

const ThemeManager = new Styles.ThemeManager();

class SearchHistoryComponent extends React.Component {

  static childContextTypes = {
    muiTheme: React.PropTypes.object
  };

  static contextTypes = {
    executeAction: React.PropTypes.func,
    getStore: React.PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      history: []
    };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.refs.leftNav.toggle();
  }
  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  }

  getStoreState() {
    return {
      history: this.context.getStore(SearchStore).getHistory()
    };
  }

  componentDidMount() {
    this.context.getStore(SearchStore)
                  .addChangeListener(this._onStoreChange.bind(this));
  }

  componentWillUnmount() {
    this.context.getStore(SearchStore)
                  .removeChangeListener(this._onStoreChange.bind(this));
  }

  _onStoreChange() {
    this.setState(this.getStoreState());
  }

  _getItems() {
    let items = [
      {
        type: MenuItem.Types.SUBHEADER,
        text: 'HISTORY'
      }
    ];
    return items.concat(Array.from(this.state.history, q => {
      return {
        text: q
      };
    }));
  }

  _onChanged(e, key, payload) {
    this.context.executeAction(SearchQueryAction, payload.text);
  }

  render() {
    return (
      <LeftNav docked={false} menuItems={this._getItems()}
        onChange={this._onChanged.bind(this)} ref="leftNav"/>
    );
  }
};

export default SearchHistoryComponent;
