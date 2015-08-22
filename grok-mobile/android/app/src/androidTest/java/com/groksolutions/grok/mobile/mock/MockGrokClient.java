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

package com.groksolutions.grok.mobile.mock;

import com.groksolutions.grok.mobile.service.NotificationSettings;
import com.numenta.core.app.GrokApplication;
import com.numenta.core.data.Instance;
import com.numenta.core.data.Metric;
import com.numenta.core.service.GrokException;
import com.numenta.core.utils.Version;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;

/**
 * Configurable mock {@link com.numenta.core.service.GrokClient} to be used in unit tests.
 * <p>
 * Sample usage:
 *
 * <pre>
 * <code>
 *     MockGrokClient grokClient = new MockGrokClient();
 *     Random rnd = new Random();
 *
 *     // Set start date for data
 *     Calendar cal = Calendar.getInstance();
 *     cal.setTimeZone(TimeZone.getTimeZone("UTC"));
 *     cal.set(2014, Calendar.JANUARY, 1, 0, 0, 0);
 *
 *     String metricId, instanceId, serverName, metricName;
 *
 *     // Create 10 mock instances with 4 mock metrics each, 1000 rows each metric
 *     for (int i = 0; i < 10; i++) {
 *
 *         // New Instance
 *         instanceId = "i-" + i;
 *         serverName = "server_" + i;
 *         for (int m = 0; m < 4; m++) {
 *
 *             // New Metric
 *             metricId = "m-" + i + "_" + m;
 *             metricName = "metric_" + m;
 *             grokClient.addMetric(new Metric(metricId, metricName, instanceId, serverName, 1000));
 *
 *             // Add Data
 *             for (int rowid = 1; rowid <= 1000; rowid++) {
 *                  grokClient.addMetricData(new MetricData(metricId, cal.getTime(), rnd.nextFloat(), rnd.nextFloat(), rowid));
 *             }
 *         }
 *     }
 *     // Override default factory
 *     GrokApplication.setGrokClientFactory(new MockGrokClientFactory(grokClient));
 *
 * </code>
 * </pre>
 */
public class MockGrokClient extends com.numenta.core.utils.mock.MockGrokClient {
    NotificationSettings _notificationSettings = new NotificationSettings("", 3600);
    protected final HashMap<String, Instance> _instances = new HashMap<>();

    public MockGrokClient(Version version) {
        super(version);
    }

    public void updateNotifications(String email, int frequency) throws GrokException, IOException {
        _notificationSettings = new NotificationSettings(email, frequency);
    }

    public NotificationSettings getNotificationSettings() throws GrokException, IOException {
        return _notificationSettings;
    }

    public String post(String url, String data) throws GrokException, IOException {
        return "{success:true}";
    }

    public String get(String url) throws GrokException, IOException {
        return null;
    }

    public void delete(String url) throws GrokException, IOException {
    }
    public void addMetric(Metric metric) {
        super.addMetric(metric);
        Instance instance = GrokApplication.getDatabase().getDataFactory()
                .createInstance(metric.getInstanceId(), metric.getServerName(), metric.getName(),
                        "us-east-1", null, 1);
        _instances.put(metric.getInstanceId(), instance);
    }
    public List<Instance> getInstances() throws GrokException, IOException {
        return Collections.list(Collections.enumeration(_instances.values()));
    }

    public String getUserAgent() {
        return "Mock";
    }
}
