#!/usr/bin/env python
# ----------------------------------------------------------------------
# Numenta Platform for Intelligent Computing (NuPIC)
# Copyright (C) 2015, Numenta, Inc.  Unless you have purchased from
# Numenta, Inc. a separate commercial license for this software code, the
# following terms and conditions apply:
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License version 3 as
# published by the Free Software Foundation.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
# See the GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see http://www.gnu.org/licenses.
#
# http://numenta.org/licenses/
# ----------------------------------------------------------------------

from taurus.monitoring.supervisord_monitor.supervisord_monitor import (
  SupervisorChecker)



"""
Implement Taurus-specific checks using the template below.  For now, don't
do anything beyond the standard high-level supervisor checks (i.e. that
supervisor is running and no processes are in a FATAL state)

@SupervisorChecker.registerCheck
def checkFoo(checker):
  # Implement Taurus-specific supervisor-related check here
"""



def main():
  SupervisorChecker().checkAll()



if __name__ == "__main__":
  main()
