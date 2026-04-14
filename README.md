# PENRO-DENR Asset Depreciation System

A comprehensive single-page web application for managing and calculating asset depreciation for the Philippine Department of Environment and Natural Resources (DENR) - Provincial Environment and Natural Resources Office (PENRO).

## Features

- **Dashboard**: Real-time overview of assets with charts and statistics
- **Asset Management**: Add, edit, and manage asset information
- **Automatic Calculations**: Real-time depreciation calculations using straight-line method
- **Property Number Formatting**: Auto-formatting for both alphanumeric and numeric property numbers
- **Date Input**: YYYY/MM/DD format with automatic formatting
- **Reports**: Generate various depreciation and asset reports
- **Export Functionality**: CSV export for data analysis
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technical Stack

- **Frontend**: React 18 with hooks
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom PENRO-DENR theme
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React icons

## Asset Management Features

### Asset Information Fields
- Property Number (auto-formatted with hyphens)
- Date Acquired (YYYY/MM/DD format)
- Office Description
- PPE Class with auto-populated Account Code and Useful Life
- Office selection
- Fund Cluster selection
- Status toggle (Serviceable/Unserviceable)
- Unit Cost and Quantity
- Automatic Total Cost calculation
- Residual Value (5% of total cost)
- Depreciable Amount (Total Cost - Residual Value)
- Annual and Monthly Depreciation
- Accumulated Depreciation
- Net Book Value
- Remarks

### Calculation Methods
- **Straight Line Depreciation**: Primary method for all assets
- **5% Residual Value**: Applied to all asset types
- **Non-Depreciable Assets**: Special handling for assets without useful life
- **Real-time Updates**: Automatic recalculation on data changes

### Property Number Formatting
- **Smart Detection**: Automatically detects letter-based vs number-based formats
- **Letter Format**: XX-XXXX-YYYY-MM-DD (e.g., CI-SPHV-2025-08-03)
- **Number Format**: YYYY-MM-DD-XXXX-XX (e.g., 2025-05-0002-02)
- **Auto-insertion**: Hyphens automatically placed at correct positions

## PPE Classes Supported

- Land (10601010) - Non-depreciable
- Land Improvements, Reforestation Projects (10602020) - Non-depreciable
- Buildings (10604010) - 30 years useful life
- Building Improvements (10604020) - 10 years useful life
- Machinery and Equipment (10605010) - 10 years useful life
- Furniture, Fixtures and Equipment (10605020) - 8 years useful life
- Motor Vehicles (10605030) - 5 years useful life
- Office Equipment (10605040) - 5 years useful life
- Computer Equipment (10605050) - 3 years useful life
- Other Property, Plant and Equipment (10605090) - 5 years useful life

## Offices Supported

- PENRO
- INITAO
- GINGOOG
- BALATUKAN
- MIMBILISAN
- ILPLS
- INREMP

## Fund Clusters

- Regular Agency Fund
- Foreign Assisted Projects Fund
- Special Account Fund
- Trust Fund
- Revolving Fund

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Open Application**:
   Navigate to `http://localhost:5173`

## Build for Production

```bash
npm run build
```

## Deployment

The application is configured for deployment on Vercel:

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

## File Structure

```
depreciate/
├── src/
│   ├── components/
│   │   ├── AssetForm.jsx      # Main asset form with calculations
│   │   ├── AssetList.jsx      # Asset listing with filters
│   │   ├── Dashboard.jsx      # Dashboard with charts
│   │   ├── Header.jsx         # Application header
│   │   ├── Reports.jsx        # Report generation
│   │   └── Sidebar.jsx        # Navigation sidebar
│   ├── App.jsx                # Main application component
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global styles
├── index.html                  # HTML template
├── package.json               # Project dependencies
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
└── README.md                  # This file
```

## Features Implementation

### Property Number Auto-Formatting
- Supports both alphanumeric and numeric property numbers
- Smart detection of format type (letter-based vs number-based)
- Automatic hyphen insertion at correct positions
- Real-time formatting as user types

### Depreciation Calculations
- Straight-line method for all assets
- 5% residual value for all asset types
- Special handling for non-depreciable assets
- Real-time calculation updates
- Accumulated depreciation based on years elapsed

### User Interface
- Clean, modern design with PENRO-DENR branding
- Responsive layout for all device sizes
- Interactive charts and data visualization
- Form validation and error handling
- Export functionality for data analysis

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Modern browsers with ES6+ support

## License

© 2024 PENRO-DENR. All rights reserved.
