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

    HTM-ITUI.RegisterView = Backbone.View.extend({

        template: _.template($('#register-tmpl').html()),

        msgs: HTM-ITUI.msgs('register-tmpl'),
        site: HTM-ITUI.msgs('site'),

        events: {
            'change #agree' : 'handleAgreeToggle',
            'click #back'   : 'handleBack',
            'click #next'   : 'handleNext'
        },

        initialize: function(options) {
            var me = this,
                settings = {};

            me.api = options.api;
            me.checked = true;

            HTM-ITUI.utils.title(me.msgs.title);

            // setup? deactive header logo link
            if(HTM-ITUI.utils.isSetupFlow()) {
                $('.navbar-brand').attr('href', '#');
            }

            me.api.getSettings(
                me.api.CONST.SETTINGS.SECTIONS.USERTRACK,
                function(error, settings) {
                    if(error) return HTM-ITUI.utils.modalError(error);

                    if(
                        (! HTM-ITUI.utils.isAuthorized()) &&
                        settings &&
                        ('optin' in settings) &&
                        (settings.optin !== '')
                    ) {
                        // setup already => auth page to login
                        HTM-ITUI.utils.go(me.site.paths.auth);
                        return;
                    }

                    switch(settings.optin) {
                        case '':
                            // console.log('user has not chosen, default to opt-in');
                            me.checked = true;
                            break;
                        case 'true':
                            // console.log('user has opted in');
                            me.checked = true;
                            break;
                        case 'false':
                            // console.log('user has opted out');
                            me.checked = false;
                            break;
                        default:
                            // console.log('some unexpected state');
                            me.checked = false;
                    }
                    me.render(settings);
                }
            );
        },

        render: function(settings) {
            var me = this,
                step = 1,
                data = {
                    baseUrl: NTA.baseUrl,
                    msgs: me.msgs,
                    site: me.site,
                    isSetup: HTM-ITUI.utils.isSetupFlow(),
                    button: {
                        back: HTM-ITUI.utils.isSetupFlow() ?
                            me.site.buttons.back : me.site.buttons.cancel,
                        next: HTM-ITUI.utils.isSetupFlow() ?
                            me.site.buttons.next : me.site.buttons.save
                    },
                    values: settings,
                    checked: me.checked,
                    step: step
                },
                setupProgressBar;

            me.$el.html(me.template(data));

            if(HTM-ITUI.utils.isSetupFlow()) {
                setupProgressBar = HTM-ITUI.utils.getSetupProgressBar(
                    step, $('#progress-bar-container'));
            }

            // if no data on load, give focus to first field
            $name = $('#name');
            if(! $name.val()) {
                $name.focus();
            }

            me.trigger('view-ready');
            return me;
        },

        handleAgreeToggle: function(event) {
            var me = this,
                $checkbox = me.$el.find('#agree'),
                agreed = $checkbox.is(':checked'),
                $next = $("#next");

            if (agreed) {
                $next.removeAttr("disabled");
            }
            else {
                $next.attr("disabled", "disabled");
            }
        },

        handleBack: function(event) {
            var me = this,
                destination = HTM-ITUI.utils.isSetupFlow() ?
                    me.site.paths.welcome + window.location.search :
                    me.site.paths.manage;

            event.stopPropagation();
            event.preventDefault();

            HTM-ITUI.utils.go(destination);
        },

        handleNext: function(event) {
            var me = this,
                $checkbox = me.$el.find('#usage'),
                optIn = $checkbox.is(':checked') ? 'true' : 'false',
                USERTRACK = me.api.CONST.SETTINGS.USERTRACK,
                settings = {},
                destination = HTM-ITUI.utils.isSetupFlow() ?
                    me.site.paths.auth + window.location.search :
                    me.site.paths.manage,
                name = $('#name').val(),
                company = $('#company').val(),
                email = $('#email').val();

            HTM-ITUI.utils.throb.start(me.site.state.save);

            event.stopPropagation();
            event.preventDefault();

            settings[USERTRACK.NAME] = name;
            settings[USERTRACK.COMPANY] = company;
            settings[USERTRACK.EMAIL] = email;
            settings[USERTRACK.OPTIN] = optIn;

            // save user registration info
            me.api.putSettings(
                settings,
                me.api.CONST.SETTINGS.SECTIONS.USERTRACK,
                function(error) {
                    if(error) return HTM-ITUI.utils.modalError(error);

                    // send a few extras to wufoo
                    settings['edition'] = HTM-ITUI.product.edition;
                    settings['version'] = HTM-ITUI.product.version;
                    settings['build'] = HTM-ITUI.product.build;

                    // remove optin
                    delete settings[USERTRACK.OPTIN];

                    me.api.sendWufooForm(settings, function(error) {
                        if(error) return HTM-ITUI.utils.modalError(error);
                        HTM-ITUI.utils.go(destination);
                    });
                }
            );
        }

    });

})();
