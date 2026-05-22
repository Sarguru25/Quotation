import mongoose from 'mongoose';
import { PERMISSIONS } from './src/lib/rbac/permissions.js';

const MONGODB_URI = 'mongodb+srv://sargurudurai25_db_user:sarguru25@cluster0.7qxfrxg.mongodb.net/';

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  permissions: [{ type: String }],
  isSystemRole: { type: Boolean, default: false }
}, { timestamps: true });

const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);

async function updateRoles() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    // Admin update (make sure Admin has *)
    await Role.updateOne({ name: 'Admin' }, { $addToSet: { permissions: '*' } });
    
    // Manager update
    await Role.updateOne({ name: 'Manager' }, { 
      $addToSet: { 
        permissions: { 
          $each: [
            PERMISSIONS.PRICE_DATA.VIEW, PERMISSIONS.PRICE_DATA.MANAGE,
            PERMISSIONS.CUSTOM_QUOTE.CREATE, PERMISSIONS.CUSTOM_QUOTE.VIEW, PERMISSIONS.CUSTOM_QUOTE.EDIT, PERMISSIONS.CUSTOM_QUOTE.DELETE
          ] 
        } 
      } 
    });

    // Executive update
    await Role.updateOne({ name: 'Executive' }, { 
      $addToSet: { 
        permissions: { 
          $each: [
            PERMISSIONS.PRICE_DATA.VIEW,
            PERMISSIONS.CUSTOM_QUOTE.CREATE, PERMISSIONS.CUSTOM_QUOTE.VIEW, PERMISSIONS.CUSTOM_QUOTE.EDIT
          ] 
        } 
      } 
    });

    // Viewer update
    await Role.updateOne({ name: 'Viewer' }, { 
      $addToSet: { 
        permissions: { 
          $each: [
            PERMISSIONS.PRICE_DATA.VIEW,
            PERMISSIONS.CUSTOM_QUOTE.VIEW
          ] 
        } 
      } 
    });

    console.log('Successfully updated roles with new permissions');
    process.exit(0);
  } catch (error) {
    console.error('Error updating roles:', error);
    process.exit(1);
  }
}

updateRoles();
