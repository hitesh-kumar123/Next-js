// app/dashboard/notification/page.tsx
'use client';

import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, ShieldAlert, Info, Trash2 } from 'lucide-react';

interface SystemNotification {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const initialAlerts: SystemNotification[] = [
  { id: '1', type: 'critical', title: 'Unauthorized Token Handshake Detected', message: 'API interceptor blocked access challenge request originating from node subnet pool mask.', time: '2 mins ago', read: false },
  { id: '2', type: 'warning', title: 'Database Thread Execution Threshold', message: 'MongoDB replica sets pool connection stream allocation reached max limit configurations layer.', time: '1 hr ago', read: false },
  { id: '3', type: 'success', title: 'Production Cache Successfully Purged', message: 'Turbopack build structures static context maps sync completely updated without node drops.', time: '5 hrs ago', read: true }
];

export default function NotificationsPage() {
  const [alerts, setAlerts] = useState<SystemNotification[]>(initialAlerts);

  const markAllAsRead = () => {
    setAlerts(alerts.map(a => ({ ...a, read: true })));
  };

  const clearAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">System Events & Alerts</h2>
          <p className="text-sm text-muted-foreground">Audit live logging feeds, infrastructure state changes, and session security intercepts.</p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="self-start sm:self-center text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors flex items-center gap-1.5"
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Mark all as reviewed
        </button>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground bg-card">
            <Bell className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2 animate-bounce" />
            <p className="text-sm font-semibold">Workspace feed is fully synced</p>
            <p className="text-xs text-muted-foreground/80 mt-1">No pending administrative attention sequences required at this time.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                alert.read ? 'bg-card/50 border-muted opacity-70' : 'bg-card border-l-4 border-l-indigo-600 shadow-2xs'
              }`}
            >
              <div className="mt-0.5">
                {alert.type === 'critical' && <ShieldAlert className="h-4 w-4 text-red-500" />}
                {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                {alert.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                {alert.type === 'info' && <Info className="h-4 w-4 text-blue-500" />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs font-bold tracking-wide ${!alert.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {alert.title}
                  </h4>
                  <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">{alert.time}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">{alert.message}</p>
              </div>
              <button 
                onClick={() => clearAlert(alert.id)}
                className="text-muted-foreground hover:text-destructive p-1 rounded-md hover:bg-muted transition-colors"
                title="Dismiss alert node"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}