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

package com.numenta.taurus.dialog;

import com.numenta.core.service.DataSyncService;
import com.numenta.taurus.R;
import com.numenta.taurus.TaurusApplication;

import android.app.AlertDialog;
import android.app.Dialog;
import android.app.DialogFragment;
import android.app.FragmentManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.DialogInterface.OnClickListener;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.v4.content.LocalBroadcastManager;

public class RefreshDialogFragment extends DialogFragment {
    private static volatile RefreshDialogFragment _dialog;
    private static final Object _lock = new Object();
    private BroadcastReceiver _isRefreshingReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (TaurusApplication.isRefreshing()) {
                dismiss();
            } else {
                String result = TaurusApplication.getLastError();
                if (result == null) {
                    dismiss();
                }
            }
        }
    };

    @NonNull
    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        final Bundle args = getArguments();
        final String message = args.getString("message");
        final AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
        builder.setTitle(R.string.refresh_dialog_title).setMessage(message)
                .setNegativeButton(android.R.string.ok, new OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        dialog.dismiss();
                    }
                });
        return builder.create();
    }

    public static void show(String message, FragmentManager manager) {
        synchronized (_lock) {
            if (_dialog == null) {
                _dialog = new RefreshDialogFragment();
            } else {
                return;
            }
        }
        final Bundle args = new Bundle();
        args.putString("message", message);
        _dialog.setArguments(args);
        _dialog.show(manager, "RefreshDialogFragment");
        _dialog = null;
    }

    @Override
    public void onResume() {
        super.onResume();
        LocalBroadcastManager.getInstance(getActivity()).registerReceiver(
                _isRefreshingReceiver,
                new IntentFilter(DataSyncService.REFRESH_STATE_EVENT));
    }

    @Override
    public void onPause() {
        super.onPause();
        LocalBroadcastManager.getInstance(getActivity()).unregisterReceiver(
                _isRefreshingReceiver);
    }
}
