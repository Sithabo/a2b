# A2B Shipper Screens and Flows Specification

This document details all screens, form fields, algorithms, and navigation pathways for the **Shipper** persona in the A2B logistics application. 

---

## 1. Authentication & Onboarding Flow

This phase takes a new user from their first open, helps them select the "Shipper" role, verify their phone number, and register their business details.

### Screen 1.1: Carousel / Onboarding
* **Path**: `app/(auth)/onboarding.tsx`
* **Purpose**: Introduce the core value propositions of the platform.
* **Layout & Fields**:
  * **Swipeable Carousel (3 Slides)**:
    1. **Reliable Logistics**: *"Connect with trusted drivers and shippers for seamless transport solutions across the country."* (Forest Green theme theme color `#0F3D26`)
    2. **Secure Payments**: *"Experience peace of mind with our integrated mobile money and secure payment systems."* (Amber theme theme color `#D97706`)
    3. **Real-time Tracking**: *"Monitor your cargo in real-time with our advanced GPS tracking features."* (Forest Green theme theme color `#0F3D26`)
  * **Dot Indicators**: Highlights the current slide. Tapping a dot scrolls directly to that slide.
* **Action Buttons**:
  * **Next / Get Started**: Progresses through the slides. On the final slide, this changes to **"Get Started"** which completes the onboarding state in `useAuthStore` and redirects to Welcome (`/(auth)/welcome`).
  * **Skip**: Bypasses onboarding immediately, sets `hasCompletedOnboarding: true`, and navigates to Welcome (`/(auth)/welcome`).

### Screen 1.2: Welcome & Role Selection
* **Path**: `app/(auth)/welcome.tsx`
* **Purpose**: Let the user declare their role (Shipper vs. Driver) which configures the store.
* **Layout & Fields**:
  * Brand illustration logo: `assets/logo/a2b.png`
  * Heading: *"Choose Your Role"*
  * Subheading: *"Are you sending goods across Uganda or delivering them? Select your role to get started with A2B."*
* **Action Buttons**:
  * **"I am a Shipper"** (Lime Green `#A3E635`, dark text): Sets the route parameter `role: "shipper"` and redirects to Login (`/(auth)/login?role=shipper`).
  * **"I am a Driver"** (Transparent with Forest Green border `#0F3D26`): Sets the route parameter `role: "driver"` and redirects to Login (`/(auth)/login?role=driver`).

### Screen 1.3: Enter Phone Number (Login)
* **Path**: `app/(auth)/login.tsx`
* **Purpose**: Input phone number to request a security verification SMS.
* **Layout & Fields**:
  * Header showing selected role: e.g. *"Verify with SMS to continue as a shipper."*
  * **Phone Number Field**: 
    * Country Code Picker Modal (using `react-native-country-picker-modal`, defaults to Uganda code `+256` / `UG` with flag).
    * Number input box with placeholder `700 000 000` (max length 15).
  * Validation: Parses the phone number using `libphonenumber-js`. Displays red error text if the number is invalid.
* **Action Buttons**:
  * **"Send SMS Code"** (Dark grey `#4B5563`): Calls simulated API to generate an OTP. Redirects to Verify OTP (`/(auth)/verify-otp?role=shipper&method=sms&phone=+256...`).
  * **Back Button** (Circular arrow icon): Returns to Welcome role selection.

### Screen 1.4: OTP Verification
* **Path**: `app/(auth)/verify-otp.tsx`
* **Purpose**: Verification of the SMS security code.
* **Layout & Fields**:
  * Header stating: *"We sent a code to [Phone Number]."*
  * **Developer Hint Box** (Debug helper): Displays the generated 6-digit number to bypass SMS mock.
  * **Code Input Box**: Centered, large bold numeric field (length 6, placeholder `000000`) with letter-spacing spacing.
  * Validation: Validates that the input matches the randomly generated code. Displays red error text on mismatch.
* **Action Buttons**:
  * **"Verify & Continue"** (Dark Green): Disabled until 6 digits are typed. Performs mock authentication verification. Since the role parameter is `"shipper"`, it routes to Business Details (`/(auth)/business-details?role=shipper&phone=+256...`).
  * **"Resend Code"** (Underlined text): Triggers a new random code and resets inputs.
  * **Back Button**: Returns to Phone Input screen.

### Screen 1.5: Business Details Registration
* **Path**: `app/(auth)/business-details.tsx`
* **Purpose**: Final registration step for Shippers to supply corporate credentials.
* **Layout & Fields**:
  * Heading: *"Business Details"*
  * **Company / Trading Name** (Text field with Building icon): Input for company moniker (e.g. *"Acme Logistics"*).
  * **Preferred Operating Region** (Text field with MapPin icon): Input for headquarters or hub location (e.g. *"Nairobi Hub"* or *"Kampala Central"*).
* **Action Buttons**:
  * **"Complete Registration"** (Forest Green): Disabled until both fields have inputs. Submits user details to `useAuthStore.signUp` (sets credentials, changes `isLoggedIn` to true), and redirects user directly into the main app dashboard tab layout (`/(tabs)`).
  * **Back Button**: Returns to OTP Verification.

---

## 2. Core Dashboard & Navigation Tabs

After logging in, Shippers interact with the app via a 5-tab layout (`app/(tabs)/_layout.tsx`) utilizing a floating primary button.

### Screen 2.1: Shipper Dashboard (Home Tab)
* **Path**: `app/(tabs)/index.tsx`
* **Purpose**: View profile stats, look up active shipments, and navigate to calculation tools.
* **Layout & Components**:
  * **Linear Gradient Background**: Transitions from dark forest green top header to light grey background.
  * **Header Row**:
    * Avatar circle: Displays the profile photo (uploaded in settings) or a user icon.
    * Greeting: *"Hey [First Name]"* (parsed from company name).
    * Location Indicator: Displays user's preferred region.
    * Bell Notification button.
  * **Search Bar**: Text input field with Search icon to search cargo listings.
  * **Current Tracking Card (`TrackingCard.tsx`)**:
    * Highlights the primary in-progress active delivery (e.g. `"#H62J568107"`).
    * Displays destination, status (*"In Transit"*), and horizontal progress fill bar at `66%` with a floating truck badge.
    * Tapping this card routes to **Active Delivery** page (`/active-delivery`).
  * **Action Tools Grid**:
    * Large square **"Calculate Shipping Cost"** card (`ToolCard.tsx`) with Calculator icon. Routes to the **Shipping Calculator** flow.
  * **Recent Shipping Section**:
    * Displays list card of recent shipments with thumbnail package icon, date, tracking ID, and mini progress bar. Tapping a card routes to **Active Delivery** tracking.

### Screen 2.2: Pending Shipments (Orders Tab)
* **Path**: `app/(tabs)/receipts.tsx`
* **Purpose**: View and filter loads that are either open (waiting for driver) or paid & active.
* **Layout & Components**:
  * **Section 1: "Waiting for Driver"** (Amber clock icon):
    * Badge showing counts of open requests.
    * Lists open shipments with metadata.
    * Tapping a card routes to **Pending Order Details** (`/pending-delivery`).
  * **Section 2: "Paid & Active"** (Green check circle icon):
    * Badge showing active shipments count.
    * Lists ongoing or completed deliveries.
    * Tapping a card routes to **Active Delivery Details** (`/active-delivery`).

### Screen 2.3: Inbox (Inbox Tab)
* **Path**: `app/(tabs)/inbox.tsx`
* **Purpose**: View secure messaging threads with drivers and customer service support.
* **Layout**: Displays a simple placeholder list stating *"No new messages!"* styled with a Forest Green gradient header.

### Screen 2.4: Account Profile & Settings (Account Tab)
* **Path**: `app/(tabs)/account.tsx`
* **Purpose**: Manage profile details, security settings, payment details, and support utilities.
* **Layout & Components**:
  * **Warning Banner**: Appears at the top if no email address is linked to the account: *"Please add your email address to secure your account."*
  * **Profile Header Card**:
    * Displays profile picture, Company Name, and email address (shows red *"No Email Added"* warning text if blank).
    * Pencil Edit button: Opens the **Edit Profile Bottom Sheet Modal**.
  * **Edit Profile Bottom Sheet Modal**:
    * Centered avatar selector (triggers `expo-image-picker` library to browse device images).
    * Form inputs for: **Company Name**, **Operating Region**, and **Email Address**.
    * **"Enable Port Pickups / Imports"** Toggle Switch: Toggles the shipper's importer status.
    * **GRA Tax Identification Number (TIN)**: Visible only if "Enable Port Pickups / Imports" is enabled. Validates that the input is a valid 9-digit number. Show warning text if invalid: *"Valid 9-digit GRA Tax Identification Number required to bypass customs processing constraints."*
    * **"Save Details"** button: Displays a loading indicator spinner for 2 seconds while updating Zustand storage, then dismisses.
  * **Menu Actions Card (General Section)**:
    * **Business Details**: *(Commented out/hidden in the current UI)*.
    * **Payment Methods**: Tapping routes to the Payment Methods screen (`/payment-methods`).
    * **Language**: Tapping opens selection modal.
    * **Notifications**: Configures preferences.
  * **Menu Actions Card (Support Section)**:
    * **How A2B Works**: Interactive walkthrough.
    * **Need help? Let's chat**: Activates live support chat.
    * **Privacy Policy**: Static agreement documents.
    * **"Call A2B Support" Button** (Forest Green, PhoneCall icon): Initiates telephone call dialer to customer support.
  * **Log Out Button** (Red icon and text): Logs user out of store, resets active state, and routes to Login screen.

---

## 3. Payments & Address Settings Flow

This sub-flow manages payment options and business pick-up addresses.

### Screen 3.1: Payment Methods Management
* **Path**: `app/payment-methods/index.tsx`
* **Purpose**: View cards linked to account and select default payment method.
* **Layout & Fields**:
  * **Saved Credit Cards List**:
    * Renders card type icon (Visa, Mastercard, Amex, Discover) based on card number.
    * Displays cardholder name and masked number (`******** 1234`).
    * Checkmark icon next to default card.
  * **Business Address Card**:
    * Shortcut showing the default business address. Tapping navigates to Addresses list.
* **Action Buttons / Modals**:
  * **"Add Payment Method" Button**: Opens the **Add Card Bottom Sheet Modal**.
    * Contains interactive credit card graphic (`react-native-credit-card-input` view).
    * Text fields for: **Card Number**, **Expiry Date**, **CVC**, and **Cardholder Name**.
    * Validation: Primary button remains disabled until card fields pass validation.
    * Saving card details pushes new card state into `useBillingStore` and routes to the **Payment Status Success Screen** (`/payment-methods/status?state=confirmed`).

### Screen 3.2: Business Addresses Management
* **Path**: `app/payment-methods/addresses.tsx`
* **Purpose**: Create, edit, and delete warehouses/headquarters pick-up locations.
* **Layout & Fields**:
  * **Addresses List**: Shows saved locations with custom titles (e.g. *"Headquarters"*, *"Kampala Warehouse"*).
  * Radio indicator selects default pick-up point.
* **Action Buttons / Modals**:
  * **"Add New Address" Button**: Opens the Add Address Modal.
    * Input field: **Title (e.g. Headquarters)**.
    * Multiline input: **Full Address**.
    * If editing an existing address, a red trash icon **"Delete"** button is displayed.
    * Tapping **"Save Address"** stores details in Zustand store.

### Screen 3.3: Payment Status Confirmation
* **Path**: `app/payment-methods/status.tsx`
* **Purpose**: Success page displayed after securely verifying a credit card.
* **Layout & Components**:
  * **Status Hero**: Centered graphical checkmark circle or cross icon.
  * Heading: *"Payment Method Added!"* (or *"Failed to Add Card"*).
  * **Receipt Breakdown Card**:
    * Verification status: *"Successful"* or *"Declined"*.
    * Date timestamp.
    * Vault status label.
  * **Action Button**: *"Back to Payment Methods"* (routes back to payment list).

---

## 4. Fair Price Shipping Calculator Flow

A specialized utility helping shippers determine appropriate bid rates for their cargo.

### Screen 4.1: Calculator Inputs
* **Path**: `app/calculator/index.tsx`
* **Purpose**: Provide details of the planned haul to run the price estimation script.
* **Layout & Input Fields**:
  1. **Distance Field**:
     * TextInput box + horizontal slider (ranges `0` to `1000` km, default `150` km).
  2. **Cargo Weight Field**:
     * TextInput box + horizontal slider (ranges `0.5` to `40` tons, default `10` tons).
  3. **Truck Type Selection**:
     * Segmented horizontal toggle buttons (Pills) choosing: **"Pickup"**, **"Canter"**, **"Fuso"**, or **"Trailer"** (default Canter).
  4. **Urgency / Demand Premium**:
     * TextInput box + horizontal slider (ranges `0%` to `50%` markup, default `0%`).
* **Action Button**:
  * **"Calculate"** (Dark charcoal grey): Submits parameter variables as query params to the results page (`/calculator/results?distance=...&weight=...&truckType=...&urgency=...`).

### Screen 4.2: Calculator Results & Suggested Offer
* **Path**: `app/calculator/results.tsx`
* **Purpose**: Render cost breakdowns and display suggested bid price.
* **Algorithm & Formulas**:
  The calculation code processes estimations in Ugandan Shillings (UGX) using these rules:
  
  * **Base Parameters**:
    * Distance Base Rate: `1,500` UGX per km.
    * Weight Surcharge Rate: `100` UGX per ton-km.
    * Flat Vehicle Flat Fee:
      * **Pickup**: `50,000` UGX
      * **Canter**: `100,000` UGX
      * **Fuso**: `200,000` UGX
      * **Trailer**: `400,000` UGX
  
  * **Formulas**:
    $$\text{Distance Cost} = \text{Distance (km)} \times 1,500$$
    $$\text{Weight Cost} = \text{Distance (km)} \times \text{Weight (tons)} \times 100$$
    $$\text{Subtotal} = \text{Distance Cost} + \text{Weight Cost} + \text{Vehicle Flat Fee}$$
    $$\text{Urgency Premium} = \text{Subtotal} \times \left( \frac{\text{Urgency Premium \%}}{100} \right)$$
    $$\text{Total Cost Suggested Offer} = \text{Subtotal} + \text{Urgency Premium}$$

  * **Interactive Chart**:
    * An SVG circular progress doughnut chart displays segments color-coded by cost category:
      * **Distance Cost**: Light Purple (`#A78BFA`)
      * **Weight Surcharge**: Emerald Green (`#34D399`)
      * **Vehicle Premium**: Amber Yellow (`#FBBF24`)
      * **Urgency / Demand**: Coral Red (`#F87171`)
    * Doughnut center displays: *"UGX [Formatted Total Cost]"*.
  * **Itemized List Card**: Shows formatted amounts for each cost segment.
* **Action Buttons**:
  * **"Recalculate"**: Navigates back to input forms to refine variables.

---

## 5. Post a Load (Create Load) Flow

This primary flow compiles cargo information and uploads a live request.

### Screen 5.1: Create Load - Step 1: Route Selection
* **Path**: `app/create-load/index.tsx`
* **Purpose**: Select route origins and destinations.
* **Layout & Form Fields**:
  * **Location Routing (`LocationPicker.tsx`)**:
    * **Start Location**: Text field representing initial pickup spot.
    * **Where (Destination)**: Text field representing drop-off spot.
    * **Swap Button** (Circular arrow icon): Exchanges start and end values.
  * **Location autocomplete modal (`LocationSearchModal.tsx`)**: Opens autocomplete search when tapping on pick-up or drop-off fields.
  * **Port Pickup Interstitial Verification Modal**: If the selected pick-up location is a port node (e.g., Georgetown Port, wharves), a modal overlay alert is triggered stating: *"⚓ Port Pickup Verified. This shipment originates from a customs-controlled zone. A2B will require valid clearing documentation (Form C21/Bill of Lading) on Step 2 to bypass port gates seamlessly."*
* **Action Buttons**:
  * **"NEXT: CARGO DETAILS"**: Saves route states (`pickupLocation`, `dropoffLocation`, `isImportFlow`) and routes to Cargo Details (`/create-load/cargo-details`).

### Screen 5.2: Create Load - Step 2: Cargo Details
* **Path**: `app/create-load/cargo-details.tsx`
* **Purpose**: Configure cargo type-specific options, schedule booking, and define the custom offer price.
* **Sub-steps & Wizard Fields**:
  1. **Cargo Details (Part 1 of 3)**:
     * **Cargo Type Selection (`LoadTypeSelector.tsx`)**: Horizontal selection choosing:
       * **General Cargo**: Toggles the Packages List (`PackageForm.tsx`) where shippers can add multiple package items. Fields include description, weight, and length x width x height dimensions.
       * **Heavy Machinery**: Displays Machinery Weight (Tons), width, height, "Requires Flatbed/Lowboy" checkbox, and "Requires Hydraulic Tipper" checkbox. Shows yellow notification card: *"Zero-Rated Status: This cargo qualifies for GRA Tax Concessions. A GO-Invest letter will be required in the Document Vault."*
       * **Chemicals & Pharma**: Displays Chemicals Weight (Tons), Volume (m³), Containment Unit selector (Tanker, IBC Totes, Drums, Pallets), and red warning banner: *"Hazard Tracking: This load requires verified clearance from the Pesticide, Toxic Chemicals Control Department (PTCCD)."*
       * **Food & Beverages**: Displays Food Weight (Tons), Volume (m³), Storage Environment segmented control (Ambient, Chilled, Frozen), and blue info block: *"GA-FDD Regulations: Requires certified safe-handling paperwork or US FDA state commerce certificates."*
  2. **Booking Schedule (Part 2 of 3)**:
     * **Pickup Date** & **Delivery Date**: Date pickers.
     * **Delivery Time**: Time picker.
     * **Pickup Window**: Segmented controls choosing *Early Morning* (06:00 AM), *Mid Day* (10:00 AM), or *Afternoon* (02:00 PM) (Visible for domestic hauls only).
  3. **Set Offer (Part 3 of 3) (`OfferSlider.tsx`)**:
     * Price Slider to adjust offer price (default: `150,000` UGX).
     * **Surcharges Breakdown**: Shows dynamic surcharges added to the price breakdown based on cargo selection:
       * General Cargo: `📄 Import License Surcharge` (`10,000` UGX).
       * Heavy Machinery: `🏗️ Capital Equipment Concession` (`30,000` UGX), `🚛 Route Clearance Surcharge` (`15,000` UGX), `⚖️ Tipper Gate Fee` (`10,000` UGX).
       * Chemicals & Pharma: `🧪 PTCCD Hazard Clearance` (`45,000` UGX).
       * Food & Beverages: `GA-FDD Safe-Handling` (`Frozen`: `35,000` UGX, `Chilled`: `25,000` UGX, `Ambient`: `15,000` UGX).
* **Action Buttons / Modals**:
  * **"NEXT: DOCUMENT VAULT"**: If `isImportFlow` is true, routes to compliance vault (`/create-load/document-vault`).
  * **"REQUEST PICKUP"**: If domestic flow, launches **Review Order Bottom Sheet Modal** (which displays summary card `OrderSummary.tsx`). Tapping **"Finalize order"** calls `addShipment` to save order to store, and routes to `/create-load/status?state=confirmed`.

### Screen 5.3: Create Load - Step 3: Compliance Vault (Import Flow Only)
* **Path**: `app/create-load/document-vault.tsx`
* **Purpose**: Input customs reference and verify compliance documents prior to posting port loads.
* **Layout & Fields**:
  * **Customs Reference / Container ID**: Text input field (e.g. *CON-GY-82195*).
  * **Compliance Documents Checklist**: Rows of upload cards indicating document verification status:
    1. **Bill of Lading / Airway Bill** (Mandatory)
    2. **Original Certified Invoice** (Mandatory)
    3. **Customs Release Clearance** (Mandatory)
    4. **GO-Invest Tax Waiver Concession** (Conditional, visible only if `requiresGoInvestWaiver === true`).
  * **Interactive Scanner Flow**:
    * Tapping an empty slot opens the device camera view (`expo-image-picker`).
    * After image capture, overlays a modal spinner loader displaying: *"Applying Grayscale Enhancement... Optimizing stamps & signatures contrast"* for 1.5 seconds.
    * Saves the document image permanently to local file storage (`compliance_docs/` folder).
    * Shows options sheet to: **View Document Scan** (launches visual full screen Document Viewer Modal), **Replace / Retake Scan**, or **Remove Document**.
* **Action Button**:
  * **"Complete Import Verification"** (Disabled until all required fields and documents are uploaded): Calls `addShipment` to save the import load to store and routes to `/create-load/status?state=confirmed`.

### Screen 5.4: Post Load Success Status
* **Path**: `app/create-load/status.tsx`
* **Purpose**: Confirm load is uploaded and show dynamic escrow billing receipt.
* **Layout & Components**:
  * Centered green success checkmark circle.
  * Headline: *"Load Posted Successfully!"*
  * Subheading: *"Your offer is now live for drivers"*
  * **Dynamic Billing Receipt Card**:
    * Payment Status: *"Escrow Secured"*
    * Date: Shows the actual timestamp retrieved dynamically from the saved shipment.
    * Load ID: Displays the actual generated unique order ID from the store.
    * Your Offer & Total: Shows the dynamic offer price formatted with thousands separator (e.g. `200,000 UGX` instead of hardcoded `150,000 UGX`).
* **Action Button**:
  * **"Back to Home"**: Redirects user to Dashboard home tab (`/(tabs)`).

---

## 6. Driver Match & Escrow Payment Flow

Triggers when a driver accepts an open load, requesting the shipper to fund the escrow wallet.

### Screen 6.1: Driver Accepted & Deposit Request
* **Path**: `app/match-pay/driver-found.tsx`
* **Purpose**: Inform shipper a driver has accepted and request they place deposit funds in escrow to unlock credentials.
* **Layout & Components**:
  * Headline: *"Driver Accepted!"*
  * Subheading: *"A verified driver is ready to pick up your load"*
  * **Action Required Warning Banner**: *"Deposit funds to unlock driver details and confirm pickup"*
  * **Amount Card**: Large display stating *"Amount to Deposit: 150,000 UGX"*.
  * **Escrow Information Box**: *"Escrow Protection: Money is held safely. Driver only gets paid upon confirmed delivery."*
* **Action Buttons**:
  * **"Deposit 150,000 UGX to Unlock Driver"**: Routes to payment options (`/match-pay/payment`).
  * **"Cancel & Go Back"**: Returns to Dashboard.

### Screen 6.2: Choose Escrow Payment Method
* **Path**: `app/match-pay/payment.tsx`
* **Purpose**: Select the funding source for the escrow transaction.
* **Layout & Fields**:
  * Header: *"Choose Payment Method"*, subtitle: *"Select how you want to pay the driver"*
  * Amount Box: *"Amount to Pay Driver: 150,000 UGX"*
  * **Payment Methods Rows**:
    1. **MTN Mobile Money**: Styled with yellow background and black branding text.
    2. **Airtel Money**: Styled with red background and white branding text.
    3. **Debit/Credit Card**: Styled with dark grey card icon.
  * Footer: Lock icon confirming escrow security.
* **Action Navigation**:
  * Tapping a payment method row applies a highlight outline and navigates to the confirmation page (`/match-pay/confirmed`).

### Screen 6.3: Escrow Deposit Secured (Unlocked)
* **Path**: `app/match-pay/confirmed.tsx`
* **Purpose**: Confirm successful escrow payment and unlock driver contact options.
* **Layout & Components**:
  * Centered green check circle icon.
  * Headline: *"Payment Confirmed!"*, subtitle: *"Your deposit is secured in escrow"*.
  * **Deposit Box**: Displays amount (*"150,000 UGX"*) and selected method (*"via MTN Mobile Money"*).
  * Info Box: *"Driver details have been unlocked and they are heading to pickup. You will receive updates as they progress through the delivery."*
* **Action Buttons**:
  * **"Call Driver"** (Forest Green with Phone icon): Launches call log with driver's mobile number.
  * **"See Pending Shipments"** (Bordered transparent button): Routes to Orders Tab (`/receipts`).

---

## 7. Active Delivery & Release Funds Flow

Monitors transit states and triggers the release of escrow funds.

### Screen 7.1: Active Delivery / In-Transit Tracking
* **Path**: `app/active-delivery.tsx`
* **Purpose**: Real-time status tracker and milestone visualizer for shipments currently en route.
* **Layout & Components**:
  * **Top Summary Card**:
    * Cargo Type Name (e.g. *General Cargo*, *Heavy Machinery*, etc.).
    * Row showing tracking ID with a **Copy Tracking ID** clipboard button.
  * **Specs Details Card**: Grey box showing:
    * From Location Name.
    * Destination Location Name.
    * Driver Name (e.g. *Guy Hawkins*).
    * Cargo Weight (e.g. *250 KG*).
    * Current Status.
  * **Driver Contact Card (`DriverContactCard.tsx`)**:
    * Displays Driver avatar, name, and ratings.
    * Contains Call/Message quick buttons to dial or text the driver directly.
    * **Interactive Modal Click**: Tapping this card opens the **Driver & Vehicle Details Bottom Sheet Modal**, rendering:
      * Driver avatar, name, rating (*4.9*), and completed deliveries (*124 deliveries*).
      * Vehicle Info: Vehicle Type (*Lorry (Medium)*), Capacity (*5 Tons*), Make & Model (*Isuzu FRR*), Yellow plate layout number plate box (*UAM 456K*), Cargo Area size (*5.4m x 2.2m x 2.1m*), and active & insured compliance status.
  * **Vertical Milestone Stepper Timeline (`MilestoneTimeline.tsx`)**:
    * Replaces the map view with a vertical timeline representing the 7 key logistics states:
      1. **Driver Dispatched** (Origin base hub location details).
      2. **Gate-In / Arrival at Origin** (Port terminal entrance or pickup address).
      3. **Loaded & Cleared Customs** (Origin exit gate, customs release stamp confirmation).
      4. **Major Infrastructure Nodes** (Passed Mukono Weighbridge or Linden Weighbridge checking axle weight).
      5. **The Proximity Buffer** (Proximity alert on outskirts of destination, e.g. Lugazi Outskirts).
      6. **Arrival at Destination** (Backed into receiving unloading dock).
      7. **Cargo Signed & Confirmed** (Proof of delivery photo/document uploaded).
    * Each step displays the estimated or actual timestamp, location, and verified gate status.
  * **Milestone Simulator Control Card**:
    * A debugging component visible to simulate updates:
      * **"Advance Milestone"** Button: Toggles the timeline to the next state.
      * **"Reset Progress"** Button: Restores timeline state to the beginning.
* **Action Button**:
  * **"Confirm Delivery"** (Sticky bottom floating button): Navigates to `/confirm-delivery`.

### Screen 7.2: Pending Delivery Details
* **Path**: `app/pending-delivery.tsx`
* **Purpose**: View summary of posted loads that have not yet been accepted by a driver.
* **Layout & Components**:
  * Floating amber header badge: *"Waiting for Driver"* with a clock icon.
  * **Receipt-Style Card Layout** (Features left & right circular border cutouts):
    * Thumbnail cargo box drawing and large price text showing the dynamic offer price (e.g., *"150,000 UGX"*).
    * Dashed horizontal cutout dividing line.
    * Metadata lines: Order ID, Date Posted, and Payment Status (*"Escrow Secured"* badge).
    * Solid horizontal line divider.
    * Pickup & drop-off locations timeline.
    * Tip Box: *"Your offer is within the fair market range for this route."*

### Screen 7.3: Confirm Arrival Dialog
* **Path**: `app/confirm-delivery.tsx`
* **Purpose**: Verification portal preventing premature releasing of funds.
* **Layout & Components**:
  * Large cargo box illustration.
  * Headline: *"Have your goods arrived safely?"*
* **Action Buttons**:
  * **"Yes, I have received them"** (Forest Green pill): Navigates to funds release page (`/release-funds`).
  * **"Not yet"** (Transparent pill, dark border): Navigates back to active tracking.
  * Footer: Shield icon saying *"Funds are only released after confirmation."*

### Screen 7.4: Authorize Escrow Release (6-Digit Code)
* **Path**: `app/release-funds.tsx`
* **Purpose**: Displays the unique 6-digit payment code that the shipper must hand to the driver to claim funds.
* **Layout & Components**:
  * Instruction: *"Give this 6-digit code to the driver to release payment."*
  * **Code Display Box**: Centered white panel showing **"482 915"** in large green numbers.
  * **Demo Simulator Button**: *"[Demo: Simulate Driver Entering Code]"*. Clicking this simulates the driver typing the code on their device, which updates the database state to completed and pushes the shipper to the Receipt screen (`/official-receipt`).
  * Expiry countdown timer: *"Expires in 09:52"*.
  * Warning label: *"Only give this code if you have inspected your goods."*
* **Action Buttons**:
  * **"Remake Code"** (Forest Green pill): Regenerates a new 6-digit escrow code.
  * **"Go Back"** (Text button): Returns to previous screen.

### Screen 7.5: Official Receipt & Complete Summary
* **Path**: `app/official-receipt.tsx`
* **Purpose**: Summary of completed deliveries and transaction logs.
* **Layout & Components**:
  * Success circular checkmark check icon.
  * Title text: *"Job Completed!"*
  * **Receipt Card**:
    * Transaction ID: e.g. `#A2B-TXN-882`.
    * Driver Name: *John Mukasa*.
    * Route: *Kampala, Central* to *Jinja, Industrial Area*.
    * Vehicle details: *Fuso Fighter (UAM 456K)*.
    * Category: *General Cargo (Sacks)*.
    * Funding source: *MTN Mobile Money*.
    * Dashed horizontal line with round left/right side cutouts.
    * Price: *"Amount Paid"* displaying the dynamic amount paid (e.g. *"150,000 UGX"*).
* **Action Buttons**:
  * **"Download PDF"** (Outlined, document icon): Downloads invoice.
  * **"Share via WhatsApp"** (Outlined, share icon).
  * **"Back to Home"** (Forest Green primary button): Returns to Dashboard home tab.
