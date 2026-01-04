"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, ClipboardList, FileText, Users } from "lucide-react";
import { useAuthedUser } from "@/lib/hooks/useAuthedUser";

function getDisplayName(email?: string | null) {
  if (!email) return "";
  const at = email.indexOf("@");
  return at > 0 ? email.slice(0, at) : email;
}

export default function WorkspacePage() {
  const { user } = useAuthedUser();
  const displayName = useMemo(() => getDisplayName(user?.email), [user?.email]);

  // TODO: connect these counts to real queries once the tables exist consistently.
  const stats = { campaigns: 0, deeds: 0, groups: 0 };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Welcome back, {displayName || ""}!</h1>
        <p className="mt-2 text-neutral-600">Here's an overview of your activity on MishMeshMosh</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">My Campaigns</p>
              <p className="mt-2 text-3xl font-bold text-neutral-900">{stats.campaigns}</p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-2">
              <ClipboardList className="h-6 w-6 text-neutral-700" />
            </div>
          </div>
          <Link
            href="/workspace/campaigns"
            className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View campaigns <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">My Deeds</p>
              <p className="mt-2 text-3xl font-bold text-neutral-900">{stats.deeds}</p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-2">
              <FileText className="h-6 w-6 text-neutral-700" />
            </div>
          </div>
          <Link
            href="/workspace/deeds"
            className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View deeds <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">My Groups</p>
              <p className="mt-2 text-3xl font-bold text-neutral-900">{stats.groups}</p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-2">
              <Users className="h-6 w-6 text-neutral-700" />
            </div>
          </div>
          <p className="mt-4 text-sm text-neutral-500">Coming soon</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">Quick Actions</h2>
          <div className="mt-4 space-y-3">
            <Link
              href="/create"
              className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 hover:bg-neutral-50"
            >
              <div className="flex items-center">
                <div className="rounded-lg bg-blue-50 p-2">
                  <span className="text-blue-600">+</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-neutral-900">Create Need Campaign</p>
                  <p className="text-sm text-neutral-600">Start gathering demand for a product or service</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-neutral-400" />
            </Link>

            <Link
              href="/explore"
              className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 hover:bg-neutral-50"
            >
              <div className="flex items-center">
                <div className="rounded-lg bg-purple-50 p-2">
                  <span className="text-purple-600">🔎</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-neutral-900">Browse Campaigns</p>
                  <p className="text-sm text-neutral-600">Find and join active campaigns</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-neutral-400" />
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">Recent Activity</h2>
          <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-neutral-50 p-3">
              <span className="text-2xl">📊</span>
            </div>
            <p className="mt-4 font-medium text-neutral-900">No recent activity yet</p>
            <p className="mt-1 text-sm text-neutral-600">
              Your activity will appear here once you create or join campaigns
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
