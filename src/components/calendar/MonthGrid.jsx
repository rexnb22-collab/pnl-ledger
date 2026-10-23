import { useMemo } from 'react';
import { buildMonthGrid, todayISO, WEEKDAY_LABELS } from '../../lib/date';
import { intensityTier, maxAbsNet, summarize } from '../../lib/pnl';
import DayCell from './DayCell';

export default function MonthGrid({ focus, dailyMap, selectedDate, onSelect }) {
  const today = todayISO();
  const { cells, maxAbs, best, worst } = useMemo(() => {
    const grid = buildMonthGrid(focus.getFullYear(), focus.getMonth());
    const monthDays = grid.filter((c) => c.inMonth && dailyMap.has(c.iso)).map((c) => dailyMap.get(c.iso));
    const s = summarize(monthDays);
    return {
      cells: grid.map((c) => ({ ...c, future: c.iso > today })),
      maxAbs: maxAbsNet(monthDays),
      best: s.bestDay?.net > 0 ? s.bestDay.iso : null,
      worst: s.worstDay?.net < 0 ? s.worstDay.iso : null,
    };
  }, [focus, dailyMap, today]);

  return (
    <div className="flex flex-1 flex-col overflow-x-auto scrollbar-thin">
      <div className="min-w-[580px] flex flex-1 flex-col">
        <div className="mb-2 grid grid-cols-7 gap-2">
        {WEEKDAY_LABELS.map((d, i) => (
          <div key={d} className={`px-2 text-2xs font-semibold tracking-[0.12em] ${i >= 5 ? 'text-fg-subtle/70' : 'text-fg-subtle'}`}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid flex-1 auto-rows-fr grid-cols-7 gap-2">
        {cells.map((cell, i) => {
          const day = cell.inMonth ? dailyMap.get(cell.iso) : undefined;
          return (
            <DayCell
              key={cell.iso}
              cell={cell}
              day={day}
              tier={day ? intensityTier(day.net, maxAbs) : 0}
              col={i % 7}
              row={Math.floor(i / 7)}
              isToday={cell.iso === today}
              isSelected={cell.iso === selectedDate}
              extreme={cell.iso === best ? 'best' : cell.iso === worst ? 'worst' : null}
              onSelect={onSelect}
            />
          );
        })}
      </div>
      </div>
    </div>
  );
}
