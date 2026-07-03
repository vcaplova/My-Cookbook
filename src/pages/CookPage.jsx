import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { scaleIng, getStepIngs, extractTimerFromStep, formatTimerTime } from '../lib/utils';
import { ChevronLeft, ChevronRight, ListIcon, FlameIcon, BrandIcon } from '../components/Icons';

const CIRCUMFERENCE = 2 * Math.PI * 32;

function CookTimer({ min, max }) {
  const hasRange = max > min;
  const [target, setTarget] = useState(min);
  const [remaining, setRemaining] = useState(min);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setDone(true);
          try {
            // Gentle beep on completion
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            o.frequency.value = 880;
            g.gain.setValueAtTime(0.25, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            o.start(); o.stop(ctx.currentTime + 0.8);
          } catch { /* audio unavailable */ }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const progress = target > 0 ? remaining / target : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const reset = () => { setRunning(false); setDone(false); setRemaining(target); };
  const changeTarget = (v) => { setTarget(v); if (!running) { setRemaining(v); setDone(false); } };

  return (
    <div className={hasRange ? 'cook-timer has-range' : 'cook-timer'}>
      <div className="timer-dial">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle className="timer-dial-track" cx="36" cy="36" r="32" />
          <circle className="timer-dial-fill" cx="36" cy="36" r="32" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={dashOffset} />
        </svg>
        <div className={done ? 'timer-dial-text timer-done' : 'timer-dial-text'}>{done ? 'Done!' : formatTimerTime(remaining)}</div>
      </div>
      {hasRange && (
        <div className="timer-range">
          <span className="timer-range-label">{formatTimerTime(min)}</span>
          <input type="range" className="timer-slider" min={min} max={max} step={30} value={target}
            onChange={(e) => changeTarget(parseInt(e.target.value))} disabled={running} />
          <span className="timer-range-label">{formatTimerTime(max)}</span>
        </div>
      )}
      <div className="timer-controls">
        {!done && (
          <button className={running ? 'timer-btn running' : 'timer-btn primary'} onClick={() => setRunning((r) => !r)}>
            {running ? 'Pause' : remaining < target ? 'Resume' : 'Start'}
          </button>
        )}
        <button className="timer-btn danger" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}

export default function CookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes } = useLibrary();
  const recipe = recipes.find((r) => r.id === Number(id));
  const [step, setStep] = useState(0);
  const scaledServings = recipe?.servings || 4;
  const baseServings = recipe?.servings || 4;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') navigate(`/recipe/${id}`);
      if (e.key === 'ArrowRight') setStep((s) => Math.min(s + 1, (recipe?.steps.length || 1) - 1));
      if (e.key === 'ArrowLeft') setStep((s) => Math.max(s - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, id, recipe]);

  if (!recipe) { navigate('/'); return null; }

  const steps = recipe.steps || [];
  const total = steps.length;
  const stepText = steps[step] || '';
  const timers = extractTimerFromStep(stepText);
  const ings = getStepIngs(recipe, step);
  const nextIngs = step < total - 1 ? getStepIngs(recipe, step + 1) : [];
  const isLast = step >= total - 1;
  const ratio = scaledServings / baseServings;

  return (
    <div className="detail-panel open">
      <div className="detail-sheet">
        <div className="detail-bar">
          <div className="brand-icon-sm" title="Back to My Cookbook" onClick={() => navigate('/')}><BrandIcon size={16} /></div>
          <button className="btn-detail-back" onClick={() => navigate(`/recipe/${recipe.id}`)}><ChevronLeft /> Recipe</button>
          <div className="detail-bar-title">{recipe.title}</div>
          <div className="mode-toggle">
            <button className="mbtn" onClick={() => navigate(`/recipe/${recipe.id}`)}><ListIcon size={13} /> Read</button>
            <button className="mbtn on"><FlameIcon /> Cook</button>
          </div>
        </div>
        <div className="cook-mode">
          <div className="cook-prog"><div className="cook-prog-fill" style={{ width: ((step + 1) / total * 100) + '%' }}></div></div>
          <div className="cook-body">
            <div className="cook-cur">
              <div className="cook-step-label">Step {step + 1} of {total}</div>
              <div className="cook-ing-title">Ingredients for this step</div>
              <div className="cook-ings">
                {ings.length
                  ? ings.map((i, k) => <span key={k} className="cook-ing-chip">{scaleIng(i, ratio)}</span>)
                  : <span className="cook-no-ing">No specific ingredients for this step</span>}
              </div>
              <div className="cook-step-text">{stepText}</div>
              <div id="cook-timer-wrap">
                {timers && timers.map((t, i) => <CookTimer key={step + '-' + i} min={t.min} max={t.max} />)}
              </div>
            </div>
            {!isLast && (
              <div className="cook-next">
                <div className="cook-next-label">Up next</div>
                <div className="cook-next-ing-label">Ingredients needed</div>
                <div className="cook-next-chips">
                  {nextIngs.map((i, k) => <span key={k} className="cook-ing-chip">{scaleIng(i, ratio)}</span>)}
                </div>
                <div className="cook-next-text">{steps[step + 1]}</div>
              </div>
            )}
          </div>
          <div className="cook-nav">
            <button className="cook-nav-btn" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
              <ChevronLeft size={15} /> Previous
            </button>
            <span className="cook-counter">{step + 1} / {total}</span>
            {isLast ? (
              <button className="cook-nav-btn primary" onClick={() => navigate(`/recipe/${recipe.id}`)}>Finish ✓</button>
            ) : (
              <button className="cook-nav-btn primary" onClick={() => setStep((s) => Math.min(total - 1, s + 1))}>
                Next <ChevronRight />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
