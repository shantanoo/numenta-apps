/* ----------------------------------------------------------------------
 * Numenta Platform for Intelligent Computing (NuPIC)
 * Copyright (C) 2015, Numenta, Inc.  Unless you have purchased from
 * Numenta, Inc. a separate commercial license for this software code, the
 * following terms and conditions apply:
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero Public License version 3 as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero Public License for more details.
 *
 * You should have received a copy of the GNU Affero Public License
 * along with this program.  If not, see http://www.gnu.org/licenses.
 *
 * http://numenta.org/licenses/
 * ---------------------------------------------------------------------- */

(function() {

    var _viewName = 'embed-charts-sort';

    /**
     * Backbone.View() - Embed: Charts > Sort
     */
    GROKUI.EmbedChartsSortView = Backbone.View.extend({

        // Backbone.View properties

        template: _.template($('#' + _viewName + '-tmpl').html()),

        events: {
        },

        // Custom properties

        msgs: GROKUI.msgs(_viewName + '-tmpl'),
        site: GROKUI.msgs('site'),

        // Backbone.View methods

        /**
         * Backbone.View.initalize()
         */
        initialize: function(options) {
            this.api = options.api;
        },

        /**
         * Backbone.View.render()
         */
        render: function() {
            var data = {
                    baseUrl: NTA.baseUrl,
                    msgs: this.msgs,
                    site: this.site
                };

            this.$el.html(this.template(data));

            this.trigger('view-ready');
            return this;
        }

        // Custom methods

    });

})();
