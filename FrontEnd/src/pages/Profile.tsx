import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input, { Textarea } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/Toast';
import {
  User, Mail, Briefcase, GraduationCap, Camera,
  Save, Lock, Bell, Settings,
} from 'lucide-react';

const Profile: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const [activeSection, setActiveSection] = useState('profile');

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    targetRole: user?.targetRole || '',
    experienceLevel: user?.experienceLevel || 'Intermediate',
    bio: 'Aspiring full-stack developer passionate about building scalable web applications.',
    preferredTechnologies: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; targetRole: string; experienceLevel: string }) => {
      const res = await api.patch('/users/me', data);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.data) {
        useAuthStore.getState().setUser(data.data);
      }
      toast.success('Profile updated', 'Your changes have been saved.');
    },
    onError: () => {
      toast.error('Update failed', 'Could not save your changes.');
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate({
      name: profile.name,
      targetRole: profile.targetRole,
      experienceLevel: profile.experienceLevel,
    });
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'account', label: 'Account', icon: <Settings className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-heading-1 text-text-primary">Profile</h1>
        <p className="text-body text-text-secondary mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar nav */}
        <div className="lg:w-52 shrink-0">
          <nav className="space-y-0.5">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-body-sm font-medium transition-colors',
                  activeSection === s.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-soft',
                )}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5">
          {activeSection === 'profile' && (
            <>
              {/* Avatar Card */}
              <Card padding="lg">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <span className="text-display font-bold text-primary">{profile.name.charAt(0)}</span>
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-soft" aria-label="Upload photo">
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div>
                    <h2 className="text-heading-2 text-text-primary">{profile.name}</h2>
                    <p className="text-body-sm text-text-secondary">{profile.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="info">{profile.targetRole}</Badge>
                      <Badge variant="outline">{profile.experienceLevel}</Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Edit Form */}
              <Card padding="lg">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    label="Full Name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    leftIcon={<User className="h-4 w-4" />}
                  />
                  <Input
                    label="Email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    leftIcon={<Mail className="h-4 w-4" />}
                    disabled
                    hint="Email cannot be changed"
                  />
                  <Input
                    label="Target Role"
                    value={profile.targetRole}
                    onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
                    leftIcon={<Briefcase className="h-4 w-4" />}
                  />
                  <Dropdown
                    label="Experience Level"
                    value={profile.experienceLevel}
                    onChange={(v) => setProfile({ ...profile, experienceLevel: v })}
                    options={[
                      { value: 'Beginner', label: 'Beginner' },
                      { value: 'Intermediate', label: 'Intermediate' },
                      { value: 'Advanced', label: 'Advanced' },
                    ]}
                  />
                </div>
                <div className="mt-5">
                  <Textarea
                    label="Bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="mt-5">
                  <p className="text-body-sm font-medium text-text-primary mb-2">Preferred Technologies</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferredTechnologies.map((tech) => (
                      <Badge key={tech} variant="info" size="md">{tech}</Badge>
                    ))}
                    <button className="px-2.5 py-1 text-caption font-medium text-text-muted border border-dashed border-border-strong rounded-md hover:border-primary hover:text-primary transition-colors">
                      + Add
                    </button>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button variant="primary" onClick={handleSave} leftIcon={<Save className="h-4 w-4" />}>
                    Save Changes
                  </Button>
                </div>
              </Card>
            </>
          )}

          {activeSection === 'account' && (
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <div className="space-y-5 max-w-md">
                <Input label="Current Password" type="password" leftIcon={<Lock className="h-4 w-4" />} />
                <Input label="New Password" type="password" leftIcon={<Lock className="h-4 w-4" />} />
                <Input label="Confirm Password" type="password" leftIcon={<Lock className="h-4 w-4" />} />
                <Button variant="primary" leftIcon={<Save className="h-4 w-4" />}>
                  Update Password
                </Button>
              </div>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <div className="space-y-4">
                {[
                  { label: 'Interview completion reports', description: 'Get notified after each interview', enabled: true },
                  { label: 'Weekly progress summary', description: 'Receive a weekly performance digest', enabled: true },
                  { label: 'New recommendations', description: 'AI-generated practice recommendations', enabled: false },
                  { label: 'Coding submission results', description: 'Notification when code is evaluated', enabled: true },
                ].map((pref) => (
                  <div key={pref.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-body-sm font-medium text-text-primary">{pref.label}</p>
                      <p className="text-caption text-text-muted">{pref.description}</p>
                    </div>
                    <button
                      className={cn(
                        'w-10 h-6 rounded-full transition-colors relative',
                        pref.enabled ? 'bg-primary' : 'bg-border-strong',
                      )}
                      aria-label={`Toggle ${pref.label}`}
                    >
                      <span className={cn(
                        'absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-soft',
                        pref.enabled ? 'left-[18px]' : 'left-0.5',
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
