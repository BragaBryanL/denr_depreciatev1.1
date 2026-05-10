# DENR Depreciation System - Entity Relationship Diagram

## Database Schema Overview

Based on the codebase analysis, here's the ERD for the DENR Depreciation Management System:

```
+----------------+       +-----------------------+       +-------------------+
|     OFFICES    |       |       ASSETS         |       |   TRANSACTIONS   |
+----------------+       +-----------------------+       +-------------------+
| office_id (PK) |<------| office_id (FK)        |<------| property_id (FK) |
| office_name    |       | property_id (PK)       |       | transaction_id(PK)|
| office_code    |       | property_number       |       | transaction_date  |
| description    |       | date_acquired         |       | nature_of_repair  |
| is_active      |       | property_description  |       | supplier          |
+----------------+       | accountable_officer   |       | amount            |
                        | ppe_class             |       | po_number         |
                        | account_code          |       | repair_cost       |
                        | useful_life           |       +-------------------+
                        | fund_cluster          |       
                        | status                |       
                        | unit_cost             |       
                        | quantity              |       
                        | total_cost            |       
                        | residual_value        |       
                        | depreciation_amount    |       
                        | annual_depreciation   |       
                        | rate_of_depreciation   |       
                        | accumulated_depreci   |       
                        | netbook_value         |       
                        | remarks               |       
                        | created_date          |       
                        | updated_date          |       
                        +-----------------------+       
                                |                       
                                |                       
+----------------+       +-----------------------+       
|     PPE_CLASSES |------| account_code (FK)     |       
+----------------+       +-----------------------+       
| class_id (PK)   |                               
| class_name      |                               
| useful_life     |                               
| account_code    |                               
| description     |                               
+----------------+                               

+----------------+       
|  FUND_CLUSTERS |       
+----------------+       
| fund_id (PK)   |       
| fund_name      |       
| fund_code      |       
| description    |       
+----------------+       

+----------------+       +-------------------+
|  FILE_STORAGE  |       |   COA_FORMS      |
+----------------+       +-------------------+
| file_id (PK)   |       | coa_id (PK)      |
| file_name      |       | property_id (FK) |
| file_path      |       | file_id (FK)     |
| file_type      |       | form_type        |
| file_size      |       | generated_date   |
| mime_type      |       | generated_by     |
| upload_date    |       | status           |
| uploaded_by    |       +-------------------+
+----------------+

+----------------+       +-------------------+       +------------------+
|     USERS      |       |   USER_ROLES     |       |   NOTIFICATIONS  |
+----------------+       +-------------------+       +------------------+
| user_id (PK)   |       | role_id (PK)     |       | notif_id (PK)    |
| username       |       | role_name        |       | user_id (FK)     |
| email          |       | permissions      |       | notif_type       |
| password_hash  |       | description      |       | message          |
| first_name     |       +-------------------+       | is_read          |
| last_name      |               |                   | created_date     |
| role_id (FK)   |               |                   | expires_at       |
| office_id (FK) |               |                   | action_required  |
| status         |               |                   +------------------+
| created_date   |               |                   
| last_login     |               |                   
| is_active      |               |                   
+----------------+               |                   

+----------------+       +-------------------+       +------------------+
|   AUDIT_LOG    |       |   ASSET_APPROVALS |       |  INPUT_VALIDATION|
+----------------+       +-------------------+       +------------------+
| log_id (PK)    |       | approval_id (PK)  |       | validation_id(PK)|
| asset_id (FK)  |       | asset_id (FK)     |       | asset_id (FK)    |
| user_id (FK)   |       | submitted_by (FK)|       | user_id (FK)     |
| action_type    |       | approved_by (FK) |       | field_name       |
| old_values     |       | status            |       | validation_type  |
| new_values     |       | submitted_date    |       | is_valid         |
| timestamp      |       | approved_date     |       | error_message    |
| ip_address     |       | rejection_reason  |       | created_date     |
+----------------+       +-------------------+       +------------------+

+----------------+       +-------------------+
|  USER_SESSIONS |       |   SYSTEM_SETTINGS |
+----------------+       +-------------------+
| session_id (PK)|       | setting_id (PK)   |
| user_id (FK)   |       | setting_name      |
| session_token  |       | setting_value     |
| created_date   |       | description       |
| expires_at     |       | category          |
| ip_address     |       | is_active         |
| user_agent     |       +-------------------+
+----------------+       
```

## Entity Relationships

### 1. **OFFICES Entity**
- **Primary Key**: `office_id`
- **Attributes**: office_name, office_code, description, is_active
- **Relationship**: One-to-Many with ASSETS (one office can have many assets)

### 2. **ASSETS Entity** (Main Entity)
- **Primary Key**: `property_id`
- **Foreign Keys**: `office_id`, `account_code`
- **Attributes**:
  - **Identification**: property_number, property_description
  - **Classification**: ppe_class, account_code, status
  - **Financial**: unit_cost, quantity, total_cost, residual_value
  - **Depreciation**: useful_life, depreciation_amount, annual_depreciation, rate_of_depreciation, accumulated_depreci, netbook_value
  - **Administrative**: date_acquired, accountable_officer, fund_cluster, remarks
  - **Audit**: created_date, updated_date
- **Relationships**:
  - Many-to-One with OFFICES (many assets belong to one office)
  - Many-to-One with PPE_CLASSES (many assets belong to one PPE class)
  - One-to-Many with TRANSACTIONS (one asset can have many transactions)

### 3. **TRANSACTIONS Entity**
- **Primary Key**: `transaction_id`
- **Foreign Key**: `property_id`
- **Attributes**:
  - **Reference**: property_id, transaction_date
  - **Repair Details**: nature_of_repair, supplier, po_number
  - **Financial**: amount, repair_cost
- **Relationship**: Many-to-One with ASSETS (many transactions belong to one asset)

### 4. **PPE_CLASSES Entity**
- **Primary Key**: `class_id`
- **Attributes**: class_name, useful_life, account_code, description
- **Relationship**: One-to-Many with ASSETS (one PPE class can have many assets)

### 5. **FUND_CLUSTERS Entity**
- **Primary Key**: `fund_id`
- **Attributes**: fund_name, fund_code, description
- **Relationship**: Used as reference in ASSETS (lookup table)

### 6. **FILE_STORAGE Entity**
- **Primary Key**: `file_id`
- **Attributes**: file_name, file_path, file_type, file_size, mime_type, upload_date, uploaded_by
- **Purpose**: Stores metadata for uploaded/imported files
- **Relationship**: One-to-Many with COA_FORMS (one file can be used for multiple COA forms)

### 7. **COA_FORMS Entity**
- **Primary Key**: `coa_id`
- **Foreign Keys**: `property_id`, `file_id`
- **Attributes**: form_type, generated_date, generated_by, status
- **Purpose**: Tracks generated COA forms and their associated files
- **Relationships**:
  - Many-to-One with ASSETS (COA form belongs to one asset)
  - Many-to-One with FILE_STORAGE (COA form references one file)

### 8. **USERS Entity**
- **Primary Key**: `user_id`
- **Foreign Keys**: `role_id`, `office_id`
- **Attributes**: username, email, password_hash, first_name, last_name, status, created_date, last_login, is_active
- **Purpose**: User authentication and profile management
- **Relationships**:
  - Many-to-One with USER_ROLES (user has one role)
  - Many-to-One with OFFICES (user belongs to one office)
  - One-to-Many with NOTIFICATIONS (user can have many notifications)

### 9. **USER_ROLES Entity**
- **Primary Key**: `role_id`
- **Attributes**: role_name, permissions, description
- **Purpose**: Role-based access control
- **Relationship**: One-to-Many with USERS (one role can have many users)

### 10. **NOTIFICATIONS Entity**
- **Primary Key**: `notif_id`
- **Foreign Key**: `user_id`
- **Attributes**: notif_type, message, is_read, created_date, expires_at, action_required
- **Purpose**: System notifications for users
- **Relationship**: Many-to-One with USERS (notification belongs to one user)

### 11. **AUDIT_LOG Entity**
- **Primary Key**: `log_id`
- **Foreign Keys**: `asset_id`, `user_id`
- **Attributes**: action_type, old_values, new_values, timestamp, ip_address
- **Purpose**: Tracks all manual changes to assets for audit purposes
- **Relationships**:
  - Many-to-One with ASSETS (log entry belongs to one asset)
  - Many-to-One with USERS (log entry created by one user)

### 12. **ASSET_APPROVALS Entity**
- **Primary Key**: `approval_id`
- **Foreign Keys**: `asset_id`, `submitted_by`, `approved_by`
- **Attributes**: status, submitted_date, approved_date, rejection_reason
- **Purpose**: Workflow for approving manually entered assets
- **Relationships**:
  - Many-to-One with ASSETS (approval belongs to one asset)
  - Many-to-One with USERS (submitted by and approved by users)

### 13. **INPUT_VALIDATION Entity**
- **Primary Key**: `validation_id`
- **Foreign Keys**: `asset_id`, `user_id`
- **Attributes**: field_name, validation_type, is_valid, error_message, created_date
- **Purpose**: Tracks validation results for manual input fields
- **Relationships**:
  - Many-to-One with ASSETS (validation belongs to one asset)
  - Many-to-One with USERS (validation performed by one user)

### 14. **USER_SESSIONS Entity**
- **Primary Key**: `session_id`
- **Foreign Key**: `user_id`
- **Attributes**: session_token, created_date, expires_at, ip_address, user_agent
- **Purpose**: Manages user login sessions and authentication tokens
- **Relationship**: Many-to-One with USERS (session belongs to one user)

### 15. **SYSTEM_SETTINGS Entity**
- **Primary Key**: `setting_id`
- **Attributes**: setting_name, setting_value, description, category, is_active
- **Purpose**: Stores system-wide configuration settings
- **Relationship**: Standalone entity (no foreign keys)

## Data Flow and Business Logic

### Asset Lifecycle:
1. **Asset Creation**: Office creates asset with PPE classification
2. **Depreciation Calculation**: System calculates depreciation based on useful life
3. **Transaction Recording**: Repair/maintenance transactions recorded against asset
4. **Status Updates**: Asset status changes (Serviceable/Unserviceable)
5. **Reporting**: COA forms generated with asset and transaction data

### Key Relationships:
- **OFFICES** 1:N **ASSETS** - Office manages multiple assets
- **PPE_CLASSES** 1:N **ASSETS** - Classification determines depreciation rules
- **ASSETS** 1:N **TRANSACTIONS** - Asset has multiple repair/maintenance records

## Current Implementation Notes

### Storage:
- **Frontend**: localStorage (`denr_assets`, `denr_transactions`)
- **Future**: Backend database implementation recommended

### Data Validation:
- Property numbers must be unique
- Account codes linked to PPE classes
- Financial calculations automated
- Status restrictions enforced

### Integration Points:
- **COA Form Generation**: Exports asset + transaction data
- **Dashboard Analytics**: Aggregates data across entities
- **Search/Filter**: Cross-entity filtering capabilities

## Recommended Database Schema (SQL)

```sql
CREATE TABLE offices (
    office_id INT PRIMARY KEY AUTO_INCREMENT,
    office_name VARCHAR(100) NOT NULL,
    office_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ppe_classes (
    class_id INT PRIMARY KEY AUTO_INCREMENT,
    class_name VARCHAR(100) NOT NULL,
    useful_life INT NOT NULL,
    account_code VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fund_clusters (
    fund_id INT PRIMARY KEY AUTO_INCREMENT,
    fund_name VARCHAR(100) NOT NULL,
    fund_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assets (
    property_id INT PRIMARY KEY AUTO_INCREMENT,
    property_number VARCHAR(50) UNIQUE NOT NULL,
    office_id INT,
    date_acquired DATE NOT NULL,
    property_description TEXT,
    accountable_officer VARCHAR(100),
    ppe_class VARCHAR(100),
    account_code VARCHAR(20),
    useful_life INT,
    fund_cluster VARCHAR(100),
    status ENUM('Serviceable', 'Unserviceable') DEFAULT 'Serviceable',
    unit_cost DECIMAL(15,2),
    quantity INT DEFAULT 1,
    total_cost DECIMAL(15,2),
    residual_value DECIMAL(15,2),
    depreciation_amount DECIMAL(15,2),
    annual_depreciation DECIMAL(15,2),
    rate_of_depreciation DECIMAL(5,2),
    accumulated_depreci DECIMAL(15,2),
    netbook_value DECIMAL(15,2),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (office_id) REFERENCES offices(office_id)
);

CREATE TABLE transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    transaction_date DATE NOT NULL,
    nature_of_repair TEXT,
    supplier VARCHAR(100),
    amount DECIMAL(15,2),
    po_number VARCHAR(50),
    repair_cost DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES assets(property_id) ON DELETE CASCADE
);

CREATE TABLE file_storage (
    file_id INT PRIMARY KEY AUTO_INCREMENT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type ENUM('excel_import', 'excel_export', 'pdf_export', 'word_export', 'csv_export') NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(100),
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE coa_forms (
    coa_id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    file_id INT,
    form_type ENUM('excel', 'pdf', 'word', 'csv') NOT NULL,
    generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by VARCHAR(100),
    status ENUM('generated', 'downloaded', 'archived') DEFAULT 'generated',
    download_count INT DEFAULT 0,
    FOREIGN KEY (property_id) REFERENCES assets(property_id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES file_storage(file_id) ON DELETE SET NULL
);

CREATE TABLE user_roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    permissions JSON,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role_id INT,
    office_id INT,
    status ENUM('pending_approval', 'active', 'suspended', 'rejected') DEFAULT 'pending_approval',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT FALSE,
    approved_by INT NULL,
    approved_date TIMESTAMP NULL,
    rejection_reason TEXT NULL,
    FOREIGN KEY (role_id) REFERENCES user_roles(role_id),
    FOREIGN KEY (office_id) REFERENCES offices(office_id),
    FOREIGN KEY (approved_by) REFERENCES users(user_id)
);

CREATE TABLE notifications (
    notif_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    notif_type ENUM('account_approval', 'account_rejection', 'system_alert', 'asset_assigned', 'coa_generated', 'asset_approval') NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    action_required BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500) NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE audit_log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    asset_id INT,
    user_id INT NOT NULL,
    action_type ENUM('create', 'update', 'delete', 'approve', 'reject') NOT NULL,
    old_values JSON,
    new_values JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (asset_id) REFERENCES assets(property_id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE asset_approvals (
    approval_id INT PRIMARY KEY AUTO_INCREMENT,
    asset_id INT NOT NULL,
    submitted_by INT NOT NULL,
    approved_by INT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_date TIMESTAMP NULL,
    rejection_reason TEXT,
    FOREIGN KEY (asset_id) REFERENCES assets(property_id) ON DELETE CASCADE,
    FOREIGN KEY (submitted_by) REFERENCES users(user_id),
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE input_validation (
    validation_id INT PRIMARY KEY AUTO_INCREMENT,
    asset_id INT NOT NULL,
    user_id INT NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    validation_type ENUM('required', 'format', 'range', 'unique', 'custom') NOT NULL,
    is_valid BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(property_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE user_sessions (
    session_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE system_settings (
    setting_id INT PRIMARY KEY AUTO_INCREMENT,
    setting_name VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Indexes for Performance

```sql
CREATE INDEX idx_assets_property_number ON assets(property_number);
CREATE INDEX idx_assets_office_id ON assets(office_id);
CREATE INDEX idx_assets_ppe_class ON assets(ppe_class);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_transactions_property_id ON transactions(property_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_file_storage_file_type ON file_storage(file_type);
CREATE INDEX idx_file_storage_upload_date ON file_storage(upload_date);
CREATE INDEX idx_coa_forms_property_id ON coa_forms(property_id);
CREATE INDEX idx_coa_forms_form_type ON coa_forms(form_type);
CREATE INDEX idx_coa_forms_generated_date ON coa_forms(generated_date);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(notif_type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_audit_log_asset_id ON audit_log(asset_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_asset_approvals_asset_id ON asset_approvals(asset_id);
CREATE INDEX idx_asset_approvals_status ON asset_approvals(status);
CREATE INDEX idx_input_validation_asset_id ON input_validation(asset_id);
CREATE INDEX idx_input_validation_user_id ON input_validation(user_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_system_settings_name ON system_settings(setting_name);
CREATE INDEX idx_system_settings_category ON system_settings(category);
```

## File Storage Strategies

### **Option 1: File System Storage (Recommended)**
```sql
-- File path example: /uploads/coa_forms/2024/04/excel/asset_123_20240430.xlsx
-- Store only metadata in database, actual files on filesystem
```

**Advantages:**
- Better performance for large files
- Database stays lightweight
- Easy backup and file management
- Supports any file size

**Implementation:**
```javascript
// Backend API endpoint for file generation
app.post('/api/generate-coa', async (req, res) => {
  const { propertyId, format } = req.body;
  
  // Generate COA form
  const fileName = `COA_Form_${propertyId}_${Date.now()}.${format}`;
  const filePath = path.join(uploadsDir, fileName);
  
  // Save file to filesystem
  await generateCOAForm(asset, transactions, format, filePath);
  
  // Store metadata in database
  const fileId = await db.query(`
    INSERT INTO file_storage (file_name, file_path, file_type, file_size, uploaded_by)
    VALUES (?, ?, ?, ?, ?)
  `, [fileName, filePath, `${format}_export`, fs.statSync(filePath).size, req.user.name]);
  
  // Link to COA form record
  await db.query(`
    INSERT INTO coa_forms (property_id, file_id, form_type, generated_by)
    VALUES (?, ?, ?, ?)
  `, [propertyId, fileId, format, req.user.name]);
  
  res.json({ fileId, downloadUrl: `/api/download/${fileId}` });
});
```

### **Option 2: Database Blob Storage**
```sql
-- Store files directly in database
ALTER TABLE file_storage ADD COLUMN file_content LONGBLOB;
```

**Advantages:**
- All data in one place
- Easier database backups
- No file system permissions issues

**Disadvantages:**
- Database bloat
- Slower performance for large files
- More complex backup strategies

### **Option 3: Cloud Storage (AWS S3, Azure Blob)**
```javascript
// Upload to cloud storage
const s3 = new AWS.S3();
const uploadParams = {
  Bucket: 'denr-coa-forms',
  Key: `coa-forms/${propertyId}/${fileName}`,
  Body: fileBuffer,
  ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

await s3.upload(uploadParams).promise();
```

**Advantages:**
- Scalable storage
- CDN integration
- Built-in redundancy
- Pay-per-use pricing

## File Management Features

### **File Upload/Import:**
```javascript
// Excel import functionality
app.post('/api/import-excel', upload.single('file'), async (req, res) => {
  const workbook = XLSX.read(req.file.buffer);
  const assets = parseExcelData(workbook);
  
  // Store file metadata
  const fileId = await db.query(`
    INSERT INTO file_storage (file_name, file_type, file_size, uploaded_by)
    VALUES (?, 'excel_import', ?, ?)
  `, [req.file.originalname, req.file.size, req.user.name]);
  
  // Process imported assets
  await processImportedAssets(assets);
  
  res.json({ imported: assets.length, fileId });
});
```

### **File Download/Export:**
```javascript
// Download COA form
app.get('/api/download/:fileId', async (req, res) => {
  const file = await db.query(`
    SELECT file_path, file_name, mime_type 
    FROM file_storage 
    WHERE file_id = ? AND is_deleted = FALSE
  `, [req.params.fileId]);
  
  // Update download count
  await db.query(`
    UPDATE coa_forms 
    SET download_count = download_count + 1, status = 'downloaded'
    WHERE file_id = ?
  `, [req.params.fileId]);
  
  res.download(file.file_path, file.file_name);
});
```

### **File Cleanup:**
```javascript
// Automated cleanup of old files
cron.schedule('0 2 * * *', async () => {
  // Delete files older than 90 days
  await db.query(`
    UPDATE file_storage 
    SET is_deleted = TRUE 
    WHERE upload_date < DATE_SUB(NOW(), INTERVAL 90 DAY)
  `);
  
  // Soft delete corresponding COA form records
  await db.query(`
    UPDATE coa_forms 
    SET status = 'archived' 
    WHERE file_id IN (
      SELECT file_id FROM file_storage WHERE is_deleted = TRUE
    )
  `);
});
```

## Storage Location Recommendations

### **Development Environment:**
```
/uploads/
  /coa_forms/
    /excel/
    /pdf/
    /word/
    /csv/
  /imports/
    /excel/
```

### **Production Environment:**
```
/var/www/denr/storage/
  /coa-forms/
    /2024/
      /04/
      /05/
  /imports/
  /temp/
```

### **Backup Strategy:**
1. **Database Backup:** Daily automated backups
2. **File Backup:** Weekly rsync to backup server
3. **Cloud Sync:** Optional cloud storage sync
4. **Retention:** 90 days for temp files, 1 year for COA forms

## User Authentication & Account Management

### **User Roles and Permissions**

```sql
-- Initial user roles setup
INSERT INTO user_roles (role_name, permissions, description) VALUES
('super_admin', '{"users": ["create", "read", "update", "delete"], "assets": ["create", "read", "update", "delete"], "reports": ["create", "read"], "system": ["admin"]}', 'Full system administrator'),
('admin', '{"users": ["read", "update"], "assets": ["create", "read", "update", "delete"], "reports": ["create", "read"]}', 'Office administrator'),
('manager', '{"assets": ["create", "read", "update"], "reports": ["read"]}', 'Office manager'),
('user', '{"assets": ["read"], "reports": ["read"]}', 'Regular user');
```

### **Account Creation Workflow**

#### **Step 1: User Registration**
```javascript
// Frontend registration form
app.post('/api/register', async (req, res) => {
  const { username, email, password, firstName, lastName, role, office } = req.body;
  
  // Validate input
  if (!username || !email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Check if user already exists
  const existingUser = await db.query(
    'SELECT user_id FROM users WHERE username = ? OR email = ?',
    [username, email]
  );
  
  if (existingUser.length > 0) {
    return res.status(409).json({ error: 'User already exists' });
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);
  
  // Create user with pending status
  const userId = await db.query(`
    INSERT INTO users (username, email, password_hash, first_name, last_name, role_id, office_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending_approval')
  `, [username, email, passwordHash, firstName, lastName, role, office]);
  
  // Notify admins for approval
  await notifyAdminsForApproval(userId);
  
  res.json({ message: 'Registration successful. Awaiting admin approval.' });
});
```

#### **Step 2: Admin Notification System**
```javascript
// Notify all admins about new user registration
async function notifyAdminsForApproval(newUserId) {
  const admins = await db.query(`
    SELECT u.user_id, u.email 
    FROM users u 
    JOIN user_roles r ON u.role_id = r.role_id 
    WHERE r.role_name IN ('admin', 'super_admin') AND u.status = 'active'
  `);
  
  const newUser = await db.query(
    'SELECT username, email, first_name, last_name FROM users WHERE user_id = ?',
    [newUserId]
  );
  
  for (const admin of admins) {
    await db.query(`
      INSERT INTO notifications (user_id, notif_type, message, action_required, action_url)
      VALUES (?, 'account_approval', ?, TRUE, '/admin/user-approval')
    `, [
      admin.user_id,
      `New user registration: ${newUser[0].first_name} ${newUser[0].last_name} (${newUser[0].username}) awaiting approval.`
    ]);
    
    // Send email notification (optional)
    await sendEmailNotification(admin.email, 'New User Approval Required', {
      userName: newUser[0].username,
      approvalUrl: `${process.env.APP_URL}/admin/user-approval`
    });
  }
}
```

#### **Step 3: Admin Approval Interface**
```javascript
// Get pending users for admin approval
app.get('/api/admin/pending-users', requireAuth, requireAdminRole, async (req, res) => {
  const pendingUsers = await db.query(`
    SELECT u.user_id, u.username, u.email, u.first_name, u.last_name, u.created_date,
           o.office_name, r.role_name
    FROM users u
    LEFT JOIN offices o ON u.office_id = o.office_id
    LEFT JOIN user_roles r ON u.role_id = r.role_id
    WHERE u.status = 'pending_approval'
    ORDER BY u.created_date ASC
  `);
  
  res.json(pendingUsers);
});

// Approve user
app.post('/api/admin/approve-user/:userId', requireAuth, requireAdminRole, async (req, res) => {
  const { userId } = req.params;
  const adminId = req.user.id;
  
  // Update user status
  await db.query(`
    UPDATE users 
    SET status = 'active', is_active = TRUE, approved_by = ?, approved_date = NOW()
    WHERE user_id = ?
  `, [adminId, userId]);
  
  // Get user details for notification
  const user = await db.query(
    'SELECT email, first_name, last_name FROM users WHERE user_id = ?',
    [userId]
  );
  
  // Send approval notification to user
  await db.query(`
    INSERT INTO notifications (user_id, notif_type, message, action_required, action_url)
    VALUES (?, 'account_approval', ?, FALSE, '/login')
  `, [
    userId,
    `Your account has been approved! You can now login to the system.`
  ]);
  
  // Send email approval (optional)
  await sendEmailNotification(user[0].email, 'Account Approved', {
    firstName: user[0].first_name,
    loginUrl: `${process.env.APP_URL}/login`
  });
  
  res.json({ message: 'User approved successfully' });
});

// Reject user
app.post('/api/admin/reject-user/:userId', requireAuth, requireAdminRole, async (req, res) => {
  const { userId } = req.params;
  const { rejectionReason } = req.body;
  const adminId = req.user.id;
  
  // Update user status
  await db.query(`
    UPDATE users 
    SET status = 'rejected', approved_by = ?, approved_date = NOW(), rejection_reason = ?
    WHERE user_id = ?
  `, [adminId, rejectionReason, userId]);
  
  // Get user details for notification
  const user = await db.query(
    'SELECT email, first_name, last_name FROM users WHERE user_id = ?',
    [userId]
  );
  
  // Send rejection notification to user
  await db.query(`
    INSERT INTO notifications (user_id, notif_type, message, action_required)
    VALUES (?, 'account_rejection', ?, FALSE)
  `, [
    userId,
    `Your account registration has been rejected. Reason: ${rejectionReason}`
  ]);
  
  // Send email rejection (optional)
  await sendEmailNotification(user[0].email, 'Account Registration Rejected', {
    firstName: user[0].first_name,
    rejectionReason: rejectionReason
  });
  
  res.json({ message: 'User rejected successfully' });
});
```

### **Login Authentication**
```javascript
// User login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Find user
  const user = await db.query(`
    SELECT u.*, r.permissions, r.role_name, o.office_name
    FROM users u
    JOIN user_roles r ON u.role_id = r.role_id
    LEFT JOIN offices o ON u.office_id = o.office_id
    WHERE u.username = ? AND u.status = 'active' AND u.is_active = TRUE
  `, [username]);
  
  if (user.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Verify password
  const isValidPassword = await bcrypt.compare(password, user[0].password_hash);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Update last login
  await db.query(
    'UPDATE users SET last_login = NOW() WHERE user_id = ?',
    [user[0].user_id]
  );
  
  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: user[0].user_id, 
      username: user[0].username,
      role: user[0].role_name,
      permissions: JSON.parse(user[0].permissions)
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({
    token,
    user: {
      id: user[0].user_id,
      username: user[0].username,
      firstName: user[0].first_name,
      lastName: user[0].last_name,
      role: user[0].role_name,
      office: user[0].office_name,
      permissions: JSON.parse(user[0].permissions)
    }
  });
});
```

### **Notification System**
```javascript
// Get user notifications
app.get('/api/notifications', requireAuth, async (req, res) => {
  const notifications = await db.query(`
    SELECT notif_id, notif_type, message, is_read, created_date, action_required, action_url
    FROM notifications
    WHERE user_id = ? AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY created_date DESC
    LIMIT 50
  `, [req.user.userId]);
  
  res.json(notifications);
});

// Mark notification as read
app.put('/api/notifications/:notifId/read', requireAuth, async (req, res) => {
  await db.query(
    'UPDATE notifications SET is_read = TRUE WHERE notif_id = ? AND user_id = ?',
    [req.params.notifId, req.user.userId]
  );
  
  res.json({ message: 'Notification marked as read' });
});

// Get unread notification count
app.get('/api/notifications/unread-count', requireAuth, async (req, res) => {
  const count = await db.query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
    [req.user.userId]
  );
  
  res.json({ unreadCount: count[0].count });
});
```

### **Admin Dashboard Features**
```javascript
// Get system statistics for admin dashboard
app.get('/api/admin/stats', requireAuth, requireAdminRole, async (req, res) => {
  const stats = await db.query(`
    SELECT 
      (SELECT COUNT(*) FROM users WHERE status = 'pending_approval') as pending_users,
      (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
      (SELECT COUNT(*) FROM assets) as total_assets,
      (SELECT COUNT(*) FROM transactions WHERE DATE(transaction_date) = CURDATE()) as today_transactions
  `);
  
  res.json(stats[0]);
});
```

### **Security Features**
- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Role-based Access Control**: Permission-based system
- **Input Validation**: Sanitize all inputs
- **Rate Limiting**: Prevent brute force attacks
- **Session Management**: Secure session handling

## Manual Property Input Workflow

### **Step 1: Manual Data Entry**
```javascript
// Asset form submission with validation
app.post('/api/assets', requireAuth, async (req, res) => {
  const { propertyNumber, propertyDescription, ppeClass, cost, quantity, ...otherFields } = req.body;
  const userId = req.user.userId;
  const clientIP = req.ip;
  
  // Validate required fields
  const validationResults = await validateAssetInput(req.body);
  
  // Store validation results
  for (const validation of validationResults) {
    await db.query(`
      INSERT INTO input_validation (asset_id, user_id, field_name, validation_type, is_valid, error_message)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [null, userId, validation.field, validation.type, validation.isValid, validation.error]);
  }
  
  // Check if all validations passed
  const hasErrors = validationResults.some(v => !v.isValid);
  if (hasErrors) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      validations: validationResults 
    });
  }
  
  // Create asset with pending status if approval required
  const assetId = await db.query(`
    INSERT INTO assets (property_number, property_description, ppe_class, cost, quantity, status, created_date)
    VALUES (?, ?, ?, ?, ?, 'pending_approval', NOW())
  `, [propertyNumber, propertyDescription, ppeClass, cost, quantity]);
  
  // Create approval record
  await db.query(`
    INSERT INTO asset_approvals (asset_id, submitted_by, status)
    VALUES (?, ?, 'pending')
  `, [assetId, userId]);
  
  // Log the creation
  await db.query(`
    INSERT INTO audit_log (asset_id, user_id, action_type, new_values, ip_address, user_agent)
    VALUES (?, ?, 'create', ?, ?, ?)
  `, [assetId, userId, JSON.stringify(req.body), clientIP, req.get('User-Agent')]);
  
  // Notify admins for approval
  await notifyAdminsForAssetApproval(assetId, userId);
  
  res.json({ message: 'Asset submitted for approval', assetId });
});
```

### **Step 2: Input Validation System**
```javascript
// Comprehensive validation for manual input
async function validateAssetInput(assetData) {
  const validations = [];
  
  // Property number validation
  if (!assetData.propertyNumber) {
    validations.push({
      field: 'propertyNumber',
      type: 'required',
      isValid: false,
      error: 'Property number is required'
    });
  } else {
    // Check uniqueness
    const existing = await db.query(
      'SELECT property_id FROM assets WHERE property_number = ?',
      [assetData.propertyNumber]
    );
    
    if (existing.length > 0) {
      validations.push({
        field: 'propertyNumber',
        type: 'unique',
        isValid: false,
        error: 'Property number already exists'
      });
    } else {
      validations.push({
        field: 'propertyNumber',
        type: 'unique',
        isValid: true
      });
    }
  }
  
  // Cost validation
  if (!assetData.cost || isNaN(assetData.cost) || parseFloat(assetData.cost) <= 0) {
    validations.push({
      field: 'cost',
      type: 'range',
      isValid: false,
      error: 'Cost must be a positive number'
    });
  } else {
    validations.push({
      field: 'cost',
      type: 'range',
      isValid: true
    });
  }
  
  // PPE Class validation
  const validPPEClasses = await db.query('SELECT class_name FROM ppe_classes');
  const ppeClassNames = validPPEClasses.map(c => c.class_name);
  
  if (!ppeClassNames.includes(assetData.ppeClass)) {
    validations.push({
      field: 'ppeClass',
      type: 'custom',
      isValid: false,
      error: 'Invalid PPE class'
    });
  } else {
    validations.push({
      field: 'ppeClass',
      type: 'custom',
      isValid: true
    });
  }
  
  // Date validation
  if (!assetData.dateAcquired) {
    validations.push({
      field: 'dateAcquired',
      type: 'required',
      isValid: false,
      error: 'Date acquired is required'
    });
  } else if (new Date(assetData.dateAcquired) > new Date()) {
    validations.push({
      field: 'dateAcquired',
      type: 'range',
      isValid: false,
      error: 'Date acquired cannot be in the future'
    });
  } else {
    validations.push({
      field: 'dateAcquired',
      type: 'range',
      isValid: true
    });
  }
  
  return validations;
}
```

### **Step 3: Asset Approval Workflow**
```javascript
// Get pending assets for admin approval
app.get('/api/admin/pending-assets', requireAuth, requireAdminRole, async (req, res) => {
  const pendingAssets = await db.query(`
    SELECT a.*, u.first_name, u.last_name, u.username as submitted_by,
           ap.submitted_date, ap.approval_id
    FROM assets a
    JOIN asset_approvals ap ON a.property_id = ap.asset_id
    JOIN users u ON ap.submitted_by = u.user_id
    WHERE ap.status = 'pending'
    ORDER BY ap.submitted_date ASC
  `);
  
  // Get validation results for each asset
  for (const asset of pendingAssets) {
    const validations = await db.query(`
      SELECT field_name, validation_type, is_valid, error_message
      FROM input_validation
      WHERE asset_id = ?
    `, [asset.property_id]);
    
    asset.validations = validations;
  }
  
  res.json(pendingAssets);
});

// Approve asset
app.post('/api/admin/approve-asset/:approvalId', requireAuth, requireAdminRole, async (req, res) => {
  const { approvalId } = req.params;
  const adminId = req.user.userId;
  
  // Get approval record
  const approval = await db.query(
    'SELECT asset_id, submitted_by FROM asset_approvals WHERE approval_id = ?',
    [approvalId]
  );
  
  if (approval.length === 0) {
    return res.status(404).json({ error: 'Approval not found' });
  }
  
  // Update approval status
  await db.query(`
    UPDATE asset_approvals 
    SET status = 'approved', approved_by = ?, approved_date = NOW()
    WHERE approval_id = ?
  `, [adminId, approvalId]);
  
  // Update asset status
  await db.query(
    'UPDATE assets SET status = "Serviceable" WHERE property_id = ?',
    [approval[0].asset_id]
  );
  
  // Log the approval
  await db.query(`
    INSERT INTO audit_log (asset_id, user_id, action_type, new_values, ip_address)
    VALUES (?, ?, 'approve', ?, ?)
  `, [approval[0].asset_id, adminId, JSON.stringify({ status: 'approved' }), req.ip]);
  
  // Notify submitting user
  await db.query(`
    INSERT INTO notifications (user_id, notif_type, message, action_required, action_url)
    VALUES (?, 'asset_approval', ?, FALSE, '/assets')
  `, [
    approval[0].submitted_by,
    'Your asset submission has been approved and is now active in the system.'
  ]);
  
  res.json({ message: 'Asset approved successfully' });
});

// Reject asset
app.post('/api/admin/reject-asset/:approvalId', requireAuth, requireAdminRole, async (req, res) => {
  const { approvalId } = req.params;
  const { rejectionReason } = req.body;
  const adminId = req.user.userId;
  
  // Get approval record
  const approval = await db.query(
    'SELECT asset_id, submitted_by FROM asset_approvals WHERE approval_id = ?',
    [approvalId]
  );
  
  // Update approval status
  await db.query(`
    UPDATE asset_approvals 
    SET status = 'rejected', approved_by = ?, approved_date = NOW(), rejection_reason = ?
    WHERE approval_id = ?
  `, [adminId, rejectionReason, approvalId]);
  
  // Update asset status
  await db.query(
    'UPDATE assets SET status = "Rejected" WHERE property_id = ?',
    [approval[0].asset_id]
  );
  
  // Log the rejection
  await db.query(`
    INSERT INTO audit_log (asset_id, user_id, action_type, new_values, ip_address)
    VALUES (?, ?, 'reject', ?, ?)
  `, [approval[0].asset_id, adminId, JSON.stringify({ status: 'rejected', reason: rejectionReason }), req.ip]);
  
  // Notify submitting user
  await db.query(`
    INSERT INTO notifications (user_id, notif_type, message, action_required)
    VALUES (?, 'asset_approval', ?, FALSE)
  `, [
    approval[0].submitted_by,
    `Your asset submission has been rejected. Reason: ${rejectionReason}`
  ]);
  
  res.json({ message: 'Asset rejected successfully' });
});
```

### **Step 4: Audit Trail System**
```javascript
// Get audit log for an asset
app.get('/api/assets/:assetId/audit-log', requireAuth, async (req, res) => {
  const { assetId } = req.params;
  
  const auditLog = await db.query(`
    SELECT al.*, u.first_name, u.last_name, u.username
    FROM audit_log al
    JOIN users u ON al.user_id = u.user_id
    WHERE al.asset_id = ?
    ORDER BY al.timestamp DESC
  `, [assetId]);
  
  res.json(auditLog);
});

// Get user's asset submission history
app.get('/api/users/:userId/asset-submissions', requireAuth, async (req, res) => {
  const { userId } = req.params;
  
  const submissions = await db.query(`
    SELECT a.*, ap.status as approval_status, ap.submitted_date, ap.approved_date,
           ap.rejection_reason
    FROM assets a
    JOIN asset_approvals ap ON a.property_id = ap.asset_id
    WHERE ap.submitted_by = ?
    ORDER BY ap.submitted_date DESC
  `, [userId]);
  
  res.json(submissions);
});
```

### **Manual Input Features**
- **Real-time Validation**: Field-level validation as user types
- **Duplicate Detection**: Automatic checking for duplicate property numbers
- **Required Field Validation**: Ensures all mandatory fields are completed
- **Format Validation**: Validates dates, numbers, and formats
- **Approval Queue**: Admin dashboard for reviewing submissions
- **Audit Trail**: Complete history of all changes and approvals
- **Rejection Reasons**: Detailed feedback for rejected submissions
- **Notification System**: Alerts for approvals and rejections

### **Security for Manual Input**
- **IP Address Logging**: Track submission sources
- **User Agent Logging**: Browser/client identification
- **Change Tracking**: Before/after values for all updates
- **Permission Validation**: Ensure users can only submit for their office
- **Rate Limiting**: Prevent spam submissions

## Free SQL Deployment Options

### **1. PostgreSQL (Recommended - Completely Free)**

**Free Hosting Options:**
- **Supabase**: 100% free PostgreSQL with generous limits
  - 500MB database storage
  - 2GB bandwidth per month
  - 50,000 monthly active users
  - No credit card required for free tier
  - URL: `supabase.com`

- **Neon**: Serverless PostgreSQL free tier
  - 3GB storage
  - 1 compute hour/day
  - Unlimited connections
  - Auto-scaling
  - URL: `neon.tech`

- **Railway**: PostgreSQL with free tier
  - 500MB storage
  - 500 execution hours/month
  - Easy deployment
  - URL: `railway.app`

**Connection String Example:**
```javascript
// Supabase connection
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);
```

### **2. MySQL (Free Options Available)**

**Free Hosting Options:**
- **PlanetScale**: MySQL-compatible serverless
  - 5GB storage free tier
  - 1 billion row reads/month
  - No schema changes required
  - URL: `planetscale.com`

- **Aiven**: MySQL free tier
  - 1GB storage
  - 10,000 connections/month
  - 90-day retention
  - URL: `aiven.io`

- **Heroku**: PostgreSQL (but works with MySQL syntax)
  - Free tier available
  - Easy setup
  - Good for development
  - URL: `heroku.com`

### **3. SQLite (Self-Hosted - Free)**

**Advantages:**
- Completely free
- No server required
- File-based database
- Perfect for small to medium applications
- Easy backup (just copy the file)

**Implementation:**
```javascript
// Node.js with SQLite
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./denr_depreciation.db');

// Same SQL schema works with minor modifications
CREATE TABLE assets (
    property_id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_number TEXT UNIQUE NOT NULL,
    -- ... rest of schema
);
```

### **4. Deployment Recommendations**

**For Production (Free):**
1. **Supabase PostgreSQL** (Best choice)
   - Most generous free tier
   - Excellent documentation
   - Built-in authentication
   - Real-time capabilities
   - Easy to scale

2. **Neon PostgreSQL** (Alternative)
   - Modern serverless architecture
   - Good performance
   - Auto-scaling

**For Development:**
1. **SQLite** (Local development)
   - No setup required
   - Fast and lightweight
   - Easy to reset

2. **Docker + PostgreSQL** (Local server)
   - Production-like environment
   - Easy to manage
   - Consistent across environments

### **Migration Strategy**

**Step 1: Choose Provider**
```bash
# Example: Supabase setup
npm install @supabase/supabase-js
```

**Step 2: Update Connection**
```javascript
// Replace localStorage with database
const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Example: Load assets
const { data: assets } = await db
  .from('assets')
  .select('*');
```

**Step 3: Data Migration**
```javascript
// One-time migration script
const migrateFromLocalStorage = async () => {
  const localAssets = JSON.parse(localStorage.getItem('denr_assets') || '[]');
  const localTransactions = JSON.parse(localStorage.getItem('denr_transactions') || '[]');
  
  // Migrate assets
  for (const asset of localAssets) {
    await db.from('assets').insert(asset);
  }
  
  // Migrate transactions
  for (const transaction of localTransactions) {
    await db.from('transactions').insert(transaction);
  }
};
```

### **Cost Comparison (Free Tiers)**

| Provider | Database | Storage | Bandwidth | Users | Best For |
|----------|----------|---------|-----------|-------|----------|
| Supabase | PostgreSQL | 500MB | 2GB/mo | 50k | Production |
| Neon | PostgreSQL | 3GB | Unlimited | Unlimited | Scaling |
| PlanetScale | MySQL | 5GB | 1B reads/mo | Unlimited | MySQL apps |
| SQLite | SQLite | Unlimited | N/A | N/A | Development |

### **Recommended Setup for DENR System**

**Production:**
```javascript
// Supabase configuration
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Environment variables
SUPABASE_URL=your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

**Development:**
```javascript
// SQLite configuration
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./data/denr_depreciation.db');
```

**Migration Benefits:**
- Real-time collaboration
- Better security
- Scalability
- Backup and recovery
- Multi-user support
- Audit trails
- Performance improvements

All options are **completely free** with no credit card required for initial setup!
