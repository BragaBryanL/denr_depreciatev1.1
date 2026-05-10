# Automatic Monthly Depreciation Update System

## Overview
Yes, it's absolutely possible to automatically update depreciation values every month! Here's a comprehensive solution.

## Implementation Options

### Option 1: Backend Cron Job (Recommended for Production)

#### **Node.js Backend with Cron Job**
```javascript
// depreciation-service.js
const cron = require('node-cron');
const db = require('./database'); // Your database connection

// Run on the 1st of every month at 2:00 AM
cron.schedule('0 2 1 * *', async () => {
  console.log('Running monthly depreciation update...');
  await updateAllDepreciation();
});

async function updateAllDepreciation() {
  try {
    // Get all assets with depreciation
    const assets = await db.query(`
      SELECT property_id, date_acquired, cost, useful_life, accumulated_depreciation, 
             annual_depreciation, status
      FROM assets 
      WHERE useful_life != 'Indefinite' AND status = 'Serviceable'
    `);

    const updates = [];
    
    for (const asset of assets) {
      const newValues = calculateUpdatedDepreciation(asset);
      
      if (newValues.hasChanged) {
        updates.push({
          propertyId: asset.property_id,
          accumulatedDepreciation: newValues.accumulatedDepreciation,
          netBookValue: newValues.netBookValue,
          monthlyDepreciation: newValues.monthlyDepreciation
        });
        
        // Log the update
        await logDepreciationUpdate(asset.property_id, newValues);
      }
    }
    
    // Batch update all assets
    if (updates.length > 0) {
      await batchUpdateDepreciation(updates);
      console.log(`Updated ${updates.length} assets with new depreciation values`);
    }
    
  } catch (error) {
    console.error('Error updating depreciation:', error);
  }
}

function calculateUpdatedDepreciation(asset) {
  const acquiredDate = new Date(asset.date_acquired);
  const currentDate = new Date();
  const yearsElapsed = (currentDate - acquiredDate) / (365.25 * 24 * 60 * 60 * 1000);
  const monthsElapsed = yearsElapsed * 12;
  
  const monthlyDepreciation = asset.annual_depreciation / 12;
  const maxDepreciation = asset.cost - (asset.cost * 0.1); // 10% residual
  const newAccumulatedDepreciation = Math.min(
    monthlyDepreciation * monthsElapsed, 
    maxDepreciation
  );
  const newNetBookValue = asset.cost - newAccumulatedDepreciation;
  
  const hasChanged = Math.abs(newAccumulatedDepreciation - asset.accumulated_depreciation) > 0.01;
  
  return {
    accumulatedDepreciation: newAccumulatedDepreciation,
    netBookValue: newNetBookValue,
    monthlyDepreciation: monthlyDepreciation,
    hasChanged: hasChanged
  };
}

async function batchUpdateDepreciation(updates) {
  const query = `
    UPDATE assets 
    SET accumulated_depreciation = ?, net_book_value = ?, updated_date = NOW()
    WHERE property_id = ?
  `;
  
  for (const update of updates) {
    await db.query(query, [
      update.accumulatedDepreciation,
      update.netBookValue,
      update.propertyId
    ]);
  }
}

async function logDepreciationUpdate(assetId, values) {
  await db.query(`
    INSERT INTO depreciation_log (asset_id, old_accumulated, new_accumulated, 
                                  monthly_depreciation, update_date)
    VALUES (?, ?, ?, ?, NOW())
  `, [
    assetId,
    values.oldAccumulatedDepreciation,
    values.accumulatedDepreciation,
    values.monthlyDepreciation
  ]);
}
```

#### **Database Table for Tracking Updates**
```sql
CREATE TABLE depreciation_log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    asset_id INT NOT NULL,
    old_accumulated DECIMAL(15,2),
    new_accumulated DECIMAL(15,2),
    monthly_depreciation DECIMAL(15,2),
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(property_id)
);

CREATE TABLE depreciation_schedule (
    schedule_id INT PRIMARY KEY AUTO_INCREMENT,
    asset_id INT NOT NULL,
    month_year DATE NOT NULL,
    opening_balance DECIMAL(15,2),
    depreciation_amount DECIMAL(15,2),
    closing_balance DECIMAL(15,2),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(property_id),
    UNIQUE KEY unique_asset_month (asset_id, month_year)
);
```

### Option 2: Frontend Auto-Calculation (For Current Setup)

#### **Enhanced AssetForm Component**
```javascript
// Enhanced depreciation calculation with monthly updates
const useMonthlyDepreciation = () => {
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Check if monthly update is needed
  const checkMonthlyUpdate = useCallback(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const storedLastUpdate = localStorage.getItem('depreciation_last_update');
    if (storedLastUpdate) {
      const lastUpdateDate = new Date(storedLastUpdate);
      if (lastUpdateDate < lastMonth) {
        return true; // Need update
      }
    }
    return false;
  }, []);
  
  // Update all assets depreciation
  const updateAllAssetsDepreciation = useCallback(() => {
    const assets = JSON.parse(localStorage.getItem('denr_assets') || '[]');
    const updatedAssets = assets.map(asset => {
      if (asset.usefulLife === 'Indefinite' || asset.status !== 'Serviceable') {
        return asset;
      }
      
      const newValues = calculateCurrentDepreciation(asset);
      return { ...asset, ...newValues };
    });
    
    localStorage.setItem('denr_assets', JSON.stringify(updatedAssets));
    localStorage.setItem('depreciation_last_update', new Date().toISOString());
    
    // Trigger reactivity
    window.dispatchEvent(new Event('denrDataChanged'));
    
    return updatedAssets;
  }, []);
  
  return { checkMonthlyUpdate, updateAllAssetsDepreciation };
};

// In your main App.jsx or Dashboard component
const Dashboard = () => {
  const { checkMonthlyUpdate, updateAllAssetsDepreciation } = useMonthlyDepreciation();
  
  useEffect(() => {
    // Check and update depreciation on component mount
    if (checkMonthlyUpdate()) {
      updateAllAssetsDepreciation();
    }
  }, [checkMonthlyUpdate, updateAllAssetsDepreciation]);
  
  // ... rest of component
};
```

#### **Automatic Monthly Check Service**
```javascript
// depreciation-service.js (Frontend)
class DepreciationService {
  constructor() {
    this.checkInterval = null;
    this.lastCheck = null;
  }
  
  start() {
    // Check every hour for monthly updates
    this.checkInterval = setInterval(() => {
      this.checkAndUpdate();
    }, 60 * 60 * 1000); // 1 hour
    
    // Also check immediately
    this.checkAndUpdate();
  }
  
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
  
  checkAndUpdate() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const lastCheck = localStorage.getItem('depreciation_last_check');
    if (lastCheck) {
      const lastCheckDate = new Date(lastCheck);
      const lastMonth = lastCheckDate.getMonth();
      const lastYear = lastCheckDate.getFullYear();
      
      // Only update if we're in a new month
      if (currentMonth > lastMonth || currentYear > lastYear) {
        this.performMonthlyUpdate();
      }
    } else {
      // First time checking
      this.performMonthlyUpdate();
    }
    
    localStorage.setItem('depreciation_last_check', now.toISOString());
  }
  
  performMonthlyUpdate() {
    console.log('Performing monthly depreciation update...');
    
    const assets = JSON.parse(localStorage.getItem('denr_assets') || '[]');
    const updatedAssets = assets.map(asset => {
      if (asset.usefulLife === 'Indefinite' || asset.status !== 'Serviceable') {
        return asset;
      }
      
      return this.calculateUpdatedDepreciation(asset);
    });
    
    // Save updated assets
    localStorage.setItem('denr_assets', JSON.stringify(updatedAssets));
    
    // Log the update
    this.logUpdate(updatedAssets.filter(asset => asset.wasUpdated));
    
    // Notify other components
    window.dispatchEvent(new CustomEvent('depreciationUpdated', {
      detail: { updatedCount: updatedAssets.filter(a => a.wasUpdated).length }
    }));
    
    // Show notification to user
    this.showUpdateNotification(updatedAssets.filter(a => a.wasUpdated).length);
  }
  
  calculateUpdatedDepreciation(asset) {
    const acquiredDate = new Date(asset.dateAcquired);
    const currentDate = new Date();
    const yearsElapsed = (currentDate - acquiredDate) / (365.25 * 24 * 60 * 60 * 1000);
    const monthsElapsed = yearsElapsed * 12;
    
    const monthlyDepreciation = (asset.annualDepreciation || 0) / 12;
    const maxDepreciation = (asset.cost || 0) - (asset.cost || 0) * 0.1; // 10% residual
    const newAccumulatedDepreciation = Math.min(
      monthlyDepreciation * monthsElapsed, 
      maxDepreciation
    );
    const newNetBookValue = (asset.cost || 0) - newAccumulatedDepreciation;
    
    const wasUpdated = Math.abs(newAccumulatedDepreciation - (asset.accumulatedDepreciation || 0)) > 0.01;
    
    return {
      ...asset,
      accumulatedDepreciation: newAccumulatedDepreciation,
      netBookValue: newNetBookValue,
      monthlyDepreciation: monthlyDepreciation,
      wasUpdated: wasUpdated,
      lastDepreciationUpdate: new Date().toISOString()
    };
  }
  
  logUpdate(updatedAssets) {
    const log = {
      date: new Date().toISOString(),
      updatedCount: updatedAssets.length,
      assets: updatedAssets.map(asset => ({
        propertyId: asset.propertyNumber,
        oldAccumulated: asset.accumulatedDepreciation,
        newAccumulated: asset.accumulatedDepreciation,
        netBookValue: asset.netBookValue
      }))
    };
    
    const existingLogs = JSON.parse(localStorage.getItem('depreciation_logs') || '[]');
    existingLogs.push(log);
    localStorage.setItem('depreciation_logs', JSON.stringify(existingLogs));
  }
  
  showUpdateNotification(count) {
    if (count > 0) {
      // Create a notification
      const notification = {
        id: Date.now(),
        type: 'depreciation_update',
        message: `Monthly depreciation updated for ${count} asset(s)`,
        date: new Date().toISOString(),
        read: false
      };
      
      const notifications = JSON.parse(localStorage.getItem('denr_notifications') || '[]');
      notifications.push(notification);
      localStorage.setItem('denr_notifications', JSON.stringify(notifications));
      
      // Show toast notification
      if (window.showToast) {
        window.showToast(`Depreciation values updated for ${count} assets`, 'success');
      }
    }
  }
}

// Initialize the service
const depreciationService = new DepreciationService();

// Export for use in components
export default depreciationService;
```

### Option 3: Hybrid Approach (Recommended)

#### **Frontend Auto-Start Service**
```javascript
// In your App.jsx
import depreciationService from './services/depreciation-service';

function App() {
  useEffect(() => {
    // Start the depreciation service when app loads
    depreciationService.start();
    
    // Listen for depreciation updates
    const handleDepreciationUpdate = (event) => {
      console.log('Depreciation updated:', event.detail);
      // Refresh data in components
      window.dispatchEvent(new Event('denrDataChanged'));
    };
    
    window.addEventListener('depreciationUpdated', handleDepreciationUpdate);
    
    return () => {
      depreciationService.stop();
      window.removeEventListener('depreciationUpdated', handleDepreciationUpdate);
    };
  }, []);
  
  // ... rest of App component
}
```

## Implementation Steps

### Step 1: Choose Your Approach
- **Frontend Only**: Easy, works with current localStorage setup
- **Backend Cron Job**: More robust, better for production
- **Hybrid**: Best of both worlds

### Step 2: Implement the Service
1. Create the depreciation service file
2. Add the service to your main App component
3. Test the monthly update logic

### Step 3: Add User Notifications
1. Show toast notifications when updates occur
2. Add notification badge in header
3. Create depreciation update log viewer

### Step 4: Add Manual Update Option
```javascript
// Add manual update button in Properties component
const handleManualUpdate = () => {
  depreciationService.performMonthlyUpdate();
  showToast('Depreciation values updated manually', 'success');
};
```

## Benefits of Automatic Updates

1. **Always Accurate**: Depreciation values reflect current date
2. **No Manual Work**: No need to manually update each asset
3. **Audit Trail**: Complete history of all updates
4. **User Notifications**: Users know when updates occur
5. **Compliance**: Meets accounting standards for regular updates

## Recommended Implementation

For your current setup, I recommend **Option 2 (Frontend Auto-Calculation)** because:
- Works with your existing localStorage
- No backend required
- Easy to implement
- Can be upgraded to backend later

The system will automatically check every hour and update depreciation values when a new month begins, ensuring your financial records are always accurate!
