import React, { useState } from 'react';
import { RewardBox } from '../../types';
import { rewardBoxService } from '../../services/rewardBoxService';
import { formatCoins } from '../../utils';
import confetti from 'canvas-confetti';
import { Gift, Sparkles, Coins, Check, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';

interface SurpriseBoxModalProps {
  box: RewardBox | null;
  isOpen: boolean;
  onClose: () => void;
  onBoxOpened: () => void;
}

export const SurpriseBoxModal: React.FC<SurpriseBoxModalProps> = ({
  box,
  isOpen,
  onClose,
  onBoxOpened,
}) => {
  const [opening, setOpening] = useState(false);
  const [reward, setReward] = useState<{ coins: number; label: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!box) return null;

  const handleOpen = async () => {
    try {
      setOpening(true);
      setError(null);

      // Trigger surprise box opening via service
      const res = await rewardBoxService.openBox(box.id, box.userId);

      // Trigger confetti explosion
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
        });
      } catch (e) {
        console.warn('Confetti error:', e);
      }

      setReward({ coins: res.rewardCoins, label: res.label });
      onBoxOpened();
    } catch (e: any) {
      setError(e.message || 'Failed to open surprise box.');
    } finally {
      setOpening(false);
    }
  };

  const handleClose = () => {
    setReward(null);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Surprise Mystery Box" maxWidth="sm">
      <div className="text-center py-4">
        {reward ? (
          <div className="space-y-4 animate-in zoom-in-90 duration-300">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-bounce-subtle">
              <Sparkles className="w-10 h-10 text-slate-950 fill-slate-950" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                REWARD UNLOCKED!
              </span>
              <h3 className="text-2xl font-black font-display text-slate-100 mt-1">
                {reward.label}
              </h3>
              <p className="text-3xl font-extrabold font-mono text-amber-300 mt-2">
                +{formatCoins(reward.coins)} <span className="text-sm">🪙</span>
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Coins have been automatically credited to your virtual wallet.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 font-bold text-sm text-white shadow-lg transition"
            >
              Awesome, Claim & Close
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div
              className={`w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-600/20 border-2 border-amber-400/40 flex items-center justify-center shadow-xl ${
                opening ? 'animate-spin-slow' : 'animate-pulse-slow'
              }`}
            >
              <Gift className="w-12 h-12 text-amber-400" />
            </div>

            <div>
              <h4 className="font-display text-lg font-bold text-slate-100">
                {box.drawName} Entry Reward
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Granted for participating in this draw. Tap below to crack open your surprise box!
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleOpen}
              disabled={opening || box.status !== 'AVAILABLE'}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 font-extrabold text-sm text-slate-950 shadow-lg shadow-amber-500/20 transition transform active:scale-95 disabled:opacity-50"
            >
              {opening ? 'Cracking Open...' : 'Tap to Open Box 🎁'}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
