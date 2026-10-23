import { useAppStore } from '../../store/useAppStore';
import { useMediaQuery, useIsPhone } from '../../hooks/useMediaQuery';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import StatsPanel from './StatsPanel';
import MobileShell from '../mobile/MobileShell';

/**
 * Three-column desktop shell:
 *   [ Sidebar ] [ TopBar / main content ] [ Stats panel ]
 * - Sidebar auto-collapses to an icon rail below 1280px, or below 1600px while the stats panel is open.
 * - Stats panel is shown from 1280px up and can be toggled from the top bar.
 */
export default function AppLayout({ title, subtitle, children }) {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const rightPanelOpen = useAppStore((s) => s.rightPanelOpen);
  const isPhone = useIsPhone();
  const isXL = useMediaQuery('(min-width: 1280px)');
  const isUltraWide = useMediaQuery('(min-width: 1600px)');

  if (isPhone) {
    return (
      <MobileShell title={title} subtitle={subtitle}>
        {children}
      </MobileShell>
    );
  }

  const showStats = rightPanelOpen && isXL;
  // Give the main column room: rail-only sidebar on small windows, or when the stats panel is open below 1600px.
  const collapsed = sidebarCollapsed || !isXL || (showStats && !isUltraWide);

  return (
    <div className="flex h-full w-full overflow-hidden text-fg">
      <Sidebar collapsed={collapsed} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={title} subtitle={subtitle} />
        <main className="relative flex-1 overflow-y-auto">
          <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_80%)]" />
          <div className="relative mx-auto max-w-[1400px] animate-fade-up p-5">{children}</div>
        </main>
      </div>

      {showStats && <StatsPanel />}
    </div>
  );
}
