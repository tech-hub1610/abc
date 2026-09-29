import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { drawService } from '../../services/drawService';
import { ticketService } from '../../services/ticketService';
import { Draw, Ticket } from '../../types';
import { formatCoins, formatTime, formatDate } from '../../utils';
import { WinningTicketVisual } from '../../components/ticket/WinningTicketVisual';
import { Modal } from '../../components/common/Modal';
import { useSearchParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Dices,
  Plus,
  Trash2,
  CheckCircle2,
  Coins,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface CartItem {
  id: string;
  number: string;
  sem: number;
}

export const PlayPage: React.FC = () => {
  const { user, walletBalance, refreshUserData } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [draws, setDraws] = useState<Draw[]>([]);
  const [selectedDrawId, setSelectedDrawId] = useState<string>('');
  const [manualNumber, setManualNumber] = useState<string>('');
  const [selectedSem, setSelectedSem] = useState<number>(5);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [purchasing, setPurchasing] = useState(false);
  const [purchasedTickets, setPurchasedTickets] = useState<Ticket[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDraws = async () => {
      try {
        setLoading(true);
        const all = await drawService.getAll();
        const activeDraws = all.filter((d) => d.status === 'OPEN' || d.status === 'SCHEDULED');
        setDraws(activeDraws);

        const paramDrawId = searchParams.get('drawId');
        if (paramDrawId && activeDraws.some((d) => d.id === paramDrawId)) {
          setSelectedDrawId(paramDrawId);
        } else if (activeDraws.length > 0) {
          setSelectedDrawId(activeDraws[0].id);
        }
      } catch (e) {
        console.error('Failed to load draws:', e);
      } finally {
        setLoading(false);
      }
    };
    loadDraws();
  }, [searchParams]);

  const selectedDraw = draws.find((d) => d.id === selectedDrawId);

  // Quick Pick Generator
  const handleQuickPick = (count: number = 1) => {
    const newItems: CartItem[] = [];
    for (let i = 0; i < count; i++) {
      newItems.push({
        id: `${Date.now()}_${Math.random()}`,
        number: ticketService.generateQuickPickNumber(5),
        sem: selectedSem,
      });
    }
    setCart((prev) => [...prev, ...newItems]);
    showToast(`Added ${count} Quick Pick number${count > 1 ? 's' : ''} to cart`, 'info');
  };

  const handleAddManualNumber = () => {
    if (!ticketService.validateNumber(manualNumber)) {
      showToast('Please enter a valid 4 or 5 digit number.', 'warning');
      return;
    }
    const formatted = manualNumber.padStart(5, '0');
    setCart((prev) => [
      ...prev,
      {
        id: `${Date.now()}_${Math.random()}`,
        number: formatted,
        sem: selectedSem,
      },
    ]);
    setManualNumber('');
    showToast(`Added #${formatted} to cart`, 'success');
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const baseTicketCost = selectedDraw?.ticketCost || 12;
  const totalCartCost = cart.reduce((sum, item) => sum + baseTicketCost * item.sem, 0);

  const handleConfirmPurchase = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedDraw) {
      showToast('Please select a draw.', 'warning');
      return;
    }
    if (cart.length === 0) {
      showToast('Your cart is empty. Add at least one ticket.', 'warning');
      return;
    }
    if (walletBalance < totalCartCost) {
      showToast(
        `Insufficient coin balance. You need ${totalCartCost} coins but have ${walletBalance}.`,
        'error'
      );
      return;
    }

    try {
      setPurchasing(true);
      const tickets = await ticketService.purchaseBulk({
        userId: user.id,
        userName: user.fullName || user.username,
        drawId: selectedDraw.id,
        items: cart.map((c) => ({ number: c.number, sem: c.sem })),
      });

      setPurchasedTickets(tickets);
      setCart([]);
      await refreshUserData();

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}

      setShowSuccessModal(true);
      showToast('Tickets purchased successfully! Good luck!', 'success');
    } catch (e: any) {
      showToast(e.message || 'Purchase failed', 'error');
    } finally {
      setPurchasing(false);
    }
  };

  const semOptions = [5, 10, 15, 20, 25, 50, 100];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>Play Official Lottery Draws</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Pick lucky numbers or use Quick Pick with custom SEM multipliers.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-300">Available:</span>
          <span className="font-mono text-xs font-bold text-amber-300">
            {formatCoins(walletBalance)} 🪙
          </span>
        </div>
      </div>

      {/* Step 1: Draw Selector */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-3">
          1. Select Draw Tier
        </label>
        {draws.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            No active draws available at this moment. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {draws.map((draw) => {
              const isSelected = draw.id === selectedDrawId;
              return (
                <button
                  key={draw.id}
                  onClick={() => setSelectedDrawId(draw.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/40 text-slate-100 shadow-md ring-1 ring-emerald-500'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{draw.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-amber-300">
                      {formatTime(draw.drawTime)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Pot: {formatCoins(draw.jackpotSeed)} 🪙</span>
                    <span className="text-emerald-400 font-semibold">{draw.ticketCost} coins / SEM</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Step 2 & 3: Multiplier & Number Selection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Number Generation & Inputs */}
        <div className="lg:col-span-7 space-y-5">
          {/* SEM Multiplier Selector */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                2. SEM Multiplier
              </label>
              <span className="text-[11px] text-slate-400">
                Cost: {baseTicketCost * selectedSem} coins per number
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {semOptions.map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedSem(sem)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold font-mono transition border ${
                    selectedSem === sem
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {sem} SEM
                </button>
              ))}
            </div>
          </div>

          {/* Quick Pick Buttons */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-3">
              3. Quick Pick Random Numbers
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => handleQuickPick(1)}
                className="py-3 px-2 rounded-xl bg-gradient-to-r from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 border border-emerald-500/40 text-xs font-bold text-white shadow-md flex items-center justify-center gap-1.5 transition"
              >
                <Dices className="w-4 h-4" />
                <span>+1 Quick Pick</span>
              </button>
              <button
                onClick={() => handleQuickPick(5)}
                className="py-3 px-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 transition"
              >
                <Dices className="w-4 h-4" />
                <span>+5 Quick Picks</span>
              </button>
              <button
                onClick={() => handleQuickPick(10)}
                className="py-3 px-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5 transition"
              >
                <Dices className="w-4 h-4" />
                <span>+10 Quick Picks</span>
              </button>
            </div>
          </div>

          {/* Manual 5-Digit Number Input */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-2">
              Or Enter 4 or 5 Digits Manually
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={5}
                value={manualNumber}
                onChange={(e) => setManualNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 48291"
                className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-lg font-mono font-bold tracking-widest text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleAddManualNumber}
                disabled={manualNumber.length < 4}
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-md transition disabled:opacity-40 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Number</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Cart / Summary & Checkout */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-5 flex flex-col justify-between min-h-[420px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="font-display text-sm font-bold text-slate-100">
                    Your Selected Tickets
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {cart.length} ticket{cart.length !== 1 ? 's' : ''} in cart
                  </p>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              <div className="my-3 space-y-2 max-h-64 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    <p>No numbers selected yet.</p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Tap "+1 Quick Pick" or type custom digits to start.
                    </p>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] text-slate-500 font-mono">#{index + 1}</span>
                        <div className="flex gap-0.5 font-mono font-bold text-amber-300 text-sm">
                          {item.number.split('').map((d, i) => (
                            <span
                              key={i}
                              className="w-4 h-5 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-xs"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                          {item.sem} SEM
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-slate-200">
                          {baseTicketCost * item.sem} 🪙
                        </span>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Total Cost & Checkout Button */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Coins Required:</span>
                <span className="font-mono text-base font-extrabold text-amber-300">
                  {formatCoins(totalCartCost)} <span className="text-xs">🪙</span>
                </span>
              </div>

              {walletBalance < totalCartCost && totalCartCost > 0 && (
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>Insufficient balance. Claim refill or daily bonus.</span>
                </div>
              )}

              <button
                onClick={handleConfirmPurchase}
                disabled={cart.length === 0 || purchasing || walletBalance < totalCartCost}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 font-extrabold text-sm text-white shadow-lg shadow-emerald-950/60 transition disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {purchasing ? (
                  <span>Securing Tickets...</span>
                ) : (
                  <>
                    <span>Confirm & Buy Tickets</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Confirmation Modal */}
      {showSuccessModal && (
        <Modal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Tickets Successfully Issued!"
          maxWidth="lg"
        >
          <div className="space-y-4 text-center py-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-100">
                {purchasedTickets.length} Entry Tickets Confirmed!
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Your entries have been saved to your digital ticket ledger. Check your visual tickets below or view them anytime under "My Tickets".
              </p>
            </div>

            {/* Preview First Purchased Ticket */}
            {purchasedTickets.length > 0 && (
              <div className="my-4">
                <WinningTicketVisual ticket={purchasedTickets[0]} draw={selectedDraw} />
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/player/tickets');
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                View All My Tickets
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition"
              >
                Play Again
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
