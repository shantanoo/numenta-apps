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
import logging
import hashlib

from htmengine import __version__
from htmengine.HTMEngineExtendedLogger import HTMEngineExtendedLogger



def getLogger(name=None):
  logging.setLoggerClass(logging.Logger)
  return logging.getLogger(name)



def getExtendedLogger(name=None):
  logging.setLoggerClass(HTMEngineExtendedLogger)
  log = logging.getLogger(name)
  log.setLogPrefix(getStandardLogPrefix())
  return log



def getStandardLogPrefix():
  """Returns a base prefix for logging containing the version for the current
  instance of htmengine.
  """
  return 'VER=%s' % __version__



def getMetricLogPrefix(metric):
  """Returns a prefix describing a metric (as defined by sqlalchemy schema)

  :param metric: A sqlalchemy metric object
  :return: Returns a string representation of a metric for logging.
  """
  return "METRICID=%s, METRIC=%s, STATUS=%s, SERVER=%s" % (
                                              getattr(metric, "uid", "N/A"),
                                              getattr(metric, "name", "N/A"),
                                              getattr(metric, "status", "N/A"),
                                              getattr(metric, "server", "N/A"))



def getAutostackLogPrefix(autostack):
  """Returns a prefix describing an autostack (as defined by sqlalchemy schema)

  :param metric: A sqlalchemy autostack object
  :return: Returns a string representation of an autostack for logging.
  """
  return "AUTOSTACKID=%s, AUTOSTACK=%s" % (autostack.uid, autostack.name)



def anonymizeEmail(email):
  """
  Anonymizes an email so it can be recorded in log
  :param email: The email in string form (email@domain.com)
  :returns:      The email with the same domain name but with the name as a
                hash of the email (7328fddefd53de471baeb6e2b764f78a@domain.com)
  """
  (emailName, at, emailDomain) = email.rpartition("@")
  return hashlib.md5(emailName).hexdigest() + at + emailDomain
