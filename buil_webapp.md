REBUILD THE WEBAPP — VITE + LOCAL STORAGE MVP

Rebuild the uploaded webapp as a completely new, modern, mobile-responsive-first web application.

IMPORTANT:
The uploaded existing webapp/source code should be used only as a functional reference. Analyze its existing features, screens, workflows, ticket system, draw system, player functionality, admin functionality, wallet/coin logic, bonuses, reward boxes, results, and ticket visual system.

Do NOT copy the old architecture or UI directly.

The new application must be built from scratch using a modern Vite-based frontend architecture and should be designed so that the temporary Local Storage data layer can later be replaced by Supabase without rebuilding the entire application.

==================================================
TECH STACK
==================================================

Use Vite as the application/build tool.

Use a modern frontend stack based around Vite and its related frontend libraries.

Recommended architecture:

- Vite
- React
- TypeScript
- React Router
- Modern component-based UI architecture
- CSS/Tailwind or another Vite-compatible styling solution
- Local Storage for the temporary data layer
- Browser-native APIs where appropriate

Keep the implementation frontend-focused.

DO NOT introduce PHP.

DO NOT introduce a traditional backend for this MVP.

DO NOT introduce MySQL.

DO NOT introduce SQLite.

DO NOT introduce Firebase.

DO NOT introduce AI services.

DO NOT introduce OCR.

DO NOT introduce AI-based lottery-result extraction.

DO NOT introduce any AI-related functionality.

The application should run completely as a Vite frontend application for the testing/MVP phase.

==================================================
DATA ARCHITECTURE
==================================================

For the MVP/testing version, use Local Storage as the persistent data layer.

However, DO NOT scatter localStorage.getItem() and localStorage.setItem() throughout components.

Create a centralized data/service layer.

Example architecture:

src/
  components/
  pages/
  layouts/
  routes/
  hooks/
  services/
  store/
  types/
  utils/
  data/
  assets/

Create services such as:

authService
userService
playerService
adminService
drawService
ticketService
walletService
bonusService
rewardBoxService
resultService
notificationService
auditService
settingsService
storageService

The UI should communicate with these services rather than directly with Local Storage.

This is extremely important because the Local Storage layer will later be replaced with Supabase.

==================================================
SUPABASE-READY ARCHITECTURE
==================================================

Design the application so Local Storage is only a temporary implementation of the data layer.

Create clear interfaces/types for repositories/services.

For example:

AuthRepository
UserRepository
DrawRepository
TicketRepository
WalletRepository
ResultRepository
BonusRepository
RewardBoxRepository
NotificationRepository
AuditRepository
SettingsRepository

For the MVP:

LocalStorageAuthRepository
LocalStorageUserRepository
LocalStorageDrawRepository
etc.

Later:

SupabaseAuthRepository
SupabaseUserRepository
SupabaseDrawRepository
etc.

The UI should not need major changes when switching from Local Storage to Supabase.

Keep business logic separate from storage logic.

==================================================
THREE USER ROLES
==================================================

The application must have exactly three main user roles:

SUPERADMIN
ADMIN
PLAYER

Implement proper role-based routing and permission handling.

The UI and navigation must change according to the current user's role.

==================================================
SUPERADMIN
==================================================

Superadmin is the highest-level application administrator.

Superadmin dashboard should provide:

- Overview dashboard
- Player management
- Admin management
- Roles and permissions
- Draw management
- Game configuration
- Prize configuration
- Wallet/coin management
- Bonus management
- Reward-box management
- Results management
- Ticket management
- Ticket visual/template management
- Reports
- Audit logs
- Notifications
- System settings

Superadmin can:

- Create Admin
- Edit Admin
- Enable/disable Admin
- Reset Admin credentials in the MVP simulation
- Manage Players
- View all Players
- View all tickets
- View all draws
- Manage game settings
- Manage prizes
- Manage bonuses
- Manage reward boxes
- Manage results
- Adjust player virtual coins
- View wallet transactions
- View audit logs
- Configure ticket visual templates
- Create announcements
- Manage application settings

Superadmin has access to everything.

==================================================
ADMIN
==================================================

Admin is an operational management role.

Admins must NOT automatically have Superadmin privileges.

The Superadmin should be able to assign permissions to Admin users.

Possible Admin permissions:

- Dashboard
- View Players
- Manage Players
- View Tickets
- Manage Tickets
- View Draws
- Manage Draws
- View Results
- Manage Results
- Manage Bonuses
- Manage Reward Boxes
- View Wallet
- Adjust Player Coins
- View Reports
- Manage Ticket Visuals
- View Notifications

The permissions system must be centralized.

An Admin without a permission must not be able to access that feature.

Do not rely only on hiding navigation items.

Route-level and service-level permission checks must also be implemented.

==================================================
PLAYER
==================================================

Player is the normal application user.

Player can access:

- Dashboard
- Play
- Buy Tickets
- Quick Pick
- My Tickets
- Results
- Wins
- Wallet
- Bonuses
- Reward Boxes
- Notifications
- Profile
- Account settings
- Logout

Players can only see their own:

- Tickets
- Wallet
- Wins
- Transactions
- Bonuses
- Reward boxes
- Notifications
- Profile

Players must never see:

- Admin dashboard
- Superadmin dashboard
- Other players
- Admin accounts
- System settings
- Audit logs
- Permission management

==================================================
AUTHENTICATION FOR MVP
==================================================

Since this is a Local Storage MVP, create a simulated authentication system.

Support:

- Login
- Logout
- Registration
- Role-based accounts
- Session persistence
- Password field
- Basic validation
- Protected routes

Store only what is necessary for the MVP.

Clearly separate authentication logic from UI.

Do not claim that Local Storage authentication is production secure.

Structure the application so that authentication can later be replaced with Supabase Auth.

Create seed/demo accounts for testing:

Superadmin
Admin
Player

Use clearly documented demo credentials inside the development seed data.

Do not hard-code authentication logic directly inside pages.

==================================================
LOCAL STORAGE DATA MODEL
==================================================

Create structured Local Storage collections.

For example:

app_users
app_sessions
app_draws
app_tickets
app_wallets
app_wallet_transactions
app_results
app_prizes
app_bonuses
app_bonus_claims
app_reward_boxes
app_reward_box_claims
app_notifications
app_audit_logs
app_settings
app_ticket_templates

Use JSON serialization.

Create a versioned storage schema.

Example:

app_storage_version

If the data structure changes later, provide migration logic for Local Storage.

Create a StorageService that handles:

- get
- set
- remove
- clear
- update
- migration
- initialization

==================================================
PLAYER WALLET
==================================================

Use virtual coins only.

There must be NO real-money payment system.

No:

- Payment gateway
- Deposit
- Withdrawal
- Bank integration
- UPI
- Card payments
- Cash redemption

Implement:

- Starting coin balance
- Ticket purchase debit
- Prize credit
- Bonus credit
- Reward-box credit
- Admin adjustment
- Transaction history

Every balance change must create a transaction record.

The wallet must not be modified directly from random components.

Use:

walletService.credit()
walletService.debit()
walletService.adjust()
walletService.getBalance()
walletService.getTransactions()

This architecture will make future Supabase migration easier.

==================================================
DRAW SYSTEM
==================================================

Rebuild the existing draw functionality.

Support:

- Multiple draws
- Draw names
- Draw time
- Draw status
- Ticket sales window
- Countdown
- Result
- Prize configuration
- Number of tickets
- Winner count
- Jackpot/rollover where applicable

Possible states:

SCHEDULED
OPEN
CLOSED
DRAWING
SETTLED
CANCELLED

For the MVP, the draw engine can use client-side/local simulation.

However, keep all draw business logic inside drawService so that it can later be moved to a backend/Supabase Edge Function or server-side process.

==================================================
TICKET SYSTEM
==================================================

Preserve the existing ticket purchasing concept.

Players should be able to:

- Select draw
- Select numbers
- Quick Pick
- Review ticket
- See ticket price
- Confirm purchase
- Purchase ticket
- View generated ticket
- View ticket history

Every ticket should have:

- Unique ID
- Player ID
- Draw ID
- Selected numbers
- Price
- Created timestamp
- Status
- Winning status
- Prize amount

Use generated unique IDs.

Prevent invalid ticket data.

Do not trust manually modified frontend state.

Validate all ticket operations through the service layer.

==================================================
QUICK PICK
==================================================

Implement Quick Pick functionality.

Quick Pick should generate valid random numbers according to the game's configured rules.

Keep the random number generation in a reusable utility/service.

Allow the player to:

- Generate one ticket
- Generate multiple tickets
- Review generated numbers
- Remove a generated ticket
- Purchase selected tickets

==================================================
RESULT SYSTEM
==================================================

Rebuild the result system without AI.

Results can be:

- Manually entered by Superadmin
- Manually entered by authorized Admin
- Generated for testing
- Edited before final publication

Do NOT implement:

- OCR
- AI result extraction
- AI result verification
- AI lottery image analysis
- AI result APIs

Create a simple manual result workflow.

Possible statuses:

DRAFT
PENDING
PUBLISHED
CANCELLED

Only authorized Admin/Superadmin users can publish results.

Players can only view published results.

==================================================
WINNER / PRIZE ENGINE
==================================================

Implement the existing winning/prize logic from the uploaded project where applicable.

The prize system should be configurable.

Possible prize categories can include the categories already used by the existing application.

Do not hard-code the prize amount directly into player UI.

Prize calculation must be centralized inside:

prizeService

When a result is published:

1. Find eligible tickets.
2. Evaluate ticket numbers.
3. Determine winners.
4. Calculate prizes.
5. Create win records.
6. Credit player wallets.
7. Create wallet transactions.
8. Update ticket status.
9. Create audit records.

Make the settlement process idempotent.

If settlement is triggered twice, the player must not receive the prize twice.

==================================================
BONUS SYSTEM
==================================================

Preserve the existing bonus functionality.

Support:

- Daily bonus
- Login bonus
- Streak
- Promotional bonus
- Manual Admin bonus

Each bonus claim must have a unique record.

Prevent duplicate claims.

Show:

- Available bonus
- Claimed bonus
- Next claim time
- Streak
- Bonus history

==================================================
REWARD / SURPRISE BOX
==================================================

Preserve the existing reward/surprise-box concept.

Players can receive eligible reward boxes.

A reward box may contain:

- Coins
- Bonus
- Special reward
- Empty result

Reward configuration should be controlled by the administration system.

Every opening must be recorded.

Prevent opening the same box multiple times.

==================================================
TICKET VISUAL SYSTEM
==================================================

Preserve the ticket visual functionality from the existing application.

The application should support modern ticket visuals.

Use a reusable ticket template system.

Do not hard-code a single ticket design.

Ticket templates should support:

- Ticket title
- Draw name
- Draw date
- Ticket ID
- Player information
- Selected numbers
- Prize information
- Winning status
- Ticket branding
- Visual style

The existing green premium ticket concept can be used as one of the visual styles.

Create the ticket visuals as reusable frontend components.

The system should be able to support additional ticket designs later.

No AI image generation is required.

==================================================
SUPERADMIN DASHBOARD
==================================================

Create a modern mobile-first Superadmin dashboard.

Dashboard widgets:

- Total Players
- Active Players
- Total Admins
- Open Draws
- Today's Tickets
- Total Virtual Coins
- Total Wins
- Total Prizes
- Pending Results
- Recent Activity

Charts:

- Player growth
- Ticket activity
- Draw participation
- Coin movement
- Prize distribution

The dashboard should work well on mobile first and scale to tablet and desktop.

==================================================
ADMIN DASHBOARD
==================================================

Create a separate Admin dashboard.

Display only information relevant to the Admin's permissions.

Widgets may include:

- Players
- Tickets
- Draws
- Results
- Pending actions
- Recent activity

If the Admin does not have permission for a module, do not display or allow access to that module.

==================================================
PLAYER DASHBOARD
==================================================

Design the Player dashboard primarily for mobile.

Show:

- Coin balance
- Next draw
- Countdown
- Quick Play
- Quick Pick
- Recent tickets
- Recent wins
- Daily bonus
- Streak
- Reward boxes
- Latest results

The player should be able to reach the main play action quickly.

==================================================
MOBILE-FIRST DESIGN
==================================================

This is a MOBILE-FIRST application.

Design for:

- Android phones
- Small screens
- Medium phones
- Tablets
- Desktop

Prioritize:

- Touch-friendly controls
- Bottom navigation where appropriate
- Large tap targets
- Compact cards
- Responsive tables
- Mobile-friendly forms
- Sticky important actions
- Fast navigation
- Minimal horizontal scrolling

Do not build desktop first and then simply shrink it.

Build the responsive system from the smallest screen upward.

==================================================
UI DESIGN
==================================================

Create a completely new modern interface.

Do not reproduce the old UI pixel-for-pixel.

Use:

- Modern typography
- Consistent spacing
- Cards
- Status badges
- Bottom navigation for Player
- Sidebar/navigation for Admin and Superadmin
- Responsive modals
- Toast notifications
- Skeleton loading states
- Empty states
- Error states
- Confirmation dialogs
- Accessible forms
- Responsive tables
- Search
- Filtering
- Pagination where needed

Use a consistent design system.

==================================================
ROUTING
==================================================

Create protected route groups.

Example:

/login
/register

/player
/player/play
/player/tickets
/player/results
/player/wins
/player/wallet
/player/bonuses
/player/rewards
/player/profile

/admin
/admin/players
/admin/tickets
/admin/draws
/admin/results
/admin/bonuses
/admin/rewards
/admin/reports

/superadmin
/superadmin/admins
/superadmin/players
/superadmin/roles
/superadmin/draws
/superadmin/results
/superadmin/prizes
/superadmin/wallet
/superadmin/reports
/superadmin/audit
/superadmin/settings
/superadmin/ticket-templates

Actual route names can be improved during implementation.

Protect every route based on role and permissions.

==================================================
PERMISSION SYSTEM
==================================================

Create centralized permissions such as:

dashboard.view

players.view
players.create
players.edit
players.suspend

admins.view
admins.create
admins.edit
admins.suspend

roles.view
roles.manage

tickets.view
tickets.manage

draws.view
draws.create
draws.edit
draws.settle
draws.cancel

results.view
results.create
results.edit
results.publish

prizes.view
prizes.manage

wallet.view
wallet.adjust

bonuses.view
bonuses.manage

rewards.view
rewards.manage

reports.view
reports.export

audit.view

settings.view
settings.manage

Superadmin receives all permissions.

Admin receives only permissions assigned by Superadmin.

Player receives only player permissions.

==================================================
AUDIT LOG
==================================================

Implement an MVP audit system using Local Storage.

Record:

- Login
- Logout
- Failed login
- Player creation
- Admin creation
- User suspension
- Permission changes
- Coin adjustments
- Ticket purchase
- Draw creation
- Draw changes
- Result creation
- Result publication
- Prize settlement
- Bonus claim
- Reward box opening
- Settings changes

Each audit entry should include:

- ID
- Actor ID
- Actor role
- Action
- Target
- Description
- Timestamp

For the MVP, this is a frontend simulation.

When migrating to Supabase, audit records should move to a proper database table with Row Level Security.

==================================================
NOTIFICATIONS
==================================================

Create an in-app notification system using Local Storage.

Player notifications:

- Ticket purchased
- Result published
- Winning ticket
- Prize received
- Bonus available
- Reward box available

Admin notifications:

- New player
- Pending result
- Important system event

Superadmin notifications:

- Admin activity
- Important system events
- Configuration changes

==================================================
SETTINGS
==================================================

Create configurable settings.

Examples:

- Application name
- Currency/coin name
- Ticket price
- Draw schedule
- Number rules
- Prize configuration
- Bonus settings
- Reward-box settings
- Theme settings

Settings should be managed through a centralized settings service.

Do not hard-code these values throughout the application.

==================================================
REPORTS
==================================================

Create frontend reports using Local Storage data.

Reports:

- Player report
- Ticket report
- Draw report
- Winner report
- Wallet transaction report
- Bonus report
- Reward report
- Admin activity report

Include:

- Search
- Filters
- Date filtering
- Status filtering
- CSV export where practical

==================================================
ERROR HANDLING
==================================================

Create a consistent application error system.

Handle:

- Invalid login
- Unauthorized access
- Invalid ticket
- Insufficient coins
- Draw closed
- Invalid result
- Duplicate operation
- Missing data
- Local Storage errors

Use user-friendly messages.

Do not expose internal implementation details.

==================================================
STATE MANAGEMENT
==================================================

Use a clean state architecture appropriate for a Vite React application.

Keep:

- Authentication state
- Current user
- Role
- Permissions
- Wallet state
- Draw state
- Notification state

centralized where appropriate.

Do not create excessive global state.

Keep business logic inside services/hooks rather than UI components.

==================================================
LOCAL STORAGE INITIALIZATION
==================================================

On first application launch:

1. Initialize storage.
2. Check storage version.
3. Create default settings.
4. Create demo users.
5. Create demo draws.
6. Create sample tickets.
7. Create sample results.
8. Create sample bonuses.
9. Create sample reward boxes.
10. Create sample notifications.
11. Create audit entries.

The demo data should make the application immediately testable.

Provide a development-only reset-data function so the entire Local Storage database can be reset.

==================================================
FUTURE SUPABASE MIGRATION
==================================================

Design the project specifically for future Supabase integration.

The future migration should involve replacing the repository/data implementations rather than rebuilding the UI.

Future Supabase tables can include:

users
profiles
roles
permissions
role_permissions
draws
tickets
ticket_items
results
wins
prizes
wallets
wallet_transactions
bonuses
bonus_claims
reward_boxes
reward_box_claims
notifications
audit_logs
settings
ticket_templates

Future Supabase Auth should replace the temporary Local Storage authentication.

Future Supabase Row Level Security should enforce:

SUPERADMIN
ADMIN
PLAYER

permissions at the database level.

Do not implement Supabase now.

Only make the architecture Supabase-ready.

==================================================
NO AI REQUIREMENT
==================================================

IMPORTANT:

This webapp does NOT require AI.

Do not add:

- AI chatbot
- AI assistant
- AI ticket generation
- AI lottery result extraction
- AI OCR
- AI image generation
- AI recommendation engine
- AI APIs
- OpenAI APIs
- Gemini APIs
- Claude APIs
- Any external AI service

The ticket visual system must be implemented using normal frontend components/assets/templates.

==================================================
SOURCE CODE REBUILD
==================================================

Before rebuilding, inspect the uploaded source carefully.

Identify:

- Existing pages
- Existing features
- Existing business rules
- Existing ticket behavior
- Existing draw behavior
- Existing player functionality
- Existing admin functionality
- Existing coin/wallet behavior
- Existing bonus logic
- Existing reward-box logic
- Existing result logic
- Existing ticket visual designs

Then rebuild those useful functions using the new Vite architecture.

Do not carry over unnecessary legacy code.

Do not recreate old PHP architecture.

Do not copy old security weaknesses.

==================================================
PROJECT QUALITY
==================================================

The final project should be:

- Clean
- Modular
- Maintainable
- Mobile-first
- Responsive
- Type-safe
- Component-based
- Supabase-ready
- Local Storage powered for MVP
- Easy to test
- Easy to extend

Avoid:

- Huge components
- Duplicate business logic
- Hard-coded user permissions
- Direct localStorage usage inside every component
- Hard-coded draw/prize values
- Hard-coded role behavior scattered across the app
- Unnecessary dependencies
- AI integrations
- Backend infrastructure for this MVP

==================================================
TESTING REQUIREMENTS
==================================================

Test all three roles.

SUPERADMIN:

- Login
- Dashboard
- Create Admin
- Edit Admin
- Assign permissions
- Manage players
- Manage draws
- Manage results
- Manage prizes
- Manage wallet
- View audit logs
- Manage settings

ADMIN:

- Login
- Access permitted modules
- Manage permitted players
- Manage permitted draws
- Manage permitted results
- Manage permitted tickets
- Perform permitted wallet operations
- Confirm that restricted modules are inaccessible

PLAYER:

- Register
- Login
- Dashboard
- View balance
- Claim bonus
- Play
- Quick Pick
- Buy ticket
- View tickets
- View results
- Receive simulated winnings
- View wallet transactions
- Open reward box
- View notifications
- Edit profile

Also test:

- Unauthorized route access
- Role switching attempts
- Invalid IDs
- Invalid ticket numbers
- Insufficient coins
- Closed draw purchase
- Duplicate prize settlement
- Duplicate bonus claim
- Duplicate reward-box opening
- Local Storage reset
- Page refresh persistence
- Mobile responsiveness

==================================================
FINAL REQUIREMENT
==================================================

Build this as a Vite-based, React/TypeScript, mobile-first application.

For this testing/MVP version:

VITE = APPLICATION BUILD TOOL
REACT + TYPESCRIPT = FRONTEND
LOCAL STORAGE = TEMPORARY DATA PERSISTENCE
SUPABASE = FUTURE DATABASE/AUTH BACKEND

The architecture must make the future Local Storage → Supabase migration straightforward.

The application must contain three clearly separated roles:

SUPERADMIN
ADMIN
PLAYER

Superadmin controls the system.

Admin operates only within assigned permissions.

Player uses the gaming/player functionality only.

No AI functionality is required anywhere in the application.
