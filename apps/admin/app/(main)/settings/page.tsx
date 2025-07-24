"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function SettingsPage() {
  const [tab, setTab] = useState("account");

  return (
    <div className="min-h-screen px-6 py-12 bg-muted/40 backdrop-blur-md">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-primary">Settings</h1>

        <Card className="p-6 border border-white/10 bg-white/80 dark:bg-black/20 shadow-xl rounded-lg">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="organization">Organization</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            {/* --- Account Settings --- */}
            <TabsContent value="account">
              <div className="space-y-5">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
                <div>
                  <Label htmlFor="password">New Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>
                <Button className="mt-4 bg-primary">Update Account</Button>
              </div>
            </TabsContent>

            {/* --- Organization Settings --- */}
            <TabsContent value="organization">
              <div className="space-y-5">
                <div>
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input id="orgName" placeholder="e.g., Hiremate Inc." />
                </div>
                <div>
                  <Label htmlFor="orgRole">Your Role</Label>
                  <Input id="orgRole" placeholder="e.g., Admin, HR, Interviewer" />
                </div>
                <div>
                  <Label htmlFor="orgInvite">Invite Team Members</Label>
                  <Input id="orgInvite" placeholder="team@email.com" />
                </div>
                <Button className="mt-4 bg-secondary">Save Organization</Button>
              </div>
            </TabsContent>

            {/* --- Preferences --- */}
            <TabsContent value="preferences">
              <div className="space-y-5">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Input id="theme" placeholder="System / Light / Dark" />
                </div>
                <div>
                  <Label htmlFor="notifications">Notifications</Label>
                  <Input id="notifications" placeholder="Enabled / Disabled" />
                </div>
                <Button className="mt-4 bg-primary">Save Preferences</Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
