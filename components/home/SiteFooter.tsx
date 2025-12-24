import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <img src="/mishmeshmosh_black.png" alt="MishMeshMosh" className="h-10 brightness-0 invert mb-4" />
            <p className="text-slate-400 text-sm leading-relaxed">
              Turning shared needs into supplier-ready deals through digital deeds.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/explore" className="text-slate-400 hover:text-white transition-colors">Explore Needs</Link></li>
              <li><Link href="/explore/feeds" className="text-slate-400 hover:text-white transition-colors">Explore Feeds</Link></li>
              <li><Link href="/create" className="text-slate-400 hover:text-white transition-colors">Create Campaign</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/how-it-works" className="text-slate-400 hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/faq" className="text-slate-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/support" className="text-slate-400 hover:text-white transition-colors">Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/deed-templates" className="text-slate-400 hover:text-white transition-colors">Deed Templates</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center">
          <p className="text-slate-400 text-sm">&copy; 2025 MishMeshMosh. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
