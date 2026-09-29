# 🎰 Lucky Buzz — Modern Lottery & Numbers WebApp (Vite + LocalStorage MVP)

A mobile-responsive, modern numbers game and lottery application built with **React**, **TypeScript**, **Tailwind CSS**, and **Vite**, powered by a **clean repository architecture** designed for easy future **Supabase** migration.

---

## 🌟 Core Architecture & Highlights

- **Tech Stack**: Vite, React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas-Confetti.
- **Frontend-Only MVP (No Backend / No PHP / No MySQL / No AI)**: Runs entirely client-side with centralized versioned Local Storage persistence.
- **Supabase-Ready Repository Architecture**: All services interact with repository interfaces (`IAuthRepository`, `IUserRepository`, `IDrawRepository`, `ITicketRepository`, `IWalletRepository`, `IResultRepository`, `IPrizeRepository`, `IBonusRepository`, `IRewardBoxRepository`, etc.). Switching to Supabase requires only swapping the repository implementations without touching UI code.
- **Mobile-First Responsive Design**: Tailored touch-friendly controls, sticky bottom navigation for players, collapsible drawers for administrators, and adaptive card views.

---

## 👥 Three Strictly Separated User Roles

1. **SUPERADMIN** (`superadmin@luckybuzz.io` / `password123`):
   - Full root privileges across the entire system.
   - Admin user management with granular permission assignment.
   - Global draw scheduling, status toggling, and commitment hash inspection.
   - Deterministic winner evaluation and idempotent prize settlement.
   - Virtual coin economics ledger & player balance adjustments.
   - Ticket visual theme customizer (Emerald Gold Deluxe, Royal Sapphire, Obsidian Prestige).
   - System analytics reports & instant CSV dataset export.
   - Immutable security audit log.
   - System settings & LocalStorage backup/reset tools.

2. **ADMIN** (`admin@luckybuzz.io` / `password123`):
   - Delegated operational control panel.
   - Access strictly gated by centralized permissions (`players.view`, `draws.create`, `results.publish`, `reports.view`, etc.).
   - Route-level and service-level security checks.

3. **PLAYER** (`player@luckybuzz.io` / `password123` or register new account):
   - Interactive numbers keypad and 1/5/10 Quick Pick generator.
   - Multi-ticket purchasing cart with SEM multipliers (5, 10, 15, 20... up to 100).
   - High-resolution SVG vector ticket inspection with guilloche patterns, barcode stamping, and print support.
   - 7-Day daily streak bonus calendar with automatic step increments.
   - Free emergency pocket money refill when coin balance is low.
   - Provably fair surprise mystery boxes with published table odds.
   - Real-time prize match checker and winning tickets archive.

---

## 🔐 Demo Accounts (One-Tap Switcher Included)

The top navigation header includes a **Demo Role Switcher** dropdown for quick role testing:

| Role | Email / Identifier | Password | Starting Coins |
| :--- | :--- | :--- | :--- |
| **Superadmin** | `superadmin@luckybuzz.io` | `password123` | 999,999 🪙 |
| **Admin** | `admin@luckybuzz.io` | `password123` | 50,000 🪙 |
| **Player (Vikram)** | `player@luckybuzz.io` | `password123` | 32,440 🪙 |
| **Player (Anita)** | `anita@luckybuzz.io` | `password123` | 41,200 🪙 |

---

## 🚀 How to Run

```bash
# Run the development server
npm run dev

# Or build the production bundle
npm run build
```

---

## 🗄️ Local Storage Collections

- `luckybuzz_app_users`
- `luckybuzz_app_session_user`
- `luckybuzz_app_draws`
- `luckybuzz_app_tickets`
- `luckybuzz_app_wallets`
- `luckybuzz_app_wallet_transactions`
- `luckybuzz_app_results`
- `luckybuzz_app_wins`
- `luckybuzz_app_prizes`
- `luckybuzz_app_bonus_claims`
- `luckybuzz_app_reward_boxes`
- `luckybuzz_app_reward_box_config`
- `luckybuzz_app_notifications`
- `luckybuzz_app_audit_logs`
- `luckybuzz_app_settings`
- `luckybuzz_app_ticket_templates`
