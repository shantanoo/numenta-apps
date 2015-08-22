# ----------------------------------------------------------------------
# Numenta Platform for Intelligent Computing (NuPIC)
# Copyright (C) 2015, Numenta, Inc.  Unless you have purchased from
# Numenta, Inc. a separate commercial license for this software code, the
# following terms and conditions apply:
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero Public License version 3 as
# published by the Free Software Foundation.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
# See the GNU Affero Public License for more details.
#
# You should have received a copy of the GNU Affero Public License
# along with this program.  If not, see http://www.gnu.org/licenses.
#
# http://numenta.org/licenses/
# ----------------------------------------------------------------------
# Formula: grok-plumbing.supervisor-tooling

# Install our customized supervisord tooling for running Grok. We can't use
# the standard supervisord init script because:
# * We want to run as ec2-user, not root
# * We need a specific supervisord configuration that is in grok/conf, not
#   the generic one installed by CentOS

# Put in our own supervisord init script
grokservices-init-script:
  file.managed:
    - name: /etc/init.d/grokservices
    - source: salt://grok-plumbing/files/supervisor-tooling/grokservices.initd
    - user: root
    - group: root
    - mode: 0755
    - require:
      - file: firstboot-helper
      - file: firstboot-root-helper
      - pkg: nginx

# We need grok started as ec2-user. Grokservices drops privilege to ec2-user,
# then runs supervisord-helper to actually start Grok.
supervisord-helper:
  file.managed:
    - name: /opt/numenta/supervisord-helper
    - source: salt://grok-plumbing/files/supervisor-tooling/supervisord-helper
    - user: root
    - group: root
    - mode: 0755
    - require:
      - pip: anaconda-supervisor
      - pkg: nginx

# Disable the standard-issue supervisord init script since we use our own.
supervisord:
  service.disabled:
    - enabled: False
    - only_if:
      - cmd: test -f /etc/init.d/supervisord

# Make sure our grokservices init script is set to run at boot
grokservices:
  service.enabled:
    - require:
      - file: /usr/local/sbin/lockrun
      - file: firstboot-helper
      - file: firstboot-root-helper
      - file: grok-preload-init-script
      - file: grokservices-init-script
      - file: set-mysql-root-password
      - file: set-rabbitmq-root-password

# Log rabbitmq status to syslog for debuggery
rabbitmq-status-cronjob:
  cron.present:
    - name: lockrun --lockfile=/var/lock/rabbit-status.lock -- rabbitmqctl status 2>&1 | logger -t taurus-rabbit
    - identifier: rabbitmq-status-cronjob
    - user: root
    - hour: "*"
    - minute: "*/5"
    - require:
      - file: /usr/local/sbin/lockrun
      - pkg: rabbitmq-server

# Helpers needed by grokservices init script

firstboot-root-helper:
  file.managed:
    - name: /usr/local/sbin/firstboot-root.sh
    - source: salt://grok-plumbing/files/supervisor-tooling/firstboot-root.sh
    - user: root
    - group: root
    - mode: 0755
    - require:
      - file: set-mysql-root-password
      - file: set-rabbitmq-root-password

firstboot-helper:
  file.managed:
    - name: /usr/local/sbin/firstboot.sh
    - source: salt://grok-plumbing/files/supervisor-tooling/firstboot.sh
    - user: root
    - group: root
    - mode: 0755
    - require:
      - file: set-mysql-root-password
      - file: set-rabbitmq-root-password

# Password helpers
set-mysql-root-password:
  file.managed:
    - name: /usr/local/sbin/set-mysql-root-password
    - source: salt://grok-plumbing/files/supervisor-tooling/set-mysql-root-password
    - user: root
    - group: root
    - mode: 0755

set-rabbitmq-root-password:
  file.managed:
    - name: /usr/local/sbin/set-rabbitmq-root-password
    - source: salt://grok-plumbing/files/supervisor-tooling/set-rabbitmq-root-password
    - user: root
    - group: root
    - mode: 0755
