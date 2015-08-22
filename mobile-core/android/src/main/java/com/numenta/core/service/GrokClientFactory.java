/*
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
 *
 */

package com.numenta.core.service;

import java.net.MalformedURLException;

/**
 * Factory used to create {@link GrokClient} instances.
 * <p>
 * This factory is mainly used to facilitated unit testing allowing the test to replace the
 * {@link GrokClient} used with a test version returning test data.
 */
public interface GrokClientFactory {

    /**
     * Create a new {@link GrokClient} instance connecting to the given serverUrl, using the given
     * password
     *
     * @param serverUrl The server URL to connect
     * @param pass The server password
     * @return {@link GrokClient} object used to interact with the server.
     * @throws MalformedURLException
     */
    GrokClient createClient(String serverUrl, String pass) throws MalformedURLException;
}
