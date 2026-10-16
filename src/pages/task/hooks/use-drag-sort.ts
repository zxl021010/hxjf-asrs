import { useCallback, useRef, useState } from 'react';

interface DragState {
  sourceIndex: number;
  positions: number[];
  positionIndices: number[];
  lastClientY: number;
  scrollSpeed: number;
}

interface UseDragSortOptions {
  readonly tasks: readonly TaskAPI.TaskVO[];
  readonly setTasks: React.Dispatch<React.SetStateAction<TaskAPI.TaskVO[]>>;
  readonly onReorder?: (draggedTaskId: number, targetTaskId: number, position: 'BEFORE' | 'AFTER') => void;
}

interface UseDragSortReturn {
  readonly dragSourceIndex: number | null;
  readonly dragTargetIndex: number | null;
  readonly handleDragStart: (e: React.MouseEvent | React.TouchEvent, index: number) => void;
}

const useDragSort = ({ tasks, setTasks, onReorder }: UseDragSortOptions): UseDragSortReturn => {
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null);
  const [dragTargetIndex, setDragTargetIndex] = useState<number | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const dragTargetRef = useRef<number | null>(null);
  const scrollAnimationRef = useRef<number | null>(null);

  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent, index: number) => {
      e.preventDefault();

      const cards = document.querySelectorAll('[data-task-drag]');
      const positions: number[] = [];
      const positionIndices: number[] = [];
      cards.forEach((card, i) => {
        if (card.getAttribute('data-task-status') !== 'PENDING') return;
        const rect = card.getBoundingClientRect();
        positions.push(rect.top + rect.height / 2);
        positionIndices.push(i);
      });

      dragRef.current = { sourceIndex: index, positions, positionIndices, lastClientY: 0, scrollSpeed: 0 };
      dragTargetRef.current = index;
      setDragSourceIndex(index);
      setDragTargetIndex(index);

      const recalculatePositions = () => {
        const c = document.querySelectorAll('[data-task-drag]');
        const pos: number[] = [];
        const idx: number[] = [];
        c.forEach((card, i) => {
          if (card.getAttribute('data-task-status') !== 'PENDING') return;
          const r = card.getBoundingClientRect();
          pos.push(r.top + r.height / 2);
          idx.push(i);
        });
        if (dragRef.current) {
          dragRef.current.positions = pos;
          dragRef.current.positionIndices = idx;
        }
      };

      const updateTargetFromPositions = () => {
        const cur = dragRef.current;
        if (!cur) return;
        const { positions: p, positionIndices: ind, lastClientY } = cur;
        let t = 0;
        for (let i = 0; i < p.length; i++) {
          if (lastClientY < p[i]) {
            t = i;
            break;
          }
          t = i;
        }
        const ai = ind[t];
        if (ai !== dragTargetRef.current) {
          dragTargetRef.current = ai;
          setDragTargetIndex(ai);
        }
      };

      const animateScroll = () => {
        const cur = dragRef.current;
        if (!cur || cur.scrollSpeed === 0) {
          scrollAnimationRef.current = null;
          return;
        }
        window.scrollBy(0, cur.scrollSpeed);
        recalculatePositions();
        updateTargetFromPositions();
        scrollAnimationRef.current = requestAnimationFrame(animateScroll);
      };

      const SCROLL_THRESHOLD = 80;
      const MAX_SCROLL_SPEED = 10;

      const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
        moveEvent.preventDefault();
        const moveY =
          'touches' in moveEvent ? (moveEvent as TouchEvent).touches[0].clientY : (moveEvent as MouseEvent).clientY;

        if (dragRef.current) {
          dragRef.current.lastClientY = moveY;
        }

        const viewH = window.innerHeight;
        const distTop = moveY;
        const distBottom = viewH - moveY;
        let speed = 0;
        if (distTop < SCROLL_THRESHOLD) {
          speed = -MAX_SCROLL_SPEED * (1 - distTop / SCROLL_THRESHOLD);
        } else if (distBottom < SCROLL_THRESHOLD) {
          speed = MAX_SCROLL_SPEED * (1 - distBottom / SCROLL_THRESHOLD);
        }

        if (dragRef.current) {
          dragRef.current.scrollSpeed = speed;
        }

        if (speed !== 0) {
          if (!scrollAnimationRef.current) {
            scrollAnimationRef.current = requestAnimationFrame(animateScroll);
          }
        } else {
          if (scrollAnimationRef.current) {
            cancelAnimationFrame(scrollAnimationRef.current);
            scrollAnimationRef.current = null;
          }
        }

        if (!scrollAnimationRef.current) {
          const current = dragRef.current;
          if (!current) return;
          const { positions: pos, positionIndices: indices } = current;
          let target = 0;
          for (let i = 0; i < pos.length; i++) {
            if (moveY < pos[i]) {
              target = i;
              break;
            }
            target = i;
          }
          const actualIndex = indices[target];
          if (actualIndex !== dragTargetRef.current) {
            dragTargetRef.current = actualIndex;
            setDragTargetIndex(actualIndex);
          }
        }
      };

      const handleUp = () => {
        const finalTarget = dragTargetRef.current;
        const source = dragRef.current?.sourceIndex;
        if (source !== undefined && finalTarget !== null && source !== finalTarget) {
          const draggedTask = tasks[source];
          const targetTask = tasks[finalTarget];
          if (draggedTask && targetTask) {
            const position = source < finalTarget ? 'AFTER' : 'BEFORE';
            onReorder?.(draggedTask.id, targetTask.id, position);
            setTasks((prev) => {
              const next = [...prev];
              const fromIdx = next.findIndex((t) => t.id === draggedTask.id);
              const toIdx = next.findIndex((t) => t.id === targetTask.id);
              if (fromIdx === -1 || toIdx === -1) return prev;
              const [moved] = next.splice(fromIdx, 1);
              next.splice(toIdx, 0, moved);
              return next;
            });
          }
        }
        dragRef.current = null;
        dragTargetRef.current = null;
        if (scrollAnimationRef.current) {
          cancelAnimationFrame(scrollAnimationRef.current);
          scrollAnimationRef.current = null;
        }
        setDragSourceIndex(null);
        setDragTargetIndex(null);
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleUp);
      };

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleUp);
    },
    [tasks, setTasks, onReorder],
  );

  return { dragSourceIndex, dragTargetIndex, handleDragStart };
};

export default useDragSort;
