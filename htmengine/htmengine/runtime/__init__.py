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
"""
==================
HTM Engine Runtime
==================

::

    metric_collector => anomaly_service => application subscribers
          /\  ||                ||
          ||  ||                ||
          ||  ||                \/
          ||   \\=======> `metric_data`
          ||
          \/
    metric_streamer <=> [Model Swapper]

metric_collector
----------------

The module `metric_collector` will collect metric data from all data sources
using the appropriate [data adapter](../adapters) at the metric scheduled
interval.  Once the model processes the newly streamed data the results are
pushed to the `htmengine.model.data` exchange and stored in the `metric_data`
database table.

metric_streamer
---------------

The module `metric_streamer` will stream to the model associated with the
source metric.

anomaly_service
---------------

The module `anomaly_service` runs anomaly likelihood calculations and
broadcasts final model results to downstream services, such as
`notification_service`

"""
