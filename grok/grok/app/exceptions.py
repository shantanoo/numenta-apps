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
from htmengine.exceptions import (HTMEngineError,
                                  ObjectNotFoundError,
                                  ObjectAlreadyExistsBase,
                                  MetricAlreadyExists,
                                  MetricAlreadyMonitored,
                                  MetricNotSupportedError,
                                  MetricNotActiveError,
                                  MetricStatisticsNotReadyError,
                                  MetricStatusChangedError,
                                  DuplicateRecordError)



class GrokError(HTMEngineError):
  pass



class AuthFailure(GrokError):
  """AWS keys can't be authenticated by AWS."""
  pass



class AWSPermissionsError(GrokError):
  """AWS keys don't have necessary permissions."""
  pass



class QuotaError(GrokError):
  """ Model Instance quota exceeded """
  pass



class TooManyInstancesError(GrokError):
  """ Too many instances selected. Exceeds a MAX_INSTANCES quota """
  pass



class MetricThrottleError(GrokError):
  """ Metric adapter received a throttle request from data source (e.g.,
  from AWS CloudWatch)
  """
  pass



class InvalidAWSRegionName(GrokError):
  """ Invalid AWS Region name given """
  pass

