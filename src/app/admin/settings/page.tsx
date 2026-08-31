'use client';

import { cn } from '@/lib/utils';
import { 
  Database, 
  Key, 
  Globe, 
  Bell, 
  User, 
  Shield, 
  Download,
  Upload,
  Save,
  CheckCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [saved, setSaved] = useState<string | null>(null);
  const [envVars, setEnvVars] = useState({
    NEXT_PUBLIC_SUPABASE_URL: '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
    SUPABASE_SERVICE_ROLE_KEY: '',
    OPENAI_API_KEY: '',
    STRIPE_SECRET_KEY: '',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: '',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  });

  const handleSave = (section: string) => {
    setSaved(section);
    setTimeout(() => setSaved(null), 3000);
  };

  const sections = [
    {
      id: 'database',
      title: 'Database (Supabase)',
      icon: Database,
      description: 'Configure your Supabase project connection',
      fields: [
        { key: 'NEXT_PUBLIC_SUPABASE_URL', label: 'Project URL', type: 'url', placeholder: 'https://your-project.supabase.co' },
        { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', label: 'Anon Key', type: 'password', placeholder: 'eyJhbGciOiJIUzI1NiIs...' },
        { key: 'SUPABASE_SERVICE_ROLE_KEY', label: 'Service Role Key', type: 'password', placeholder: 'eyJhbGciOiJIUzI1NiIs...' },
      ],
    },
    {
      id: 'ai',
      title: 'AI Integration (OpenAI)',
      icon: Key,
      description: 'Configure OpenAI API for proposal generation',
      fields: [
        { key: 'OPENAI_API_KEY', label: 'API Key', type: 'password', placeholder: 'sk-...' },
      ],
    },
    {
      id: 'payments',
      title: 'Payments (Stripe)',
      icon: Globe,
      description: 'Configure Stripe for deposit collection',
      fields: [
        { key: 'STRIPE_SECRET_KEY', label: 'Secret Key', type: 'password', placeholder: 'sk_test_...' },
        { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', label: 'Publishable Key', type: 'password', placeholder: 'pk_test_...' },
      ],
    },
    {
      id: 'app',
      title: 'Application',
      icon: Globe,
      description: 'General application settings',
      fields: [
        { key: 'NEXT_PUBLIC_APP_URL', label: 'App URL', type: 'url', placeholder: 'http://localhost:3000' },
      ],
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Configure integrations and application settings</p>
      </div>

      {saved && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 shadow-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">{saved} settings saved</span>
        </div>
      )}

      {sections.map(section => (
        <div key={section.id} className="bg-white rounded-lg border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex items-center gap-3">
            <section.icon className="h-6 w-6 text-gray-400" />
            <div>
              <h2 className="font-semibold text-gray-900">{section.title}</h2>
              <p className="text-sm text-gray-500">{section.description}</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {section.fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={envVars[field.key as keyof typeof envVars] || ''}
                  onChange={(e) => setEnvVars(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            ))}
            <button
              onClick={() => handleSave(section.title)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Save size={18} />
              Save {section.title} Settings
            </button>
          </div>
        </div>
      ))}

      {/* Danger Zone */}
      <div className="bg-white rounded-lg border overflow-hidden border-red-200">
        <div className="px-6 py-4 border-b bg-red-50 flex items-center gap-3">
          <Shield className="h-6 w-6 text-red-500" />
          <div>
            <h2 className="font-semibold text-gray-900">Danger Zone</h2>
            <p className="text-sm text-gray-500">Irreversible actions</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Reset Database</p>
              <p className="text-sm text-gray-500">Delete all data and re-seed with sample data</p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition">
              Reset Database
            </button>
          </div>
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Export Configuration</p>
              <p className="text-sm text-gray-500">Download .env file with current settings</p>
            </div>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition flex items-center gap-2">
              <Download size={18} />
              Export .env
            </button>
          </div>
        </div>
      </div>

      {/* Documentation */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Download size={20} />
          Quick Reference
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Required for Deployment</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• Supabase Project URL & Keys</li>
              <li>• OpenAI API Key</li>
              <li>• Stripe Test/Live Keys</li>
              <li>• NEXT_PUBLIC_APP_URL (production URL)</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Vercel Environment Variables</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• Add all keys from .env.example</li>
              <li>• Use production Supabase/Stripe keys</li>
              <li>• Set NEXT_PUBLIC_APP_URL to your Vercel URL</li>
              <li>• Configure webhook endpoints in Stripe/GHL</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}